import React, { useContext, useEffect, useState } from "react";
import styles from "./ScaleBar.module.css";
import { AppContext } from "../../../Context"; // Importamos el contexto para obtener el zoom y la latitud

const ScaleBar = () => {
  const { viewState } = useContext(AppContext); // Obtenemos el estado del mapa del contexto
  const [scaleText, setScaleText] = useState("100 m"); // Texto que muestra la escala
  const [barWidth, setBarWidth] = useState(100); // Ancho visual de la barra en píxeles

  useEffect(() => {
    const calculateScale = () => {
      const { zoom, latitude } = viewState;
      const screenWidth = window.innerWidth; // Ancho de la pantalla para ajustar la escala
      const metersPerPixelAtEquator = 156412; // Metros por píxel en el zoom 0 en el ecuador

      // 1. Calcular metros por píxel considerando el zoom y la latitud
      const metersPerPixel =
        (metersPerPixelAtEquator * Math.cos((latitude * Math.PI) / 180)) /
        Math.pow(2, zoom);

      // 2. Definir la longitud de la barra como el 10% del ancho de la pantalla
      const desiredBarLengthInPixels = screenWidth * 0.1;
      const distanceInMeters = metersPerPixel * desiredBarLengthInPixels;

      // 3. Ajustar la unidad de medida para que sea más fácil de leer
      let displayDistance, displayUnit;
      if (distanceInMeters >= 1000) {
        displayDistance = (distanceInMeters / 1000).toFixed(1);
        displayUnit = "km";
      } else {
        displayDistance = Math.round(distanceInMeters);
        displayUnit = "m";
      }

      // 4. Actualizar el texto de la escala y el ancho de la barra
      setScaleText(`${displayDistance} ${displayUnit}`);
      setBarWidth(desiredBarLengthInPixels); // La barra siempre tendrá el 10% del ancho de la pantalla
    };

    calculateScale();

    // Recalcular la escala si cambia el tamaño de la ventana
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, [viewState]); // Se actualiza cuando cambia el zoom o la latitud

  return (
    <div className={styles.scaleBar}>
      <div
        className={styles.scaleLine}
        style={{ width: `${barWidth}px` }}
      ></div>
      <div className={styles.scaleText}>{scaleText}</div>
    </div>
  );
};

export default ScaleBar;
