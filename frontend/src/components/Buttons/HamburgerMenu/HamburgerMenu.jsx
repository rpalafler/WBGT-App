import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faLayerGroup,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom"; // Mantiene la navegación
import styles from "./HamburgerMenu.module.css";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.menuContainer}>
      {/* Botón de Hamburguesa */}
      <button className={styles.hamburgerButton} onClick={toggleMenu}>
        <FontAwesomeIcon icon={faBars} className={styles.hamburgerIcon} />
        <span className={styles.menuText}>Menu</span>
      </button>

      {/* Menú Desplegable */}
      <div className={`${styles.dropdownMenu} ${isOpen ? styles.show : ""}`}>
        {/* Opciones en Pantallas Grandes */}
        <ul className={styles.desktopMenu}>
          <li>
            <Link to="/">🏠 Home</Link>
          </li>
          <li>
            <Link to="/about">ℹ️ About</Link>
          </li>
          <li>⚙️ Settings</li>
        </ul>

        {/* Opciones en Pantallas Pequeñas → Botones Redondos con Iconos */}
        <div className={styles.mobileMenu}>
          <button className={styles.menuItem} title="Buscar">
            <FontAwesomeIcon icon={faSearch} />
          </button>
          <button className={styles.menuItem} title="Ubicación">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
          </button>
          <button className={styles.menuItem} title="Capas">
            <FontAwesomeIcon icon={faLayerGroup} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
