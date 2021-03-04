import classNames from "classnames";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Color, interpolateColor } from "ui/styles/colors";
import styles from "./timer.module.css";

export type TimerProps = {
  startTime: number | undefined;
  endTime: number | undefined;
};

export const Timer = ({ startTime = 0, endTime = 0 }: TimerProps) => {
  const [now, setNow] = useState(Date.now());
  const barRef = useRef<HTMLDivElement>(null);

  const left = Math.max(0, endTime - now);

  const updateBar = useCallback(() => {
    let bar = barRef.current;
    if (!bar) return;
    updateBarStyles(startTime, endTime, bar);
  }, [startTime, endTime]);

  useEffect(() => {
    function loop() {
      if (!looping) return;
      setNow(Date.now());
      updateBar();
      requestAnimationFrame(loop);
    }
    let looping = true;
    loop();
    return () => {
      looping = false;
    };
  }, [updateBar]);

  const warnClass =
    left < 6000
      ? styles.warnVeryHigh
      : left < 11000
      ? styles.warnHigh
      : left < 31000
      ? styles.warnLow
      : styles.warnNone;

  if (!startTime || !endTime) return null;

  return (
    <div
      className={classNames({
        [styles.container]: true,
        [styles.active]: startTime <= now && left > 0,
        [warnClass]: true,
      })}
    >
      <TimeDisplay
        seconds={Math.floor(left / 1000)}
        total={endTime - startTime}
      />
      <div ref={barRef} className={styles.bar}>
        <div className={styles.barEffects} />
      </div>
    </div>
  );
};

const TimeDisplay = memo(
  ({ seconds, total }: { seconds: number; total: number }) => (
    <div className={styles.timeDisplay}>{format(seconds, total)}</div>
  )
);

function updateBarStyles(
  startTime: number,
  endTime: number,
  bar: HTMLDivElement
) {
  let t = (Date.now() - startTime) / (endTime - startTime);
  t = Math.min(1, Math.max(0, 1 - t));

  const quantized = Math.ceil(t * 100) / 100;
  bar.style.width = `${quantized * 100}%`;
  bar.style.transform = `scaleX(${t / quantized})`;

  const safeColor = Color.accent;
  const dangerColor = Color.failure;
  const color = interpolateColor(
    dangerColor,
    safeColor,
    Math.min(1, Math.max(0, (t - 0.4) * 6 + 0.25))
  );
  bar.style.setProperty("--barColor", `rgb(${color.r},${color.g},${color.b})`);
}

function format(seconds: number, total: number) {
  const secondsOnly = total <= 100 || seconds <= 60;
  if (secondsOnly) return seconds;

  const minutes = Math.floor(seconds / 60);
  const displaySeconds = (seconds % 60)
    .toString()
    .padStart(seconds >= 10 ? 2 : 0, "0");
  const displayMinutes = minutes > 0 ? `${minutes}:` : "";
  return `${displayMinutes}${displaySeconds}`;
}
