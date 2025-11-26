# app/adapters/mysql_adapter.py
from typing import Dict, List, Optional
from sqlalchemy import create_engine, inspect
from sqlalchemy.engine import Engine


def _ensure_mysql_url(url: str) -> str:
    """
    Ensure the URL is a SQLAlchemy-compatible MySQL URL.
    Accepts things like:
      - mysql://user:pass@host:3306/db
    and converts to:
      - mysql+pymysql://user:pass@host:3306/db
    """
    if url.startswith("mysql+pymysql://"):
        return url
    if url.startswith("mysql://"):
        return "mysql+pymysql://" + url[len("mysql://") :]
    # if user already provided full dialect+driver, just return
    return url


def extract_mysql_schema(mysql_url: str, db_name: Optional[str] = None) -> Dict:
    """
    Connect to MySQL and extract schema using SQLAlchemy's inspection.
    Returns unified { database, db_type, nodes, edges } format.
    """
    url = _ensure_mysql_url(mysql_url)

    # If db_name is given and not already in URL, you can optionally enforce it
    # but MySQL URLs usually contain the DB name. We'll just log/ignore here.
    # The inspector will read from whatever database is in the URL.

    engine: Engine = create_engine(url)
    inspector = inspect(engine)

    # Try to detect the database name if not explicitly given
    if db_name is None:
        try:
            # For MySQL, inspector.engine.url.database usually works
            db_name = inspector.engine.url.database
        except Exception:
            db_name = None

    nodes: List[Dict] = []
    edges: List[Dict] = []

    # Get all tables
    table_names = inspector.get_table_names()

    # Prepare foreign keys info: for edges
    fk_map = {}  # table -> list of foreign key dicts
    for table in table_names:
        fks = inspector.get_foreign_keys(table)
        fk_map[table] = fks
        for fk in fks:
            referred_table = fk.get("referred_table")
            if referred_table:
                edges.append({
                    "source": table,
                    "target": referred_table
                })

    # Now build node info
    for table in table_names:
        cols = inspector.get_columns(table)
        pk_constraint = inspector.get_pk_constraint(table)
        pk_cols = set(pk_constraint.get("constrained_columns") or [])

        fk_for_table = fk_map.get(table, [])
        fk_columns = set()
        fk_targets_by_col = {}
        for fk in fk_for_table:
            for col in fk.get("constrained_columns", []):
                fk_columns.add(col)
                fk_targets_by_col[col] = fk.get("referred_table")

        columns_entries: List[str] = []
        for col in cols:
            name = col["name"]
            col_type = str(col.get("type"))
            parts = [name]

            # annotate PK / FK
            if name in pk_cols:
                parts.append("(PK)")
            if name in fk_columns:
                tgt = fk_targets_by_col.get(name)
                if tgt:
                    parts.append(f"(FK:{tgt})")
                else:
                    parts.append("(FK)")

            # include type info
            parts.append(f"[{col_type}]")

            columns_entries.append(" ".join(parts))

        nodes.append({
            "id": table,
            "label": table.replace("_", " ").title(),
            "columns": columns_entries,
            "row_count": None,  # could be filled using SELECT COUNT(*) if desired
        })

    schema = {
        "database": db_name,
        "db_type": "mysql",
        "nodes": nodes,
        "edges": edges,
    }
    return schema
