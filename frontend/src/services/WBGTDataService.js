import pako from "pako";

const API_URL = "http://127.0.0.1:8000/api";

export async function fetchWBGTData(datetimeStr, forecastHour) {
  const url = `${API_URL}/wbgt/${datetimeStr}/${forecastHour}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();

    // ✅ Si viene comprimido, lo descomprimimos
    if (!json.values && json.values_compressed) {
      const binaryString = atob(json.values_compressed);
      const byteArray = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }

      const decompressed = pako.inflate(byteArray, { to: "string" });
      json.values = JSON.parse(decompressed);
    }

    return json;
  } catch (error) {
    console.error("❌ Error fetching WBGT data:", error);
    return null;
  }
}
