// 📡 Conecta con tu API de FastAPI
const API_URL = "http://localhost:8000/api"; // Ajusta si cambia la URL

// Aqui estamos declarando el servicio de nuestra nueva API, habra que modificarla ya que por ahora unicamente sirve para
// fetch el data que viene de una direccion concreta de nuestra API, es decir, solo incluimos un endpoint y no es dinamico
export const fetchSampleData = async () => {
  try {
    const response = await fetch(`${API_URL}/wbgt/sample`);
    if (!response.ok) {
      throw new Error("Error obteniendo datos");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
