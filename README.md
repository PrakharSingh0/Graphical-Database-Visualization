https://dblens.vercel.app/
# GNN Database Visualizer (Prototype)

This is a minimal prototype for a landing page + Firebase auth + D3-based schema visualizer.


```json
{
  "nodes": [{ "id":"users","label":"users","status":"yellow" }],
  "links": [{ "source":"orders","target":"users","weight":3 }]
}
```

Next steps
- Add backend connectors for real DBs and schema extraction
- Integrate GNN inference service (PyTorch Geometric) on the backend and return annotations
- Improve animations and interactivity per design
