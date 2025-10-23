import { createContext, useState } from "react";
import { WebMercatorViewport } from "@deck.gl/core";

export const AppContext = createContext();
//
// El nombre de AppProvides es un poco confuso, ya que despues usamos AppContext.Provider, por lo que me confunde
// sin embargo, AppProvider es un componente de react que va a actuar como el que engloba y envuelve al resto de la App,
// de manera que podamos alimentar a nuestros hijos con las variables que declaremos aqui, por lo que 'AppProvider' podria
// cambiarse por cualquier otro nombre, y el importante es AppContext, que es el que actua como el 'Provider' de las variables
// globales que estamos definiendo aqui

export const AppProvider = ({ children }) => {
  //_____________________________________________________________________
  //_____________________________________________________________________
  //_____________________________________________________________________
  //_____________________________________________________________________

  const BOUNDS = [
    [-116.3, 32.6],
    [-114.7, 34.3],
  ];

  // WBGT filter range (°F)
  const [wbgtFilterRangeF, setWbgtFilterRangeF] = useState(null);

  // Si tienes overlays fijos (sidebar izquierda, panel inferior) que restan área visible,
  // pon aquí sus tamaños iniciales en px. Si no, déjalos en 0.
  const SIDEBAR_LEFT_PX = 0;
  const BOTTOM_PANEL_PX = 0;
  const VIEW_PADDING = 0; // padding extra (px) si quieres margen visible
  const MAX_ZOOM = 16; // por seguridad

  // Utils: aproximación de aspecto "real" de tus bounds en Mercator
  function boundsAspectRatio([minLng, minLat], [maxLng, maxLat]) {
    const dLon = Math.max(1e-9, maxLng - minLng);
    const dLat = Math.max(1e-9, maxLat - minLat);
    // corregimos por latitud media (aproximación Mercator)
    const latMidRad = (minLat + maxLat) * 0.5 * (Math.PI / 180);
    const widthAdj = dLon * Math.cos(latMidRad);
    const heightAdj = dLat;
    return widthAdj / heightAdj; // ancho/alto
  }

  function getInitialCoverViewState() {
    // 1) área visible inicial (si tu mapa ocupa toda la ventana)
    const width = Math.max(1, window.innerWidth - SIDEBAR_LEFT_PX);
    const height = Math.max(1, window.innerHeight - BOTTOM_PANEL_PX);

    // 2) Fit para que "quepa" (sin padding o con el que quieras)
    const base = new WebMercatorViewport({
      width,
      height,
      longitude: 0,
      latitude: 0,
      zoom: 0,
    }).fitBounds(BOUNDS, {
      padding: VIEW_PADDING, // puede ser número o {top,right,bottom,left}
    });

    // 3) Calcular delta de zoom para "cubrir" según relación de aspecto
    const aspectViewport = width / height;
    const aspectBounds = boundsAspectRatio(BOUNDS[0], BOUNDS[1]);

    // delta ~ |log2(A_v / A_b)|  (si A_v > A_b falta alto; si A_v < A_b faltan lados)
    const deltaZoom = Math.abs(Math.log2(aspectViewport / aspectBounds));

    // Pequeña seguridad extra para evitar líneas de borde (opcional)
    const SAFETY = 0.06;

    const zoomCover = Math.min(MAX_ZOOM, base.zoom + deltaZoom + SAFETY);

    return {
      longitude: base.longitude,
      latitude: base.latitude,
      zoom: zoomCover,
      pitch: 0,
      bearing: 0,
    };
  }
  //_____________________________________________________________________
  //_____________________________________________________________________
  //_____________________________________________________________________
  //_____________________________________________________________________
  //_____________________________________________________________________
  //_____________________________________________________________________

  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  //_____________________________________________________________________
  //_____________________________________________________________________
  //_____________________________________________________________________
  //_____________________________________________________________________
  // const [viewState, setViewState] = useState({
  //   longitude: window.innerWidth <= 768 ? -115.72 : -115.75,
  //   latitude: window.innerWidth <= 768 ? 33 : 33.38,
  //   zoom: window.innerWidth <= 768 ? 7.5 : 8.5,
  //   pitch: 0,
  //   bearing: 0,
  // });
  const [viewState, setViewState] = useState(() => getInitialCoverViewState());
  //_____________________________________________________________________
  //_____________________________________________________________________
  //_____________________________________________________________________
  //_____________________________________________________________________

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
        isBottomPanelOpen,
        setIsBottomPanelOpen,
        wbgtFilterRangeF,
        setWbgtFilterRangeF,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
