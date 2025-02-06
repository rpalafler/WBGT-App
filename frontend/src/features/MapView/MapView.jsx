import React, { useState } from "react";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, ScatterplotLayer } from "@deck.gl/layers"; // 📍 Importamos ScatterplotLayer
import BasemapSwitcher from "../../components/Buttons/BasemapSwitcher/BasemapSwitcher";
import SearchButton from "../../components/Buttons/SearchButton/SearchButton";
import LocateButton from "../../components/Buttons/LocateButton/LocateButton";
import Button from "../../components/Buttons/Button/Button";
import styles from "./MapView.module.css";

const MapView = () => {
  const [viewState, setViewState] = useState({
    longitude: -115.4, // Imperial Valley
    latitude: 33.1,
    zoom: 8.8,
    pitch: 0,
    bearing: 0,
  });

  const [userLocation, setUserLocation] = useState(null); // 📍 Estado para guardar la ubicación del usuario

  const [basemapUrl, setBasemapUrl] = useState(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
  );

  const basemaps = {
    OpenStreetMap: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    GoogleXYZ: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    GoogleTopography: "http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
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

  return (
    <div className={styles.mapContainer}>
      {/* 📍 Título visible en la parte superior */}
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>RHI Alarm</h1>
        <h2 className={styles.subtitle}>Wet Bulb Globe Temp Data</h2>
      </div>

      <div className={styles.controlPanel}>
        <BasemapSwitcher basemaps={basemaps} onBasemapChange={setBasemapUrl} />
        <SearchButton onLocationSelect={handleLocationSelect} />
        <LocateButton onLocate={handleLocate} />
        <Button label="Learn more About the Project!" to="/about" />
      </div>

      <DeckGL
        viewState={viewState}
        controller={true}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        layers={[tileLayer, userLocationLayer].filter(Boolean)} // 📍 Agregamos el marcador al mapa
        getTooltip={({ coordinate }) =>
          coordinate &&
          `Latitude: ${coordinate[1].toFixed(
            2
          )}, Longitude: ${coordinate[0].toFixed(2)}`
        }
      />
    </div>
  );
};

export default MapView;
