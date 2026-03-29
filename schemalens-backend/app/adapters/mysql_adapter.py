from sqlalchemy import create_engine, inspect

def extract_mysql_schema(connection_url):
    engine = create_engine(connection_url)
    inspector = inspect(engine)

    tables = inspector.get_table_names()
    nodes = []
    edges = []

    for table in tables:
        columns = inspector.get_columns(table)

        nodes.append({
            "id": table,
            "columns": [col["name"] for col in columns]
        })

        fks = inspector.get_foreign_keys(table)
        for fk in fks:
            edges.append({
                "source": table,
                "target": fk["referred_table"]
            })

    return {"nodes": nodes, "edges": edges}