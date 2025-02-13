import React, { useState, useRef, useEffect } from "react";
import styles from "./BasemapSwitcher.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";

const BasemapSwitcher = ({ basemaps, onBasemapChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cierra el menú si haces clic fuera del contenedor
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`${styles.container} ${isOpen ? styles.open : ""}`}
      ref={dropdownRef}
    >
      {/* Botón principal */}
      <button
        className={styles.button}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <FontAwesomeIcon icon={faLayerGroup} className={styles.icon} />
        <span className={styles.buttonText}>Basemap Options</span>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className={styles.dropdown}>
          {Object.keys(basemaps).map((key) => (
            <div
              key={key}
              className={styles.option}
              onClick={() => {
                onBasemapChange(basemaps[key].url); // Cambia el basemap
                setIsOpen(false); // Cierra el menú
              }}
            >
              {typeof basemaps[key] === "object" ? basemaps[key].label : key}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BasemapSwitcher;
