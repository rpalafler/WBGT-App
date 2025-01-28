import React from "react";
import styles from "./Button.module.css";
import { useNavigate } from "react-router-dom";

const Button = ({ label, to }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <button className={styles.button} onClick={handleClick}>
      {label}
    </button>
  );
};

export default Button;
