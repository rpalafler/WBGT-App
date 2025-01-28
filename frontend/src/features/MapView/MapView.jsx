import React, { useState } from "react";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import BasemapSwitcher from "../../components/Buttons/BasemapSwitcher/BasemapSwitcher";
import Button from "../../components/Buttons/Button/Button"; // Importación correcta del botón
import styles from "./MapView.module.css"; // Importamos los estilos

const MapView = () => {
  const INITIAL_VIEW_STATE = {
    longitude: -95.7129, // Estados Unidos
    latitude: 37.0902,
    zoom: 4,
    pitch: 0,
    bearing: 0,
  };

  // Estado para manejar la URL del basemap
  const [basemapUrl, setBasemapUrl] = useState(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png" // Basemap inicial
  );

  // Opciones de basemaps
  const basemaps = {
    OpenStreetMap: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    GoogleXYZ: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    GoogleTopography: "http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
  };

  // TileLayer dinámico basado en el estado del basemap
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

  return (
    <div className={styles.mapContainer}>
      {/* Basemap Switcher y Botón */}
      <div className={styles.controlPanel}>
        <BasemapSwitcher basemaps={basemaps} onBasemapChange={setBasemapUrl} />
        <Button label="Learn more About the Project!" to="/about" />
      </div>

      {/* Renderizamos el mapa */}
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller
        layers={[tileLayer]}
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
