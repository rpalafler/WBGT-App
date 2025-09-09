import React, { useContext } from "react";
import styles from "../MoreInfoButton/MoreInfoButton.module.css";
import { useTranslation } from "react-i18next";
import { AppContext } from "../../../Context";
import i18n from "../../../i18n";

const TranslateButton = () => {
  const { t } = useTranslation();
  const { windowWidth } = useContext(AppContext);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "es" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      className={`${styles.button} ${
        windowWidth < 768 ? styles.iconButton : ""
      }`}
      onClick={(e) => {
        e.stopPropagation();
        toggleLanguage();
      }}
    >
      <span className={styles.iconText}>
        {i18n.language === "en"
          ? windowWidth < 768
            ? "SP"
            : "Español"
          : windowWidth < 768
          ? "EN"
          : "English"}
      </span>
    </button>
  );
};

export default TranslateButton;
