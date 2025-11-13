import json, os
from app.settings import settings

def export_schema(schema: dict, prefix: str = "schema"):
    file_path = os.path.join(settings.EXPORT_DIR, f"{prefix}.json")
    with open(file_path, "w") as f:
        json.dump(schema, f, indent=2)
    return file_path
