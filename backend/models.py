from typing import Annotated, Optional
from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field
from pydantic_core import core_schema


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


class OrdenTallerCreate(OrdenTallerBase):
    pass


class OrdenTallerUpdate(BaseModel):
    placa: Optional[str] = Field(default=None, min_length=3, max_length=100)
    vehiculo_modelo: Optional[str] = Field(default=None, min_length=3, max_length=150)
    falla_reportada: Optional[str] = Field(default=None, min_length=3, max_length=500)
    reparado: Optional[bool] = None


class OrdenTallerResponse(OrdenTallerBase):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[PyObjectId] = Field(default=None, alias="_id")