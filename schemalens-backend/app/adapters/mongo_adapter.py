# app/adapters/mongo_adapter.py
from pymongo import MongoClient
from bson import ObjectId
from typing import Dict, List
import re

def _guess_collection_from_field(field_name: str) -> str:
    # heuristic: "user_id" -> "users", "profileId" -> "profile"
    if field_name.endswith("_id"):
        return field_name[:-3]
    # camelCase heuristic
    m = re.match(r"(.+)[I|i]d$", field_name)
    if m:
        return m.group(1).lower()
    return field_name

def _type_name(val):
    if isinstance(val, ObjectId):
        return "ObjectId"
    if isinstance(val, bool):
        return "bool"
    if isinstance(val, int):
        return "int"
    if isinstance(val, float):
        return "float"
    if isinstance(val, dict):
        return "object"
    if isinstance(val, list):
        return "array"
    if val is None:
        return "null"
    return type(val).__name__

def extract_mongo_schema(mongo_uri: str, db_name: str, sample_limit: int = 200) -> Dict:
    """
    Connect to MongoDB and infer schema from sample documents.
    Returns unified { database, db_type, nodes, edges } format.
    """
    client = MongoClient(mongo_uri)
    db = client[db_name]
    nodes: List[Dict] = []
    edges: List[Dict] = []

    try:
        coll_names = db.list_collection_names()
    except Exception as e:
        raise RuntimeError(f"Failed to list collections: {e}")

    for coll in coll_names:
        coll_ref = db[coll]
        samples = list(coll_ref.find().limit(sample_limit))
        field_info = {}  # field -> set(types)
        for doc in samples:
            for k, v in doc.items():
                t = _type_name(v)
                field_info.setdefault(k, set()).add(t)

        col_entries = []
        for f in sorted(field_info.keys()):
            types = sorted(field_info[f])
            if f == "_id":
                col_entries.append(f"{f} (PK)")
            elif f.endswith("_id") or "ObjectId" in types:
                # heuristic reference
                guessed = _guess_collection_from_field(f)
                col_entries.append(f"{f} (FK:{guessed})")
                edges.append({"source": coll, "target": guessed})
            else:
                col_entries.append(f"{f} ({'|'.join(types)})" if len(types) > 1 else f)

        nodes.append({
            "id": coll,
            "label": coll.replace("_", " ").title(),
            "columns": col_entries,
            "sample_count": len(samples)
        })

    schema = {
        "database": db_name,
        "db_type": "mongodb",
        "nodes": nodes,
        "edges": edges
    }
    return schema
