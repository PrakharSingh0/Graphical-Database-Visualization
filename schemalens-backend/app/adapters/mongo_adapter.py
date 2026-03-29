from pymongo import MongoClient

def extract_mongo_schema(uri, db_name):
    client = MongoClient(uri)
    if not db_name:
        raise ValueError("Database name is required for MongoDB")

    db = client[db_name]

    nodes = []
    edges = []

    for collection_name in db.list_collection_names():
        collection = db[collection_name]

        sample_docs = list(collection.find().limit(20))
        fields = set()

        for doc in sample_docs:
            fields.update(doc.keys())

        nodes.append({
            "id": collection_name,
            "columns": list(fields)
        })

    return {"nodes": nodes, "edges": edges}