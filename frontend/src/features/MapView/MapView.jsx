import React, { useState, useContext, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, ScatterplotLayer } from "@deck.gl/layers"; // 📍 Importamos ScatterplotLayer
import BasemapSwitcher from "../../components/Buttons/BasemapSwitcher/BasemapSwitcher";
import SearchButton from "../../components/Buttons/SearchButton/SearchButton";
import LocateButton from "../../components/Buttons/LocateButton/LocateButton";
import MoreInfoButton from "../../components/Buttons/MoreInfoButton/MoreInfoButton";
import styles from "./MapView.module.css";
import HamburgerMenu from "../../components/Buttons/HamburgerMenu/HamburgerMenu";
import { AppContext } from "../../Context"; // Importamos el Context
import ScaleBar from "../../components/MapTools/ScaleBar/ScaleBar";

const MapView = () => {
  const { viewState, setViewState } = useContext(AppContext); // Usamos el contexto
  const { windowWidth, setWindowWidth } = useContext(AppContext); // Usamos el contexto

  const [userLocation, setUserLocation] = useState(null); // 📍 Estado para guardar la ubicación del usuario

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
      label: windowWidth < 768 ? "OSM" : "OpenStreetMap",
    },
    GoogleXYZ: {
      url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      label: windowWidth < 768 ? "GGL" : "GoogleXYZ",
    },
    GoogleTopography: {
      url: "http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
      label: windowWidth < 768 ? "Topo" : "GoogleTopography",
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
  // _______________________________________________________________________________
  // LAYER TEMPORAL
  const imageLayer = new BitmapLayer({
    id: "heatmap-layer",
    image: "/heatmap.jpg", // Ruta relativa (asumiendo desde public/)
    bounds: [
      -116.83160400390625, 32.56388473510742, -115.09870910644531,
      34.11175537109375,
    ],
    opacity: 0.3,
    desaturate: 0,
    visible: true,
    pickable: false,
    parameters: {
      depthTest: false,
    },
  });
  // _______________________________________________________________________________

  return (
    <div className={styles.mapContainer}>
      {/* Menú Hamburguesa */}
      <HamburgerMenu />
      {/* 📍 Título visible en la parte superior */}
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>RHI Alarm</h1>
        <h2 className={styles.subtitle}>Wet Bulb Globe Temp Data</h2>
      </div>
      <div className={styles.controlPanel}>
        <BasemapSwitcher
          className={styles.panelButton}
          basemaps={basemaps}
          onBasemapChange={setBasemapUrl}
        />
        <SearchButton
          className={styles.panelButton}
          onLocationSelect={handleLocationSelect}
        />
        <LocateButton className={styles.panelButton} onLocate={handleLocate} />
        <MoreInfoButton className={styles.panelButton} to="/about" />
      </div>
      <DeckGL
        viewState={viewState}
        controller={true}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        // _______________________________________________________________________________
        // AÑADO LA IMAGEN TEMPORALMENTE
        layers={[tileLayer, userLocationLayer, imageLayer].filter(Boolean)} // 📍 Agregamos el marcador al mapa
        // _______________________________________________________________________________
        getTooltip={({ coordinate }) =>
          coordinate &&
          `Latitude: ${coordinate[1].toFixed(
            2
          )}, Longitude: ${coordinate[0].toFixed(2)}`
        }
      />
      <ScaleBar /> {/* Añadimos la barra de escala */}
    </div>
  );
};

export default MapView;
