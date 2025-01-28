import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapView from "../features/MapView/MapView"; // Página principal con el mapa
import About from "../features/About/About"; // Página explicativa del proyecto

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapView />} /> {/* Página inicial */}
        <Route path="/about" element={<About />} /> {/* Página del proyecto */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
