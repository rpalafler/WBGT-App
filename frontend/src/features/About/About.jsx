import React from "react";
import styles from "./About.module.css";
const About = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About the WBGT Project</h1>
      <div className={styles.columns}>
        {/* Primera columna */}
        <div className={styles.column}>
          <h2 className={styles.subtitle}>What is the WBGT Project?</h2>
          <p className={styles.text}>
            The WBGT Project is designed to provide users with an intuitive and
            interactive way to visualize meteorological data on global maps. Our
            primary goal is to maintain simplicity in functionality, ensuring it
            remains user-oriented and accessible to a wide audience.
          </p>
          <p className={styles.text}>
            The platform focuses on scalability and modularity, allowing users
            to explore data while keeping customization and learning at its
            core.
          </p>
        </div>

        {/* Segunda columna */}
        <div className={styles.column}>
          <h2 className={styles.subtitle}>Developers</h2>
          <div className={styles.developer}>
            <h3 className={styles.devName}>Miguel Bravo</h3>
            <p className={styles.text}>
              Miguel Bravo is a passionate developer focused on creating
              user-friendly interfaces. He has a strong background in front-end
              development and loves building tools that make complex data
              accessible.
            </p>
            <a
              href="https://mabravo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Visit Miguel's Website
            </a>
          </div>
          <div className={styles.developer}>
            <h3 className={styles.devName}>Ryan Lafler</h3>
            <p className={styles.text}>
              Ryan Lafler specializes in back-end systems and scalable
              architecture. He enjoys solving challenging problems and
              optimizing applications for performance.
            </p>
            <a
              href="https://www.premier-analytics.com/ryan-paul-lafler"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Visit Ryan's Website
            </a>
          </div>
        </div>
      </div>
      <a href="/" className={styles.button}>
        Back to Map
      </a>
    </div>
  );
};

export default About;
