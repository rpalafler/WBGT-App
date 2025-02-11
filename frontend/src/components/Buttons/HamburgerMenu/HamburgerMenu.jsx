import React, { useState } from "react";
import styles from "./HamburgerMenu.module.css";
import { Menu } from "lucide-react"; // Usamos un icono moderno de Lucide
import { Link } from "react-router-dom"; // Importamos Link para la navegación

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false); // Estado para abrir/cerrar el menú

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.menuContainer}>
      {/* Botón de Hamburguesa */}
      <button className={styles.hamburgerButton} onClick={toggleMenu}>
        <Menu size={24} /> {/* Icono de hamburguesa */}
        <span className={styles.menuText}>Menu</span>
      </button>

      {/* Menú Desplegable */}
      <div className={`${styles.dropdownMenu} ${isOpen ? styles.show : ""}`}>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>{" "}
          {/* Redirige a la página principal */}
          <li>
            <Link to="/about">About</Link>
          </li>{" "}
          {/* Redirige a la página About */}
          <li>Settings</li> {/* Esto lo dejamos sin funcionalidad por ahora */}
        </ul>
      </div>
    </div>
  );
};

export default HamburgerMenu;
