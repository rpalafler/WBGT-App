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
