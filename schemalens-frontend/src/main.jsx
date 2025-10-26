import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VisualizationPage from "./pages/VisualizationPage";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VisualizationPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
