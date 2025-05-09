import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationArrow } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../../../Context";
import styles from "./LocateButton.module.css";
import { useTranslation } from "react-i18next";

const LocateButton = ({ onLocate }) => {
  const { windowWidth } = useContext(AppContext);
  const { t } = useTranslation();

  return (
    <button
      className={styles.locateButton}
      onClick={(e) => {
        e.stopPropagation(); // Detiene la propagación del evento al mapa
        onLocate();
      }}
    >
      {windowWidth < 768 ? (
        <FontAwesomeIcon icon={faLocationArrow} />
      ) : (
        <>
          <FontAwesomeIcon icon={faLocationArrow} />
          &nbsp;&nbsp;{t("Locate Me")}
        </>
      )}
    </button>
  );
};

export default LocateButton;
