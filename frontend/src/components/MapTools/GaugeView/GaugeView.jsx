import React, { useContext, useEffect, useState } from "react";
import styles from "./GaugeView.module.css";
import { AppContext } from "../../../Context";
// Riley Gauge
import GaugeChart2 from "./CustomGauge";
import { reverseGeocode } from "../../../services/geocodingService";
import { useTranslation } from "react-i18next";

const GaugeView = () => {
  const { setIsGaugeActive, pinCoords, selectedWBGTValue } =
    useContext(AppContext);
  const [showHistory, setShowHistory] = useState(false); // ⬅️ estado para alternar tabla
  const [locationName, setLocationName] = useState("");
  const { t } = useTranslation();

  const wbgtFahrenheit =
    selectedWBGTValue !== null
      ? ((selectedWBGTValue - 273.15) * 9) / 5 + 32
      : null;

  useEffect(() => {
    const fetchLocation = async () => {
      if (pinCoords) {
        const name = await reverseGeocode(
          pinCoords.latitude,
          pinCoords.longitude
        );
        setLocationName(name || "Unknown location");
      }
    };
    fetchLocation();
  }, [pinCoords]);
  const displayValue = wbgtFahrenheit !== null ? wbgtFahrenheit : 72;

  return (
    <div className={styles.gaugeContainer}>
      {pinCoords && (
        <div className={styles.locationHeader}>
          <h3>{locationName}</h3>
          <p>
            {pinCoords.latitude.toFixed(3)}° N,{" "}
            {-pinCoords.longitude.toFixed(3)}° W
          </p>
        </div>
      )}

      {/* ✅ Botón debajo de la 'X' */}
      <button
        className={styles.historyButton}
        onClick={(e) => {
          e.stopPropagation();
          setShowHistory(true);
        }}
      >
        {t("Alert History")}
      </button>

      <div className={styles.contentWrapper}>
        <div className={styles.gaugeSection}>
          <GaugeChart2 wbgt={displayValue} />
        </div>
      </div>

      {/* ✅ Panel flotante si showHistory === true */}
      {showHistory && (
        <div className={styles.historyPanel}>
          <button
            className={styles.closeHistoryButton}
            onClick={() => setShowHistory(false)}
          >
            ✖
          </button>
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
              <tr>
                <td>8 Feb 2025</td>
                <td>101°F</td>
              </tr>
              <tr>
                <td>15 Feb 2025</td>
                <td>100°F</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GaugeView;
