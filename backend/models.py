import base64
import binascii
from typing import Annotated, Optional
from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic_core import core_schema


MAX_IMAGE_BYTES = 4 * 1024 * 1024
MAX_IMAGE_DATA_URL_LENGTH = 5_600_000
IMAGE_SIGNATURES = {
    "image/jpeg": lambda image: image.startswith(b"\xff\xd8\xff"),
    "image/png": lambda image: image.startswith(b"\x89PNG\r\n\x1a\n"),
    "image/webp": lambda image: image.startswith(b"RIFF") and image[8:12] == b"WEBP",
    "image/gif": lambda image: image.startswith((b"GIF87a", b"GIF89a")),
}


def _validate_imagen_url(value: str) -> str:
    if not value.startswith("data:"):
        return value

    encabezado, separador, contenido = value.partition(",")
    if not separador or not encabezado.endswith(";base64"):
        raise ValueError("La imagen subida debe tener un formato válido")

    tipo_imagen = encabezado[5:-7]
    validar_firma = IMAGE_SIGNATURES.get(tipo_imagen)
    if validar_firma is None:
        raise ValueError("El formato debe ser JPG, PNG, WebP o GIF")

    if len(contenido) > 4 * ((MAX_IMAGE_BYTES + 2) // 3):
        raise ValueError("La imagen debe pesar 4 MB o menos")

    try:
        imagen = base64.b64decode(contenido, validate=True)
    except (binascii.Error, ValueError):
        raise ValueError("La imagen subida no contiene datos válidos") from None

    if not imagen or len(imagen) > MAX_IMAGE_BYTES:
        raise ValueError("La imagen debe pesar entre 1 byte y 4 MB")
    if not validar_firma(imagen):
        raise ValueError("El contenido no coincide con el formato de imagen declarado")
    return value


class _ObjectIdPydanticAnnotation:

    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        def validate(v):
            if isinstance(v, ObjectId):
                return str(v)
            if isinstance(v, str) and ObjectId.is_valid(v):
                return v.lower()
            raise ValueError("ID inválido de MongoDB (ObjectId)")

        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.no_info_plain_validator_function(validate),
            serialization=core_schema.to_string_ser_schema(),
        )


PyObjectId = Annotated[str, _ObjectIdPydanticAnnotation]


class OrdenTallerBase(BaseModel):
    placa: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Placa del vehículo",
        examples=["LOK-963"],
    )
    vehiculo_modelo: str = Field(
        ...,
        min_length=3,
        max_length=150,
        description="Modelo del vehículo",
        examples=["Pontiac Firebird"],
    )
    falla_reportada: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Falla que presenta",
        examples=["Transmisión rota"],
    )
    reparado: bool = Field(
        default=False,
        description="Estado de reparación",
    )
    imagen_url: str = Field(
        default="https://via.placeholder.com/300x180?text=Vehiculo",
        min_length=10,
        max_length=MAX_IMAGE_DATA_URL_LENGTH,
        description="URL pública de la imagen del vehículo",
        examples=["https://images.unsplash.com/photo-1493238792000-8113da705763"],
    )

    @field_validator("imagen_url")
    @classmethod
    def validar_imagen_url(cls, value: str) -> str:
        return _validate_imagen_url(value)


class OrdenTallerCreate(OrdenTallerBase):
    pass


class OrdenTallerUpdate(BaseModel):
    placa: Optional[str] = Field(default=None, min_length=3, max_length=100)
    vehiculo_modelo: Optional[str] = Field(default=None, min_length=3, max_length=150)
    falla_reportada: Optional[str] = Field(default=None, min_length=3, max_length=500)
    reparado: Optional[bool] = None
    imagen_url: Optional[str] = Field(
        default=None,
        min_length=10,
        max_length=MAX_IMAGE_DATA_URL_LENGTH,
    )

    @field_validator("imagen_url")
    @classmethod
    def validar_imagen_url(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        return _validate_imagen_url(value)


class OrdenTallerResponse(OrdenTallerBase):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[PyObjectId] = Field(default=None, alias="_id")