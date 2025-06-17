import React, { useState, useEffect, useContext } from "react";
import styles from "./SliderControl.module.css";
import { AppContext } from "../../../Context";
import { useTranslation } from "react-i18next";
import { fetchWBGTData } from "../../../services/WBGTDataService";

const SliderControl = () => {
  const { setWBGTData } = useContext(AppContext);
  const [forecastHour, setForecastHour] = useState(1);
  const [modelDate, setModelDate] = useState(null);
  const [timer, setTimer] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { t } = useTranslation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatDateFancy = (date, timeZone = "America/Los_Angeles") => {
    return date
      .toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        hour12: false,
        minute: undefined, // 👈 No mostramos minutos
        timeZone,
      })
      .replace(",", "")
      .replace("at", "at");
  };

  const handleSubmit = async () => {
    const now = new Date();
    now.setHours(now.getHours() - 2);
    const formattedDate = now.toISOString().slice(0, 13).replace("T", "_");

    setModelDate(now);

    console.log(
      "📤 Enviando al backend:",
      formattedDate,
      "fxx =",
      forecastHour
    );

    const result = await fetchWBGTData(formattedDate, forecastHour);

    if (result) {
      setWBGTData(result);
      console.log("✅ WBGT recibido:", result);
    } else {
      console.error("❌ No se pudo cargar WBGT.");
    }
  };

  useEffect(() => {
    handleSubmit();
  }, []);

  const triggerAutoSubmit = () => {
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      handleSubmit();
    }, 1000);
    setTimer(newTimer);
  };

  const handleForecastChange = (event) => {
    setForecastHour(parseInt(event.target.value));
    triggerAutoSubmit();
  };

  return (
    <div
      className={
        isMobile ? styles.sliderContainerMobile : styles.sliderContainer
      }
    >
      <div className={styles.controls}>
        {/* <div className={styles.hourLabelRow}>
          <label>
            🕒 {t("Forecast Hour")}: {forecastHour}h
          </label>
        </div> */}

        <input
          type="range"
          min="1"
          max="36"
          value={forecastHour}
          onChange={handleForecastChange}
          onClick={(e) => e.stopPropagation()}
        />

        {modelDate && (
          <div className={styles.modelInfo}>
            🕓{" "}
            {formatDateFancy(
              new Date(modelDate.getTime() + forecastHour * 3600000)
            )}
            {":00"}
          </div>
        )}
      </div>
    </div>
  );
};

export default SliderControl;
