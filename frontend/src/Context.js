import { createContext, useState } from "react";

export const AppContext = createContext();

// El nombre de AppProvides es un poco confuso, ya que despues usamos AppContext.Provider, por lo que me confunde
// sin embargo, AppProvider es un componente de react que va a actuar como el que engloba y envuelve al resto de la App,
// de manera que podamos alimentar a nuestros hijos con las variables que declaremos aqui, por lo que 'AppProvider' podria
// cambiarse por cualquier otro nombre, y el importante es AppContext, que es el que actua como el 'Provider' de las variables
// globales que estamos definiendo aqui

export const AppProvider = ({ children }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [viewState, setViewState] = useState({
    longitude: window.innerWidth <= 768 ? -115.72 : -115.75,
    latitude: window.innerWidth <= 768 ? 33 : 33.38,
    zoom: window.innerWidth <= 768 ? 7.5 : 8.8,
    pitch: 0,
    bearing: 0,
  });
  // Este estado controlará si los demás botones están visibles o no dentro del panel de control:
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Las siguientes variables son las que uso para que el usuario pueda seleccionar la fecha y hora de los datos a mostrar
  const now = new Date();
  const initialDate = now.toLocaleDateString("en-CA"); // Formato YYYY-MM-DD en la zona horaria local
  const initialHour = now.getHours(); // Hora en la zona del usuario
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [wbgtData, setWBGTData] = useState(null);
  const [selectedWBGTValue, setSelectedWBGTValue] = useState(null);

  // Ahora vamos a definir las variables necesarias para el gauge component
  const [isGaugeActive, setIsGaugeActive] = useState(true);
  const [pinCoords, setPinCoords] = useState({
    latitude: 32.979,
    longitude: -115.538,
  }); // { latitude, longitude }

  return (
    <AppContext.Provider
      value={{
        selectedWBGTValue,
        setSelectedWBGTValue,
        wbgtData,
        setWBGTData,
        viewState,
        setViewState,
        windowWidth,
        setWindowWidth,
        isCollapsed,
        setIsCollapsed,
        selectedDate,
        setSelectedDate,
        selectedHour,
        setSelectedHour,
        isGaugeActive,
        setIsGaugeActive,
        pinCoords,
        setPinCoords,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
