import React, { useState } from "react";
import { getCoordinates } from "../../../services/geocodingService";
import styles from "./SearchButton.module.css";

const SearchButton = ({ onLocationSelect }) => {
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;

    const coordinates = await getCoordinates(query);
    if (coordinates) {
      onLocationSelect(coordinates); // Envía las coordenadas al componente padre
    } else {
      alert("Location not found. Try again.");
    }
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Enter a location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.searchInput}
      />
      <button onClick={handleSearch} className={styles.searchButton}>
        🔍 Search
      </button>
    </div>
  );
};

export default SearchButton;
