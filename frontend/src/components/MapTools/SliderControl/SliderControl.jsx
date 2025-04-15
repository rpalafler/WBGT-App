// import React, { useContext, useState } from "react";
// import styles from "./SliderControl.module.css";
// import { AppContext } from "../../../Context";

// const SliderControl = () => {
//   const { selectedDate, setSelectedDate, selectedHour, setSelectedHour } =
//     useContext(AppContext);

//   const [timer, setTimer] = useState(null); // Timer para auto-enviar

//   // Función para convertir a UTC antes de enviar
//   const convertToUTC = (date, hour) => {
//     const formattedHour = String(hour).padStart(2, "0");
//     const localDate = new Date(`${date}T${formattedHour}:00:00`);
//     return localDate.toISOString();
//   };

//   // Convierte una hora en formato 24h a 12h AM/PM
//   const formatHourAMPM = (hour) => {
//     const ampm = hour < 12 ? "AM" : "PM";
//     const hour12 = hour % 12 || 12; // Convierte 0 -> 12 AM, 13 -> 1 PM, etc.
//     return `${hour12} ${ampm}`;
//   };

//   // Manejar cambios en el date picker
//   const handleDateChange = (event) => {
//     setSelectedDate(event.target.value);
//   };

//   // Manejar cambios en el slider de hora
//   const handleHourChange = (event) => {
//     const newHour = parseInt(event.target.value);
//     setSelectedHour(newHour);

//     // Si hay un temporizador activo, lo reseteamos
//     if (timer) clearTimeout(timer);

//     // Iniciamos un nuevo temporizador de 2 segundos antes de enviar
//     const newTimer = setTimeout(() => {
//       handleSubmit();
//     }, 2000);

//     setTimer(newTimer);
//   };

//   // Enviar automáticamente la hora en UTC
//   const handleSubmit = () => {
//     const utcTime = convertToUTC(selectedDate, selectedHour);
//     console.log("Enviando al backend:", utcTime);
//     // Aquí podrías hacer un fetch() para enviar `utcTime` al backend
//   };

//   return (
//     <div className={styles.sliderContainer}>
//       <div className={styles.controls}>
//         {/* Selector de Fecha */}
//         <div className={styles.datePicker}>
//           <label>📅 Date</label>
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={handleDateChange}
//             onClick={(e) => {
//               e.stopPropagation();
//             }}
//           />
//         </div>

//         {/* Slider de Hora */}
//         <div className={styles.hourSlider}>
//           <label>⏰ Hour: {formatHourAMPM(selectedHour)}</label>
//           <input
//             type="range"
//             min="0"
//             max="23"
//             value={selectedHour}
//             onChange={handleHourChange}
//             onClick={(e) => {
//               e.stopPropagation();
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SliderControl;

import React, { useContext, useState, useEffect } from "react";
import styles from "./SliderControl.module.css";
import { AppContext } from "../../../Context";

const SliderControl = () => {
  const { selectedDate, setSelectedDate, selectedHour, setSelectedHour } =
    useContext(AppContext);

  const [timer, setTimer] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const convertToUTC = (date, hour) => {
    const formattedHour = String(hour).padStart(2, "0");
    const localDate = new Date(`${date}T${formattedHour}:00:00`);
    return localDate.toISOString();
  };

  const formatHourAMPM = (hour) => {
    const ampm = hour < 12 ? "AM" : "PM";
    const hour12 = hour % 12 || 12;
    return `${hour12} ${ampm}`;
  };

  const handleSubmit = () => {
    const utcTime = convertToUTC(selectedDate, selectedHour);
    console.log("📤 Enviando al backend:", utcTime);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    if (isMobile) {
      if (timer) clearTimeout(timer);
      const newTimer = setTimeout(() => {
        handleSubmit();
      }, 2000);
      setTimer(newTimer);
    }
  };

  const handleHourChange = (event) => {
    const newHour = parseInt(event.target.value);
    setSelectedHour(newHour);
    if (isMobile) {
      if (timer) clearTimeout(timer);
      const newTimer = setTimeout(() => {
        handleSubmit();
      }, 2000);
      setTimer(newTimer);
    }
  };

  return (
    <div
      className={
        isMobile ? styles.sliderContainerMobile : styles.sliderContainer
      }
    >
      <div className={styles.controls}>
        <div className={styles.datePicker}>
          <label>📅 Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className={styles.hourSlider}>
          <label>
            ⏰ Hour{isMobile ? `: ${formatHourAMPM(selectedHour)}` : ""}
          </label>
          <input
            type="range"
            min="0"
            max="23"
            value={selectedHour}
            onChange={handleHourChange}
            onClick={(e) => e.stopPropagation()}
          />
          {!isMobile && (
            <p className={styles.selectedHour}>
              Selected: {formatHourAMPM(selectedHour)}
            </p>
          )}
        </div>

        {!isMobile && (
          <button
            className={styles.submitButton}
            onClick={(e) => {
              e.stopPropagation();
              handleSubmit();
            }}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default SliderControl;
