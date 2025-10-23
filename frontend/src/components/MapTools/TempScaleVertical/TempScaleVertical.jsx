import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import styles from "./TempScaleVertical.module.css";
import { AppContext } from "../../../Context";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const TempScaleVertical = () => {
  const { wbgtData, wbgtFilterRangeF, setWbgtFilterRangeF } =
    useContext(AppContext);

  // Compute domain in °F from wbgtData
  const domainF = useMemo(() => {
    const kToF = (k) => ((k - 273.15) * 9) / 5 + 32;
    if (!wbgtData?.min || !wbgtData?.max) return [78, 95];
    const minF = kToF(wbgtData.min);
    const maxF = kToF(wbgtData.max);
    return [Math.min(minF, maxF), Math.max(minF, maxF)];
  }, [wbgtData?.min, wbgtData?.max]);

  const [min, max] = domainF;

  // Low/high filter state
  const [low, setLow] = useState(min);
  const [high, setHigh] = useState(max);

  // Flags: has user touched bars yet?
  const [touchedLow, setTouchedLow] = useState(false);
  const [touchedHigh, setTouchedHigh] = useState(false);

  // When wbgtData changes, reset to extremes unless touched
  useEffect(() => {
    if (!wbgtData) return;
    if (!touchedLow) {
      setLow(min);
    } else {
      setLow((prev) => clamp(prev, min, max));
    }

    if (!touchedHigh) {
      setHigh(max);
    } else {
      setHigh((prev) => clamp(prev, min, max));
    }
  }, [wbgtData, min, max, touchedLow, touchedHigh]);

  // Utility: value ↔ position
  const valueToTopPct = (v) => {
    const fracFromBottom = (v - min) / (max - min);
    return (1 - fracFromBottom) * 100;
  };
  const topPctHigh = valueToTopPct(high);
  const topPctLow = valueToTopPct(low);

  const scaleRef = useRef(null);
  const dragging = useRef(null); // "low" | "high" | null

  const yToValue = (clientY) => {
    const rect = scaleRef.current.getBoundingClientRect();
    const y = clamp(clientY - rect.top, 0, rect.height);
    const pctTop = rect.height ? y / rect.height : 0;
    const fracFromBottom = 1 - pctTop;
    return clamp(min + fracFromBottom * (max - min), min, max);
  };

  // Global drag handlers
  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const t = e.touches?.[0];
      const clientY = t ? t.clientY : e.clientY;
      const v = yToValue(clientY);
      if (dragging.current === "low") {
        setLow((prev) => Math.min(v, high));
        setTouchedLow(true);
      }
      if (dragging.current === "high") {
        setHigh((prev) => Math.max(v, low));
        setTouchedHigh(true);
      }
    };
    const onUp = () => {
      dragging.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [low, high, min, max]);

  // Push to context (debounced)
  const deb = useRef(null);
  useEffect(() => {
    if (typeof setWbgtFilterRangeF !== "function") return;
    clearTimeout(deb.current);
    deb.current = setTimeout(() => {
      const lo = Math.min(low, high);
      const hi = Math.max(low, high);
      setWbgtFilterRangeF([lo, hi]);
    }, 120);
    return () => clearTimeout(deb.current);
  }, [low, high, setWbgtFilterRangeF]);

  // Initial down
  const handleScaleDown = (clientY) => {
    const clicked = yToValue(clientY);
    const dLow = Math.abs(clicked - low);
    const dHigh = Math.abs(clicked - high);
    const which = dLow < dHigh ? "low" : "high";
    dragging.current = which;
    if (which === "low") {
      setLow(Math.min(clicked, high));
      setTouchedLow(true);
    }
    if (which === "high") {
      setHigh(Math.max(clicked, low));
      setTouchedHigh(true);
    }
  };

  return (
    <div
      className={styles.container}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <span className={styles.labelTop}>{max.toFixed(1)}°F</span>

      <div
        className={styles.scale}
        ref={scaleRef}
        onPointerDown={(e) => handleScaleDown(e.clientY)}
        onTouchStart={(e) => {
          const t = e.touches?.[0];
          if (t) handleScaleDown(t.clientY);
        }}
      >
        {/* Shading outside selected range */}
        <div className={styles.shadeTop} style={{ height: `${topPctHigh}%` }} />
        <div className={styles.shadeBottom} style={{ top: `${topPctLow}%` }} />

        {/* Top bar */}
        <div
          className={styles.bar}
          style={{ top: `calc(${topPctHigh}% - 3px)` }}
          onPointerDown={(e) => {
            e.stopPropagation();
            dragging.current = "high";
            setTouchedHigh(true);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            dragging.current = "high";
            setTouchedHigh(true);
          }}
        />
        {touchedHigh && high !== max && (
          <div
            className={styles.barLabelTop}
            style={{ top: `calc(${topPctHigh}% - 16px)` }}
          >
            {Math.round(high)}°F
          </div>
        )}

        {/* Bottom bar */}
        <div
          className={styles.bar}
          style={{ top: `calc(${topPctLow}% - 3px)` }}
          onPointerDown={(e) => {
            e.stopPropagation();
            dragging.current = "low";
            setTouchedLow(true);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            dragging.current = "low";
            setTouchedLow(true);
          }}
        />
        {touchedLow && low !== min && (
          <div
            className={styles.barLabelBottom}
            style={{ top: `calc(${topPctLow}% + 8px)` }}
          >
            {Math.round(low)}°F
          </div>
        )}
      </div>

      <span className={styles.labelBottom}>{min.toFixed(1)}°F</span>
    </div>
  );
};

export default TempScaleVertical;
