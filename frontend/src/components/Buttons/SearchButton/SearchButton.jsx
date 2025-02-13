import React, { useState, useContext } from "react";
import { getCoordinates } from "../../../services/geocodingService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../../../Context";
import styles from "./SearchButton.module.css";

const SearchButton = ({ onLocationSelect }) => {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false); // Nuevo estado para expandir
  const { windowWidth } = useContext(AppContext);

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
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Search"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          {isExpanded && (
            <input
              type="text"
              placeholder="Search..."
              value={query}
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
            placeholder="Enter a location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className={styles.searchInput}
          />
          <button onClick={handleSearch} className={styles.searchButton}>
            <FontAwesomeIcon icon={faMagnifyingGlass} /> Search
          </button>
        </>
      )}
    </div>
  );
};

export default SearchButton;
