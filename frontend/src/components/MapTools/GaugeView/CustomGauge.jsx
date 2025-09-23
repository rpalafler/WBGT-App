import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import styles from "./GaugeView.module.css";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n"; // adjust the path if needed

const GaugeChart2 = ({ wbgt = 72 }) => {
  const svgRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const el = d3.select(svgRef.current);
    el.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const width = 280; // puedes probar con 280, 320, etc.
    const height = 180; // suficiente para que el SVG se vea
    const radius = Math.min(width, height) / 1.2;

    const percToRad = (perc) => (perc * Math.PI * 180) / 180;
    let totalPercent = 0.0;

    const svg = el
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const chart = svg
      .append("g")
      .attr(
        "transform",
        `translate(${(width + margin.left) / 2}, ${height + margin.top})`
      );

    const sections = [
      { limit: 72, color: "green", label: t("Safe") },
      { limit: 76, color: "yellow", label: t("Caution") },
      { limit: 80, color: "orange", label: t("Warning") },
      { limit: 84, color: "#fa0808ff", label: t("Danger") },
      { limit: Infinity, color: "#880101ff", label: t("Extreme") },
    ];

    const numSections = sections.length;
    const sectionPerc = 1 / numSections;

    // Create colored sections and labels
    sections.forEach((section, index) => {
      const arcStartRad = percToRad(totalPercent) - Math.PI / 2; // Shift start to 9 o'clock
      const arcEndRad = arcStartRad + percToRad(sectionPerc);
      totalPercent += sectionPerc;

      const arc = d3
        .arc()
        .outerRadius(radius - 15)
        .innerRadius(radius - 40)
        .startAngle(arcStartRad)
        .endAngle(arcEndRad);

      chart.append("path").attr("d", arc).attr("fill", section.color);

      // Add text labels for sections
      const labelAngle = (arcStartRad + arcEndRad) / 2 - Math.PI / 2; // Adjust for 9 o'clock start
      const labelX = radius * Math.cos(labelAngle);
      const labelY = radius * Math.sin(labelAngle);
      const labelRotation = (labelAngle * 180) / Math.PI + 90; // Convert to degrees

      chart
        .append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("class", `gauge-label label-${index}`) // NEW
        .attr("alignment-baseline", "middle")
        .attr("transform", `rotate(${labelRotation}, ${labelX}, ${labelY})`) // Rotate text around its position
        .style("fill", "white")
        .style("font-size", "16px")

        .text(section.label);

      // Add number values at borders of labels
      const borderX = (radius - 60) * Math.cos(arcEndRad - Math.PI / 2);
      const borderY = (radius - 60) * Math.sin(arcEndRad - Math.PI / 2);

      chart
        .append("text")
        .attr("x", borderX)
        .attr("y", borderY)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("fill", "white")
        .style("font-size", "17px")
        .text(section.limit === Infinity ? "" : section.limit);
    });

    class Needle {
      constructor(len, radius) {
        this.len = len;
        this.radius = radius;
      }

      drawOn(el, perc) {
        el.append("circle")
          .attr("class", "needle-center")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", this.radius)
          .attr("fill", "white");

        el.append("path")
          .attr("class", "needle")
          .attr("fill", "white")
          .attr("d", this.mkCmd(perc));

        // Add printed value below the needle
        el.append("text")
          .attr("class", "wbgt-value")
          .attr("x", 0)
          .attr("y", 40) // Position slightly below the needle
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .style("font-size", "30px")
          .style("fill", "white")
          .text("WBGT: " + wbgt.toFixed(1) + "°F");
      }

      animateOn(el, perc) {
        el.transition()
          .ease(d3.easeElastic)
          .duration(2000)
          .selectAll(".needle")
          .attrTween("d", () => {
            return (t) => this.mkCmd(t * perc);
          });

        // Animate the value display
        // Animate the value display
        el.transition()
          .duration(2000)
          .select(".wbgt-value")
          .tween("text", function () {
            const interpolate = d3.interpolateNumber(0, wbgt);
            return function (t) {
              d3.select(this).text("WBGT: " + interpolate(t).toFixed(1) + "°F");
            };
          });
      }

      mkCmd(perc) {
        const thetaRad = percToRad(perc);
        const topX = -this.len * Math.cos(thetaRad);
        const topY = -this.len * Math.sin(thetaRad);
        const leftX = -this.radius * Math.cos(thetaRad - Math.PI / 2);
        const leftY = -this.radius * Math.sin(thetaRad - Math.PI / 2);
        const rightX = -this.radius * Math.cos(thetaRad + Math.PI / 2);
        const rightY = -this.radius * Math.sin(thetaRad + Math.PI / 2);
        return `M ${leftX} ${leftY} L ${topX} ${topY} L ${rightX} ${rightY} Z`;
      }
    }

    const minWBGT = 68;
    const maxWBGT = 88;
    const normalizedPercent = Math.max(
      0,
      Math.min(1, (wbgt - minWBGT) / (maxWBGT - minWBGT))
    );
    const needle = new Needle(radius * 0.8, 8);
    needle.drawOn(chart, 0);
    needle.animateOn(chart, normalizedPercent);
  }, [wbgt, i18n.language]);

  return <div ref={svgRef} className={styles.gaugeWrapper}></div>;
};

export default GaugeChart2;
