import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "taller_automotriz_db")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "ordenes_servicio")

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]
ordenes_servicio_collection = db[COLLECTION_NAME]