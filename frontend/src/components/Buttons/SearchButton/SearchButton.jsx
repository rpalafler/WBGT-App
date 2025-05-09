import React, { useState, useContext } from "react";
import { getCoordinates } from "../../../services/geocodingService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../../../Context";
import styles from "./SearchButton.module.css";
import { useTranslation } from "react-i18next";

const SearchButton = ({ onLocationSelect }) => {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false); // Nuevo estado para expandir
  const { windowWidth } = useContext(AppContext);
  const { t } = useTranslation();

  const handleSearch = async () => {
    if (!query.trim()) return;
    const coordinates = await getCoordinates(query);
    if (coordinates) {
      onLocationSelect(coordinates);
    } else {
      alert("Location not found. Try again.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={`${styles.searchContainer} ${
        isExpanded ? styles.expanded : ""
      }`}
    >
      {windowWidth < 768 ? (
        <>
          <button
            className={styles.iconButton}
            onClick={(e) => {
              e.stopPropagation(); // Detiene la propagación del evento al mapa
              setIsExpanded(!isExpanded);
            }}
            aria-label={t("search")}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          {isExpanded && (
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onClick={(e) => e.stopPropagation()} // Evita que el clic se propague al mapa
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className={styles.searchInputMobile}
              autoFocus
            />
          )}
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder={t("location")}
            value={query}
            onClick={(e) => e.stopPropagation()} // Evita que el clic se propague al mapa
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className={styles.searchInput}
          />
          <button
            onClick={(e) => {
              e.stopPropagation(); // Detiene la propagación del evento al mapa
              handleSearch();
            }}
            className={styles.searchButton}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} /> {t("search")}
          </button>
        </>
      )}
    </div>
  );
};

export default SearchButton;
