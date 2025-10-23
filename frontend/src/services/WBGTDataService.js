import pako from "pako";

// const API_URL = "http://127.0.0.1:8000/api"; // local dev
const API_URL = "https://4dvdrhi.sdsu.edu";

/**
 * Fetch WBGT data from the backend
 * @param {string} datetimeStr - e.g. "20251023_03"
 * @param {number} forecastHour - lead time fxx
 * @param {Object} opts - optional filters { user_vmin_f, user_vmax_f }
 */
export async function fetchWBGTData(datetimeStr, forecastHour, opts = {}) {
  const params = new URLSearchParams({
    datetime_str: datetimeStr,
    forecast_hour: String(forecastHour),
  });

  if (opts.user_vmin_f != null) {
    params.set("user_vmin_f", String(opts.user_vmin_f));
  }
  if (opts.user_vmax_f != null) {
    params.set("user_vmax_f", String(opts.user_vmax_f));
  }

  const url = `${API_URL}/wbgt?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();

    // ✅ decompress if needed
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
