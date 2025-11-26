# app/utils/exporter.py
from pathlib import Path
from datetime import datetime
import json

# Directory where exported schemas will be written
# .../schemalens-backend/app/exports
EXPORT_DIR = Path(__file__).resolve().parent.parent / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


def export_schema(schema: dict, prefix: str = "schema") -> str:
    """
    Save schema as JSON in app/exports and return a URL path like:
      "/app/exports/<filename>.json"

    NOTE: this returns a *web path* that the frontend can fetch directly.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{prefix}_{timestamp}.json"
    file_path = EXPORT_DIR / filename

    with file_path.open("w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2)

    # IMPORTANT: this is the URL path the server will serve (see main.py mount)
    
    return f"/app/exports/{filename}"
