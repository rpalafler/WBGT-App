import React from "react";
import styles from "./TempScaleVertical.module.css";

const TempScaleVertical = () => {
  return (
    <div className={styles.container}>
      <span className={styles.labelTop}>95°F</span>
      <div className={styles.scale}></div>
      <span className={styles.labelBottom}>78°F</span>
    </div>
  );
};

export default TempScaleVertical;
