from typing import List, Optional
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from database import ordenes_collection
from models import OrdenTallerCreate, OrdenTallerResponse, OrdenTallerUpdate

app = FastAPI(
    title="MotorTech - API Taller Automotriz",
    description="API RESTful asíncrona con FastAPI, Motor y MongoDB",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _parse_object_id(orden_id: str) -> ObjectId:
    try:
        return ObjectId(orden_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de orden no válido",
        )


@app.get("/ordenes", response_model=List[OrdenTallerResponse])
async def listar_ordenes(reparado: Optional[bool] = Query(default=None)):
    filtro = {} if reparado is None else {"reparado": reparado}
    documentos = await ordenes_collection.find(filtro).to_list(length=1000)
    return documentos


@app.post(
    "/ordenes",
    response_model=OrdenTallerResponse,
    status_code=status.HTTP_201_CREATED,
)
async def crear_orden(orden: OrdenTallerCreate):
    nueva_orden = orden.model_dump()
    resultado = await ordenes_collection.insert_one(nueva_orden)
    creada = await ordenes_collection.find_one({"_id": resultado.inserted_id})
    return creada


@app.put("/ordenes/{orden_id}", response_model=OrdenTallerResponse)
async def actualizar_orden(orden_id: str, datos: OrdenTallerUpdate):
    oid = _parse_object_id(orden_id)
    actualizacion = {k: v for k, v in datos.model_dump().items() if v is not None}

    if not actualizacion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se enviaron campos para actualizar",
        )

    resultado = await ordenes_collection.find_one_and_update(
        {"_id": oid},
        {"$set": actualizacion},
        return_document=True,
    )
    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden no encontrada",
        )
    return resultado


@app.delete("/ordenes/{orden_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_orden(orden_id: str):
    oid = _parse_object_id(orden_id)
    resultado = await ordenes_collection.delete_one({"_id": oid})
    if resultado.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden no encontrada",
        )
    return None