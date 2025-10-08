# 🧠 **SchemaLens — Explainable GNN Visualization for Database Schemas**

> *Bringing transparency to Graph Neural Network reasoning in database systems.*

---

## 📘 **Overview**

**SchemaLens** is an interactive visualization and explainability platform designed to **analyze, interpret, and visualize database schemas using Graph Neural Networks (GNNs)**.

Traditional database optimization tools rely on static metrics — SchemaLens introduces intelligence and interpretability by **mapping relational schemas to graph structures** and visualizing how a GNN model evaluates and reasons about those structures.

This enables developers, researchers, and data engineers to **see not just the predictions, but the reasoning behind them** — such as which relationships and features most influence model outcomes.

---

## 🚀 **Key Features**

| Category | Description |
|-----------|--------------|
| 🗺️ **Schema Graph Visualization** | Interactive display of database tables and their relationships using **Cytoscape.js** |
| 🔍 **Node Inspector Panel** | On-click display of raw features (columns, keys, row counts, etc.) and GNN predictions |
| 🎨 **Color & Size Encoding** | Nodes visually represent model outputs (e.g., “risk” scores) through color and scale |
| 🔗 **Edge Importance Highlighting** | Identify relationships most influential in the GNN’s decision process |
| 🔬 **Explainability Layer (XAI)** | Uses **GNNExplainer** and attention weights to illustrate information flow |
| ⚡ **Dynamic Layouts & Animations** | Support for **Dagre**, **Force-directed**, and real-time message-passing visualization *(upcoming)* |

---

## 🧩 **Tech Stack**

### 🖥️ Frontend
- **React.js** – component-based UI framework  
- **Cytoscape.js** + `react-cytoscapejs` – graph visualization and manipulation  
- **Tailwind CSS** – responsive, modern design system  
- **Framer Motion** *(planned)* – high-quality animations and visual effects  

### ⚙️ Backend *(in development)*
- **FastAPI** – asynchronous API for inference and explanation endpoints (`/infer`, `/explain`)  
- **PyTorch Geometric (PyG)** – GNN training and explainability (`GNNExplainer`, `Captum`)  
- **NetworkX / Pandas** – preprocessing for graph construction and schema feature extraction  
- **Docker** – portable deployment environment  

---