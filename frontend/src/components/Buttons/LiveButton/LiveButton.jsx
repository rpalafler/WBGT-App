import React, { useContext } from "react";
import styles from "./LiveButton.module.css";
import { AppContext } from "../../../Context";
import { useTranslation } from "react-i18next";

const LiveButton = () => {
  const { setSelectedDate, setSelectedHour } = useContext(AppContext);
  const { t } = useTranslation();

  const handleLiveClick = () => {
    const now = new Date();
    setSelectedDate(now.toLocaleDateString("en-CA")); // Formato YYYY-MM-DD
    setSelectedHour(now.getHours()); // Hora actual
  };

  return (
    <button
      className={styles.liveButton}
      onClick={(e) => {
        e.stopPropagation(); // Detiene la propagación del evento al mapa
        handleLiveClick();
      }}
    >
      <span className={styles.circle}></span>
      {/* LIVE */}
      {/* Cambiamos LIVE por Current Time */}
      {t("current time")}
    </button>
  );
};

export default LiveButton;
