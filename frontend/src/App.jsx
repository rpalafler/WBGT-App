// src/App.jsx
import React from "react";
import AppRoutes from "./routes/AppRoutes"; // Importamos las rutas

function App() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <AppRoutes /> {/* Renderizamos las rutas */}
    </div>
  );
}

export default App;
