import React from "react";
import styles from "./About.module.css";

const About = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About the WBGT Project</h1>
      <p className={styles.description}>
        This project is designed to visualize interactive meteorological data
        using global maps. Our goal is to provide a modular and scalable
        experience that allows for customization and learning.
      </p>
      <img
        src="/assets/project-example.jpg"
        alt="Project example"
        className={styles.image}
      />
      <p className={styles.description}>
        Advanced tools for meteorological data analysis will be integrated in
        the future.
      </p>
      <a href="/" className={styles.button}>
        Back to Map
      </a>
    </div>
  );
};

export default About;
