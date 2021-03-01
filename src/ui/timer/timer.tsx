import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Color, interpolateColor } from "ui/styles/colors";
import styles from "./timer.module.css";

export type TimerProps = {
  startTime: number;
  endTime: number;
};

export const Timer = ({ startTime, endTime }: TimerProps) => {
  const [now, setNow] = useState(Date.now());
  const barRef = useRef<HTMLDivElement>(null);

  const left = Math.floor(Math.max(0, endTime - now));

  const updateBar = useCallback(() => {
    let bar = barRef.current;
    if (!bar) return;

    let t = (Date.now() - startTime) / (endTime - startTime);
    t = Math.min(1, Math.max(0, 1 - t));

    const quantized = Math.ceil(t * 100) / 100;
    bar.style.width = `${quantized * 100}%`;
    bar.style.transform = `scaleX(${t / quantized})`;

    const safeColor = Color.success;
    const dangerColor = Color.failure;
    const color = interpolateColor(
      dangerColor,
      safeColor,
      Math.min(1, Math.max(0, (t - 0.25) * 6 + 0.25))
    );
    bar.style.background = `rgb(${color.r},${color.g},${color.b})`;
  }, [startTime, endTime]);

  useEffect(() => {
    function loop() {
      setNow(Date.now());
      updateBar();
      if (looping) requestAnimationFrame(loop);
    }
    let looping = true;
    loop();
    return () => {
      looping = false;
    };
  }, [updateBar]);

  return (
    <div className={styles.container}>
      <div className={styles.barContainer}>
        <div ref={barRef} className={styles.bar} />
      </div>
      <TimeDisplay seconds={Math.floor(left / 1000)} />
    </div>
  );
};

const TimeDisplay = memo(({ seconds }: { seconds: number }) => (
  <div className={styles.timeDisplay}>{format(seconds)}</div>
));

function format(seconds: number) {
  const displaySeconds = seconds % 60;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${displaySeconds.toString().padStart(2, "0")}`;
}
