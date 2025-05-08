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

      // Find the index of "County" and slice the string after it
      const countyIndex = fullName.indexOf("County");
      if (countyIndex !== -1) {
        return fullName.slice(0, countyIndex + "County".length).trim();
      }

      // fallback: return full string if "County" not found
      return fullName;
    } else {
      throw new Error("Location name not found");
    }
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
    return null;
  }
};
