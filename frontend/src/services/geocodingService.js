export const getCoordinates = async (location) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        location
      )}&format=json`
    );
    const data = await response.json();

    if (data.length === 0) {
      throw new Error("Location not found");
    }

    const { lat, lon, boundingbox } = data[0];

    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      boundingBox: boundingbox.map(parseFloat), // Convertimos a números
    };
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
};

export const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await response.json();

    if (data && data.display_name) {
      const fullName = data.display_name;

      // Si contiene "County", cortamos ahí
      const countyIndex = fullName.indexOf("County");
      if (countyIndex !== -1) {
        const shortName = fullName
          .slice(0, countyIndex + "County".length)
          .trim();
        return shortName;
      }

      // Si no hay "County", cortamos después de los dos primeros componentes
      const parts = fullName.split(",");
      const trimmedParts = parts.slice(0, 2).join(",").trim();

      // Limita a 50 caracteres por si acaso
      return trimmedParts.length > 50
        ? trimmedParts.slice(0, 47) + "..."
        : trimmedParts;
    } else {
      throw new Error("Location name not found");
    }
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
    return null;
  }
};
