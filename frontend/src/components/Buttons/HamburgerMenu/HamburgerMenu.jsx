import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faBars,
  faHouse,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom"; // Mantiene la navegación
import styles from "./HamburgerMenu.module.css";
import { useTranslation } from "react-i18next";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.menuContainer}>
      {/* Botón de Hamburguesa */}
      <button
        className={styles.hamburgerButton}
        onClick={(e) => {
          e.stopPropagation(); // Detiene la propagación del evento al mapa
          toggleMenu();
        }}
      >
        <FontAwesomeIcon icon={faBars} className={styles.hamburgerIcon} />
        <span className={styles.menuText}>{t("Menu")}</span>
      </button>

      {/* Menú Desplegable */}
      <div className={`${styles.dropdownMenu} ${isOpen ? styles.show : ""}`}>
        {/* Opciones en Pantallas Grandes */}
        <ul className={styles.desktopMenu}>
          <li>
            <Link to="/">
              <FontAwesomeIcon icon={faHouse} /> &nbsp;{t("Home")}
            </Link>
          </li>
          <li>
            <Link to="/about">
              <FontAwesomeIcon icon={faCircleInfo} />
              &nbsp; {t("About")}
            </Link>
          </li>
          <li>
            <FontAwesomeIcon icon={faGear} /> &nbsp;&nbsp;{t("Settings")}
          </li>
        </ul>

        {/* Opciones en Pantallas Pequeñas → Botones Redondos con Iconos */}
        <div className={styles.mobileMenu}>
          <button
            className={styles.menuItem}
            title="Home"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/");
            }}
          >
            <FontAwesomeIcon icon={faHouse} />
          </button>
          <button
            className={styles.menuItem}
            title="About"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/about");
            }}
          >
            <FontAwesomeIcon icon={faCircleInfo} />
          </button>
          {/* LO QUE VIENE AHORA ES UN EJEMPLO PERO NO TIENE FUNCIONALIDAD */}
          <button className={styles.menuItem} title="Settings">
            <FontAwesomeIcon icon={faGear} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
