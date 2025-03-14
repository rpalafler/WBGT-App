// import React, { useContext, useEffect, useState } from "react";
// import styles from "./ScaleBar.module.css";
// import { AppContext } from "../../../Context"; // Importamos el contexto para obtener zoom y latitud

// const ScaleBar = () => {
//   const { viewState } = useContext(AppContext); // Obtenemos zoom y latitud del mapa
//   const [scaleText, setScaleText] = useState("100 m");
//   const [barWidth, setBarWidth] = useState(100);

//   useEffect(() => {
//     const calculateScale = () => {
//       const { zoom, latitude } = viewState;
//       const screenWidth = window.innerWidth;
//       const metersPerPixelAtEquator = 156412;

//       // 🔹 1. Calculamos metros por píxel considerando zoom y latitud
//       const metersPerPixel =
//         (metersPerPixelAtEquator * Math.cos((latitude * Math.PI) / 180)) /
//         Math.pow(2, zoom);

//       // 🔹 2. Definimos los valores de referencia para la escala
//       // 🔹 2. Definimos los valores de referencia para la escala en metros
//       const referenceScales = [
//         50, 100, 250, 500, 1000, 5000, 10000, 25000, 50000, 100000, 250000,
//         1000000, 5000000, 20000000,
//       ];
//       let selectedScale = referenceScales[0];

//       // 🔹 3. Buscamos el valor más adecuado basado en el tamaño de la pantalla
//       for (let i = 0; i < referenceScales.length; i++) {
//         const testScale = referenceScales[i];
//         const testBarWidth = testScale / metersPerPixel;

//         if (
//           testBarWidth > screenWidth * 0.05 &&
//           testBarWidth < screenWidth * 0.3
//         ) {
//           selectedScale = testScale;
//           break;
//         }
//       }

//       // 🔹 4. Convertimos a millas y ajustamos el texto de la escala
//       const miles = (selectedScale / 1609).toFixed(2); // 1 milla = 1609 m
//       const displayScale =
//         selectedScale >= 1000
//           ? `${selectedScale / 1000} km`
//           : `${selectedScale} m`;

//       setScaleText({ km: displayScale, miles: `${miles} mi` });
//       setBarWidth(selectedScale / metersPerPixel);
//     };

//     calculateScale();
//     window.addEventListener("resize", calculateScale);
//     return () => window.removeEventListener("resize", calculateScale);
//   }, [viewState]);

//   return (
//     <div className={styles.scaleBar}>
//       <div className={styles.scaleTextContainer}>
//         <span className={styles.scaleText}>{scaleText.miles}</span>
//         <span className={styles.scaleText}>{scaleText.km}</span>
//       </div>
//       <div className={styles.scaleLineContainer}>
//         <div className={styles.scaleEndLine}></div>
//         <div
//           className={styles.scaleLine}
//           style={{ width: `${barWidth}px` }}
//         ></div>
//         <div className={styles.scaleEndLine}></div>
//       </div>
//     </div>
//   );
// };

// export default ScaleBar;

// ___________________________________________________________________________________________________
// El codigo que viene a continuación elimina los kilometros de la escala, dejando unicamente las millas en la escala
// ___________________________________________________________________________________________________
import React, { useContext, useEffect, useState } from "react";
import styles from "./ScaleBar.module.css";
import { AppContext } from "../../../Context"; // Importamos el contexto para obtener zoom y latitud

const ScaleBar = () => {
  const { viewState } = useContext(AppContext); // Obtenemos zoom y latitud del mapa
  const [scaleText, setScaleText] = useState("5 mi");
  const [barWidth, setBarWidth] = useState(100);

  useEffect(() => {
    const calculateScale = () => {
      const { zoom, latitude } = viewState;
      const screenWidth = window.innerWidth;
      const metersPerPixelAtEquator = 156412;

      // 🔹 1. Calculamos metros por píxel considerando zoom y latitud
      const metersPerPixel =
        (metersPerPixelAtEquator * Math.cos((latitude * Math.PI) / 180)) /
        Math.pow(2, zoom);

      // 🔹 2. Valores de referencia para la escala (solo en millas)
      const referenceMiles = [1, 2, 5, 10, 20, 30, 50, 100, 150];
      const referenceScales = referenceMiles.map((mile) => mile * 1609); // Convertimos a metros
      let selectedScale = referenceScales[0];

      // 🔹 3. Buscamos el valor más adecuado basado en el tamaño de la pantalla
      for (let i = 0; i < referenceScales.length; i++) {
        const testScale = referenceScales[i];
        const testBarWidth = testScale / metersPerPixel;

        if (
          testBarWidth > screenWidth * 0.05 &&
          testBarWidth < screenWidth * 0.3
        ) {
          selectedScale = testScale;
          break;
        }
      }

      // 🔹 4. Convertimos a millas para mostrarlo en el texto
      const miles = (selectedScale / 1609).toFixed(0); // Convertimos de metros a millas sin decimales

      setScaleText(`${miles} mi`);
      setBarWidth(selectedScale / metersPerPixel);
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, [viewState]);

  return (
    <div className={styles.scaleBar}>
      <div className={styles.scaleTextContainer}>
        <span className={styles.scaleText}>{scaleText}</span>
      </div>
      <div className={styles.scaleLineContainer}>
        <div className={styles.scaleEndLine}></div>
        <div
          className={styles.scaleLine}
          style={{ width: `${barWidth}px` }}
        ></div>
        <div className={styles.scaleEndLine}></div>
      </div>
    </div>
  );
};

export default ScaleBar;
