import React, { useState, useRef, useEffect, useContext } from "react";
import styles from "./BasemapSwitcher.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../../../Context"; // Importamos el Context

const BasemapSwitcher = ({ basemaps, onBasemapChange, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isCollapsed, setIsCollapsed } = useContext(AppContext);
  const { windowWidth } = useContext(AppContext);

  // Cierra el menú si haces clic fuera del contenedor
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (onToggle) onToggle(false); // ✅ Notifica al padre que se ha cerrado
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
        onClick={(e) => {
          e.stopPropagation();
          const newState = !isOpen;
          setIsOpen(newState);
          if (onToggle) onToggle(newState); // ✅ Notifica al padre
          if (windowWidth >= 768) {
            setIsCollapsed(!isCollapsed);
          }
        }}
      >
        <FontAwesomeIcon icon={faLayerGroup} className={styles.icon} />
        <span className={styles.buttonText}>Layers</span>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className={styles.dropdown}>
          {Object.keys(basemaps).map((key) => (
            <div
              key={key}
              className={styles.option}
              onClick={(e) => {
                e.stopPropagation();
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
