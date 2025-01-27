import React from "react";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";

const MapView = () => {
  const INITIAL_VIEW_STATE = {
    longitude: -95.7129, // Coordenadas aproximadas del centro de EE. UU.
    latitude: 37.0902, // Coordenadas aproximadas del centro de EE. UU.
    zoom: 4, // Ajusta el nivel de zoom para abarcar el país
    pitch: 0,
    bearing: 0,
  };

  // Definimos el TileLayer con BitmapLayer
  const tileLayer = new TileLayer({
    id: "TileLayer",
    data: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
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
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller
      layers={[tileLayer]}
      style={{ width: "100%", height: "100vh" }}
      getTooltip={({ tile }) =>
        tile && `x:${tile.index.x}, y:${tile.index.y}, z:${tile.index.z}`
      }
    />
  );
};

export default MapView;
