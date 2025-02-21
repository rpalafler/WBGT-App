import { createContext, useState } from "react";

export const AppContext = createContext();

// El nombre de AppProvides es un poco confuso, ya que despues usamos AppContext.Provider, por lo que me confunde
// sin embargo, AppProvider es un componente de react que va a actuar como el que engloba y envuelve al resto de la App,
// de manera que podamos alimentar a nuestros hijos con las variables que declaremos aqui, por lo que 'AppProvider' podria
// cambiarse por cualquier otro nombre, y el importante es AppContext, que es el que actua como el 'Provider' de las variables
// globales que estamos definiendo aqui
export const AppProvider = ({ children }) => {
  const [viewState, setViewState] = useState({
    longitude: -115.92,
    latitude: 33.38,
    zoom: 8.8,
    pitch: 0,
    bearing: 0,
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  // Este estado controlará si los demás botones están visibles o no:
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <AppContext.Provider
      value={{
        viewState,
        setViewState,
        windowWidth,
        setWindowWidth,
        isCollapsed,
        setIsCollapsed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
