// src/App.jsx
import { Routes, Route } from "react-router-dom";
import VisualizationPage from "./pages/VisualizationPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<VisualizationPage />} />
        <Route path="/connections" element={<ConnectionsPage />} />
      </Routes>
    </div>
  );
}

export default App;
