import React, { useContext } from "react";
import styles from "./SliderControl.module.css";
import { AppContext } from "../../../Context";

const SliderControl = () => {
  const { selectedDate, setSelectedDate, selectedHour, setSelectedHour } =
    useContext(AppContext);

  // Función para convertir a UTC antes de enviar
  const convertToUTC = (date, hour) => {
    const formattedHour = String(hour).padStart(2, "0"); // Convertimos a string antes de padStart
    const localDate = new Date(`${date}T${formattedHour}:00:00`);
    return localDate.toISOString(); // Devuelve en UTC
  };

  // Manejar cambios en el date picker
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  // Manejar cambios en el slider de hora
  const handleHourChange = (event) => {
    setSelectedHour(event.target.value);
  };

  // Manejar el submit y enviar la hora en UTC
  const handleSubmit = () => {
    const utcTime = convertToUTC(selectedDate, selectedHour);
    console.log("Enviando al backend:", utcTime);
    // Aquí podrías hacer un fetch() para enviar `utcTime` al backend
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.controls}>
        {/* Selector de Fecha */}
        <div className={styles.datePicker}>
          <label>📅 Select Date:</label>
          <input type="date" value={selectedDate} onChange={handleDateChange} />
        </div>

        {/* Slider de Hora */}
        <div className={styles.hourSlider}>
          <label>⏰ Select Hour: {selectedHour}:00</label>
          <input
            type="range"
            min="0"
            max="23"
            value={selectedHour}
            onChange={handleHourChange}
          />
        </div>

        {/* Botón Submit */}
        <button className={styles.submitButton} onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default SliderControl;
