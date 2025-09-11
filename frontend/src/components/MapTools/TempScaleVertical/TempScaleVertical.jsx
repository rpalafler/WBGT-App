import React, { useContext } from "react";
import styles from "./TempScaleVertical.module.css";
import { AppContext } from "../../../Context";

const TempScaleVertical = () => {
  const { wbgtData } = useContext(AppContext);

  // fallback if no data yet (e.g., showing placeholder)
  const min = wbgtData?.min ? ((wbgtData.min - 273.15) * 9) / 5 + 32 : 78;
  const max = wbgtData?.max ? ((wbgtData.max - 273.15) * 9) / 5 + 32 : 95;

  return (
    <div className={styles.container}>
      <span className={styles.labelTop}>{max.toFixed(1)}°F</span>
      <div className={styles.scale}></div>
      <span className={styles.labelBottom}>{min.toFixed(1)}°F</span>
    </div>
  );
};

export default TempScaleVertical;
