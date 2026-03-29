import networkx as nx


# -----------------------------
# GRAPH BUILDING
# -----------------------------
def build_graph(schema):
    G = nx.DiGraph()

    for node in schema["nodes"]:
        G.add_node(node["id"], data=node)

    for edge in schema["edges"]:
        G.add_edge(edge["source"], edge["target"])

    return G


# -----------------------------
# DETECTIONS
# -----------------------------
def detect_orphans(G):
    return list(nx.isolates(G))


def detect_cycles(G):
    return list(nx.simple_cycles(G))


def detect_high_degree(G, threshold=3):
    degree = dict(G.degree())
    return [node for node, deg in degree.items() if deg >= threshold]


def has_primary_key(node):
    for col in node.get("columns", []):
        # Case 1: column is string
        if isinstance(col, str):
            if col.lower() == "id":
                return True

        # Case 2: column is dict
        elif isinstance(col, dict):
            if col.get("primary_key"):
                return True

    return False


def has_foreign_key(node, schema):
    table = node["id"]

    for edge in schema.get("edges", []):
        if edge.get("source") == table or edge.get("target") == table:
            return True

    return False


# -----------------------------
# RISK SCORING
# -----------------------------
def calculate_risk(G, schema):
    results = []

    orphans = detect_orphans(G)
    cycles = detect_cycles(G)
    high_degree = detect_high_degree(G)

    for node in schema["nodes"]:
        table = node["id"]
        score = 0
        issues = []
        suggestions = []

        # ❌ Missing Primary Key
        if not has_primary_key(node):
            score += 40
            issues.append("missing_primary_key")
            suggestions.append("Add a PRIMARY KEY to uniquely identify rows")

        # ❌ No Foreign Key
        if not has_foreign_key(node, schema):
            score += 20
            issues.append("no_relationships")
            suggestions.append("Add FOREIGN KEY constraints for relational integrity")

        # ❌ Orphan Table
        if table in orphans:
            score += 20
            issues.append("orphan_table")
            suggestions.append("Connect this table with other tables")

        # ❌ High Dependency
        if table in high_degree:
            score += 15
            issues.append("high_dependency")
            suggestions.append("Consider splitting this table to reduce coupling")

        # ❌ Circular Dependency
        for cycle in cycles:
            if table in cycle:
                score += 25
                issues.append("circular_dependency")
                suggestions.append("Break circular dependencies between tables")
                break

        results.append({
            "table": table,
            "risk_score": min(score, 100),
            "issues": issues,
            "suggestions": suggestions
        })

    return results


# -----------------------------
# MAIN ANALYZER
# -----------------------------
def analyze_schema(schema):
    G = build_graph(schema)

    return {
        "summary": {
            "total_tables": len(schema["nodes"]),
            "total_relations": len(schema["edges"])
        },
        "analysis": calculate_risk(G, schema),
        "global_issues": {
            "orphans": detect_orphans(G),
            "cycles": detect_cycles(G)
        }
    }