import React from "react";
import AppRoutes from "./routes/AppRoutes"; // Importamos las rutas
import { AppProvider } from "./Context";

function App() {
  return (
    <AppProvider>
      <div style={{ width: "100%", height: "100%" }}>
        <AppRoutes /> {/* Renderizamos las rutas */}
      </div>
    </AppProvider>
  );
}

export default App;
