// import React, { useContext } from "react";
// import GaugeChart from "react-gauge-chart";
// import styles from "./GaugeView.module.css";
// import { AppContext } from "../../../Context";

// const GaugeView = () => {
//   const { setIsGaugeActive } = useContext(AppContext);

//   return (
//     <div className={styles.gaugeContainer}>
//       {/* Botón de cierre */}
//       <button
//         className={styles.closeButton}
//         onClick={(e) => {
//           e.stopPropagation();
//           setIsGaugeActive(false);
//         }}
//       >
//         ✖
//       </button>

//       <h2>Gauge Data</h2>

//       {/* 📌 Gauge Chart con TAMAÑO más pequeño y zonas de seguridad */}
//       <GaugeChart
//         id="gauge-chart"
//         nrOfLevels={3} // Solo 3 niveles (Safe, Unsafe, Very Dangerous)
//         percent={0.22}
//         colors={["#00ff00", "#FFA500", "#FF0000"]} // Safe → Unsafe → Very Dangerous
//         arcWidth={0.2} // Grosor del gauge
//         textColor="white"
//         animate={true}
//         needleColor="white"
//         needleBaseColor="white"
//         style={{ width: "40%", marginTop: "5%" }} // 🔹 Ajuste directo
//       />
//     </div>
//   );
// };

// export default GaugeView;

import React, { useContext } from "react";
import GaugeChart from "react-gauge-chart";
import styles from "./GaugeView.module.css";
import { AppContext } from "../../../Context";

const GaugeView = () => {
  const { setIsGaugeActive } = useContext(AppContext);

  return (
    <div className={styles.gaugeContainer}>
      {/* Botón de cierre */}
      <button
        className={styles.closeButton}
        onClick={(e) => {
          e.stopPropagation();
          setIsGaugeActive(false);
        }}
      >
        ✖
      </button>

      {/* <h2>Gauge Data</h2> */}

      {/* 📌 Contenedor en dos columnas */}
      <div className={styles.contentWrapper}>
        {/* Gauge Chart */}
        <div className={styles.gaugeSection}>
          <GaugeChart
            id="gauge-chart"
            nrOfLevels={3}
            percent={0.22}
            colors={["#00ff00", "#FFA500", "#FF0000"]}
            arcWidth={0.2}
            textColor="white"
            animate={true}
            needleColor="white"
            needleBaseColor="white"
            style={{ width: "100%", marginTop: "0%", left: "0%" }} // 🔹 Ajuste directo
          />
        </div>

        {/* 📌 Tabla de datos (placeholder) */}
        <div className={styles.tableSection}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Temp</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10 Jan 2025</td>
                <td>95°F</td>
              </tr>
              <tr>
                <td>19 Jan 2025</td>
                <td>102°F</td>
              </tr>
              <tr>
                <td>2 Feb 2025</td>
                <td>102°F</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GaugeView;
