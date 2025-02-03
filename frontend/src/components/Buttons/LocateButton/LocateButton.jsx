import React from "react";
import styles from "./LocateButton.module.css";

const LocateButton = ({ onLocate }) => {
  return (
    <button className={styles.locateButton} onClick={onLocate}>
      📍 Locate Me
    </button>
  );
};

export default LocateButton;
