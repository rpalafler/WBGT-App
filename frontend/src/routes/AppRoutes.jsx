import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapView from "../features/MapView/MapView"; // Página principal con el mapa
import About from "../features/About/About"; // Página explicativa del proyecto

// ____________________________________________________
import WBGTData from "../components/WBGTData";
// ____________________________________________________

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapView />} /> {/* Página inicial */}
        <Route path="/about" element={<About />} /> {/* Página del proyecto */}
        {/* ____________________________________________ */}
        {/* Hemos creado el siguiente enrutado para poder comprobar antes de incluir nada mas en el proyecto global
        que funciona nuestra API, por lo que simplemente hemos creado un contenedor basico para mostrar lo que llega 
        del request a nuestra API  */}
        <Route path="/wbgt" element={<WBGTData />} />
        {/* ____________________________________________ */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
