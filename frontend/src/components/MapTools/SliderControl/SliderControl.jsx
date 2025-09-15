import React, { useState, useEffect, useContext } from "react";
import styles from "./SliderControl.module.css";
import { AppContext } from "../../../Context";
import { useTranslation } from "react-i18next";
import { fetchWBGTData } from "../../../services/WBGTDataService";

const SliderControl = () => {
  const { setWBGTData } = useContext(AppContext);

  // Inicializar con fecha actual (menos 2 horas como en handleSubmit)
  const getCurrentModelDate = () => {
    const now = new Date();
    now.setHours(now.getHours() - 2);
    return now;
  };

  const [forecastHour, setForecastHour] = useState(1);
  const [modelDate, setModelDate] = useState(getCurrentModelDate);

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

  // 👇 reemplaza tu formatDateFancy por este
  const formatDateFancy = (
    date,
    { mobile = false, timeZone = "America/Los_Angeles" } = {}
  ) => {
    // en-US devuelve "Sep", "Oct", "Jan" (abreviado). Si quieres "sept", usa es-ES.
    const locale = "en-US"; // o "es-ES" si prefieres "sept", "oct", "ene"
    const mobileOpts = {
      month: "short", // Sep / Oct / Jan
      day: "numeric", // 9
      hour: "2-digit", // 03 PM
      hour12: true,
      timeZone,
    };
    const desktopOpts = {
      year: "numeric", // 2025
      month: "long", // September
      day: "2-digit", // 09
      hour: "2-digit", // 03 PM
      hour12: true,
      timeZone,
    };

    return date.toLocaleString(locale, mobile ? mobileOpts : desktopOpts);
  };

  const handleSubmit = async () => {
    const now = new Date();
    now.setHours(now.getHours() - 2);
    const formattedDate = now.toISOString().slice(0, 13).replace("T", "_");

    console.log(
      "📤 Enviando al backend:",
      formattedDate,
      "fxx =",
      forecastHour
    );

    const result = await fetchWBGTData(formattedDate, forecastHour);

    if (result) {
      setWBGTData(result);
      setModelDate(now);
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
        <input
          type="range"
          min="1"
          max="36"
          value={forecastHour}
          onChange={handleForecastChange}
          onClick={(e) => e.stopPropagation()}
          className={styles.slider} // 👈 añadida
        />

        {modelDate && (
          <div className={styles.modelInfo}>
            🕓{" "}
            {formatDateFancy(
              new Date(modelDate.getTime() + forecastHour * 3600000),
              { mobile: isMobile } // 👈 aquí activas el modo abreviado
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SliderControl;
