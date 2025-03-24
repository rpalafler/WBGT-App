import React, { useContext } from "react";
import styles from "./GaugeView.module.css";
import { AppContext } from "../../../Context";
// Riley Gauge
import GaugeChart2 from "./CustomGauge";

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
          <GaugeChart2></GaugeChart2>
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
