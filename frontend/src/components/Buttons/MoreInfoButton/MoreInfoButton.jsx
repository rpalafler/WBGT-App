import React, { useContext } from "react";
import styles from "./MoreInfoButton.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../Context";

const MoreInfoButton = ({ label, to }) => {
  const navigate = useNavigate();
  const { windowWidth } = useContext(AppContext); // Obtenemos el ancho desde el contexto

  const handleClick = () => {
    navigate(to);
  };

  return (
    <button
      className={`${styles.button} ${
        windowWidth < 768 ? styles.iconButton : ""
      }`}
      onClick={handleClick}
    >
      {windowWidth < 768 ? (
        <>
          <FontAwesomeIcon icon={faCircleInfo} className={styles.icon} />
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faCircleInfo} />
          &nbsp;&nbsp;
          <span className={styles.iconText}>About the Project</span>
        </>
      )}
    </button>
  );
};

export default MoreInfoButton;
