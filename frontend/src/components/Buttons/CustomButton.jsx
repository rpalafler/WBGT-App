import { useState, useEffect } from "react";
import styles from "./CustomButton.module.css";

function CustomButton({
  buttonText = "Default Text",
  buttonHoverText = "Tooltip Text",
  onClick,
  buttonHover = true,
  children,
}) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) {
      console.log("Mouse is on the button!");
    } else {
      console.log("Mouse has left the button");
    }
  }, [isHovered]);

  return (
    <div className={styles.buttonContainer}>
      {/* Botón principal */}
      <button
        className={styles.button}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        onClick={onClick}
      >
        {buttonText}
      </button>

      {/* Tooltip */}
      <div
        className={`${styles.tooltip} ${
          isHovered && buttonHover ? styles.visible : ""
        }`}
      >
        {buttonHoverText}
      </div>
    </div>
  );
}

export default CustomButton;
