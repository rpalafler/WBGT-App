import React, { useState, useContext, useEffect, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, ScatterplotLayer } from "@deck.gl/layers"; // 📍 Importamos ScatterplotLayer
import BasemapSwitcher from "../../components/Buttons/BasemapSwitcher/BasemapSwitcher";
import SearchButton from "../../components/Buttons/SearchButton/SearchButton";
import LocateButton from "../../components/Buttons/LocateButton/LocateButton";
// import MoreInfoButton from "../../components/Buttons/MoreInfoButton/MoreInfoButton";
import styles from "./MapView.module.css";
import HamburgerMenu from "../../components/Buttons/HamburgerMenu/HamburgerMenu";
import { AppContext } from "../../Context"; // Importamos el Context
import ScaleBar from "../../components/MapTools/ScaleBar/ScaleBar";
import SliderControl from "../../components/MapTools/SliderControl/SliderControl";
import AIChat from "../../components/MapTools/Chatbox/Chatbox"; // Import the SimpleChat component

import TempScaleVertical from "../../components/MapTools/TempScaleVertical/TempScaleVertical";
import LiveButton from "../../components/Buttons/LiveButton/LiveButton";

import GaugeView from "../../components/MapTools/GaugeView/GaugeView";

const MapView = () => {
  const mapContainerRef = useRef(null); // Reference for the map container for screenshots

  const { viewState, setViewState } = useContext(AppContext); // Usamos el contexto
  const { windowWidth, setWindowWidth } = useContext(AppContext); // Usamos el contexto
  const { pinCoords, setPinCoords } = useContext(AppContext); // Usamos el contexto

  const [userLocation, setUserLocation] = useState(null); // 📍 Estado para guardar la ubicación del usuario

  // Este estado controlará si los demás botones están visibles o no:
  const { isCollapsed } = useContext(AppContext);
  // Esto es para ver si se ha producido un doble click para mostrar el pin y las coordendas del gauge chart
  const [lastClickTime, setLastClickTime] = useState(0);

  // 📌 Actualiza windowWidth dinámicamente al cambiar el tamaño
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // 🧹 Cleanup: elimina el listener al desmontar
    return () => window.removeEventListener("resize", handleResize);
  });

  const [basemapUrl, setBasemapUrl] = useState(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
  );

  const basemaps = {
    OpenStreetMap: {
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      label: windowWidth < 768 ? "Open Street Map" : "Open Street Map",
    },
    GoogleXYZ: {
      url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      label: windowWidth < 768 ? "Google XYZ" : "Google XYZ",
    },
    GoogleTopography: {
      url: "http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
      label: windowWidth < 768 ? "Google Topography" : "Google Topography",
    },
  };

  const tileLayer = new TileLayer({
    id: "TileLayer",
    data: basemapUrl,
    maxZoom: 19,
    minZoom: 0,
    renderSubLayers: (props) => {
      const { boundingBox } = props.tile;
      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [
          boundingBox[0][0],
          boundingBox[0][1],
          boundingBox[1][0],
          boundingBox[1][1],
        ],
      });
    },
    pickable: true,
  });

  // 📍 Función para obtener la ubicación del usuario y mostrar un marcador
  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude }); // 📍 Guardamos la ubicación en el estado

        setViewState((prev) => ({
          ...prev,
          latitude,
          longitude,
          zoom: 17, // Ajustable
        }));
      },
      (error) => {
        alert(
          "Unable to retrieve your location. Make sure location is enabled."
        );
        console.error("Geolocation error:", error);
      }
    );
  };

  const handleLocationSelect = ({ latitude, longitude, boundingBox }) => {
    let zoom = 10;

    if (boundingBox) {
      const latDiff = Math.abs(boundingBox[0] - boundingBox[1]);
      const lonDiff = Math.abs(boundingBox[2] - boundingBox[3]);

      if (latDiff > 10 || lonDiff > 10) zoom = 4;
      else if (latDiff > 5 || lonDiff > 5) zoom = 6;
      else if (latDiff > 1 || lonDiff > 1) zoom = 10;
      else zoom = 14;
    }

    setViewState((prev) => ({
      ...prev,
      latitude,
      longitude,
      zoom,
    }));
  };

  // 📍 Agregar capa de marcador para la ubicación del usuario
  const userLocationLayer =
    userLocation &&
    new ScatterplotLayer({
      id: "user-location",
      data: [{ position: [userLocation.longitude, userLocation.latitude] }],
      getPosition: (d) => d.position,
      getRadius: 30, // Radio del punto (ajustable)
      getFillColor: [0, 0, 255, 200], // Azul con opacidad
      pickable: false,
    });
  const pinLayer =
    pinCoords &&
    new ScatterplotLayer({
      id: "manual-pin",
      data: [{ position: [pinCoords.longitude, pinCoords.latitude] }],
      getPosition: (d) => d.position,
      getRadius: 1000,
      getFillColor: [255, 0, 0, 200],
      pickable: false,
    });

  const imageLayer = new BitmapLayer({
    id: "heatmap-layer",
    image: "/heatmap.jpg", // Ruta relativa (asumiendo desde public/)
    bounds: [
      -116.83160400390625, 32.56388473510742, -115.09870910644531,
      34.11175537109375,
    ],
    opacity: 0.3,
    desaturate: 0,
    pickable: false,
    parameters: {
      depthTest: false,
    },
  });
  // _______________________________________________________________________________
  // _______________________________________________________________________________
  // Aqui estamos definiendo la funcion que vamos a usar para detectar tics en el mapa para mostrar o no mostrar el
  // gauge component
  const { isGaugeActive, setIsGaugeActive } = useContext(AppContext); // Usamos el contexto

  const handleMapClick = () => {
    setIsGaugeActive((prev) => !prev); // Si está activo, se desactiva y viceversa
    // console.log(isGaugeActive);
  };

  // Para telefonos tengo que hacer una logica manual, ya que no existe onDoubleTouch o algo asi

  const [lastTap, setLastTap] = useState(0);

  const handleTouchStart = () => {
    const now = Date.now();
    const TAP_DELAY = 300; // Máximo tiempo entre dos toques para considerarlo doble toque

    if (now - lastTap < TAP_DELAY) {
      setIsGaugeActive((prev) => !prev); // Activa/desactiva el Gauge
    }

    setLastTap(now); // Guarda el tiempo del último toque
  };

  // _______________________________________________________________________________
  return (
    <div
      className={styles.mapContainer}
      ref={mapContainerRef}
      onDoubleClick={handleMapClick} // Para ordenadores
      onTouchStart={handleTouchStart} // ✅ Funciona en móviles
    >
      {/*  */}
      {isGaugeActive && <GaugeView />}
      {/* Menú Hamburguesa */}
      {<HamburgerMenu />}

      {/* 📍 Título visible en la parte superior */}
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>RHI Alarm</h1>
        <h2 className={styles.subtitle}>Wet Bulb Globe Temp Data</h2>
      </div>
      {/* Incluimos aquí la escala de la variable leida*/}
      <div>
        <TempScaleVertical />
      </div>
      <div
        className={`${styles.controlPanel} ${
          isCollapsed ? styles.collapsed : ""
        }`}
      >
        <BasemapSwitcher
          className={styles.panelButton}
          basemaps={basemaps}
          onBasemapChange={setBasemapUrl}
        />
        {!isCollapsed && (
          <>
            <SearchButton
              className={styles.panelButton}
              onLocationSelect={handleLocationSelect}
            />
            <LocateButton
              className={styles.panelButton}
              onLocate={handleLocate}
            />
            <LiveButton></LiveButton>
          </>
        )}
      </div>
      {/* Slider para seleccionar fecha y hora de los datos a mostrar */}
      {!isGaugeActive && <SliderControl />}
      <DeckGL
        viewState={viewState}
        controller={{
          dragPan: true,
          scrollZoom: true,
          doubleClickZoom: false, // 🔹 Desactiva el zoom con doble clic
          touchZoom: true,
          touchRotate: true,
          keyboard: true,
          minZoom: 7.8,
          maxZoom: 20,
        }}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        onClick={(info) => {
          const now = Date.now();
          const DOUBLE_CLICK_DELAY = 300;

          if (now - lastClickTime < DOUBLE_CLICK_DELAY && info.coordinate) {
            const [longitude, latitude] = info.coordinate;
            setPinCoords({ latitude, longitude });
            console.log("📍 Doble clic manual detectado:", latitude, longitude);
          }

          setLastClickTime(now);
        }}
        // _______________________________________________________________________________
        // AÑADO LA IMAGEN TEMPORALMENTE
        layers={[tileLayer, userLocationLayer, imageLayer, pinLayer].filter(
          Boolean
        )} // 📍 Agregamos el marcador al mapa
        // _______________________________________________________________________________
        getTooltip={({ coordinate }) =>
          coordinate &&
          `Lat: ${Math.abs(coordinate[1]).toFixed(2)}° ${
            coordinate[1] >= 0 ? "N" : "S"
          }\nLon: ${Math.abs(coordinate[0]).toFixed(2)}° ${
            coordinate[0] >= 0 ? "E" : "W"
          }`
        }
      />
      {/* Añadimos la barra de escala, de manera que solo se mostrará en caso de que la pantalla sea mas grande
      que la de un movil y no está activo el gauge chart */}
      {!(windowWidth < 768 && isGaugeActive) && <ScaleBar />}

      {/* Add the SimpleChat component */}
      <AIChat applicationRef={mapContainerRef} />
    </div>
  );
};

export default MapView;
