import React, { useContext } from "react";
import styles from "./LiveButton.module.css";
import { AppContext } from "../../../Context";

const LiveButton = () => {
  const { setSelectedDate, setSelectedHour } = useContext(AppContext);

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
      LIVE
    </button>
  );
};

export default LiveButton;
