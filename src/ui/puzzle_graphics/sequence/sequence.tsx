import classNames from "classnames";
import { Run, Suite } from "code/run";
import React, { CSSProperties, useLayoutEffect, useRef } from "react";
import { RoundTypeUtil } from "round_types/utils";
import { BlinkOnChange } from "ui/blink_on_change/blink_on_change";
import { formatValue } from "ui/puzzle_graphics/graphics";
import { Mark } from "ui/puzzle_graphics/mark/mark";
import styles from "./sequence.module.css";

export type SequenceProps = {
  length: number;
  suite: Suite;
  runs?: Run[];
};

export const Sequence = ({ length, suite, runs }: SequenceProps) => {
  const itemContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const itemContainer = itemContainerRef.current;

    if (!itemContainer) return;

    const htmlChildren = itemContainer.querySelectorAll(`div.${styles.item}`);
    const lastVisibleIndex =
      length < htmlChildren.length ? length - 1 : htmlChildren.length - 1;
    const lastVisibleElement = htmlChildren[lastVisibleIndex] as HTMLDivElement;

    itemContainer.style.width =
      lastVisibleElement.offsetLeft + lastVisibleElement.offsetWidth + "px";

    if (runs) {
      let mismatchIndex: number;
      if ((mismatchIndex = runs.findIndex((r) => r.match !== true)) >= 0) {
        const prevIndex = Math.max(0, mismatchIndex - 1);
        const prevElement = htmlChildren[prevIndex] as HTMLDivElement;
        setTimeout(
          () =>
            linearScroll(
              () => itemContainerRef.current ?? itemContainer,
              Math.max(0, prevElement.offsetLeft),
              mismatchIndex * 30
            ),
          400
        );
      }
    } else {
      itemContainer.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }
  }, [length, runs]);

  return (
    <div className={styles.container}>
      <div className={styles.headers}>
        <div className={styles.numberHeader}>n</div>
        <div className={styles.expectationHeader}>
          S<span className={styles.subscript}>n</span>
        </div>
        <div className={styles.resultHeader}>{`${suite.funcName}(n)`}</div>
      </div>
      <div className={styles.itemContainer} ref={itemContainerRef}>
        {suite.cases.map((example, i) => {
          const run = runs?.[i];
          return (
            <Item
              key={example.inputs[0].toString()}
              index={i}
              n={example.inputs[0]}
              expected={example.output}
              result={run?.output}
              outcome={RoundTypeUtil.runOutcome(run)}
            />
          );
        })}
      </div>
    </div>
  );
};

type ItemProps = {
  index: number;
  n: any;
  expected: any;
  result?: any;
  outcome?: "success" | "failure";
};

const Item = ({ index, n, expected, result, outcome }: ItemProps) => (
  <div
    key={n}
    className={styles.item}
    style={
      {
        // eslint-disable-next-line no-useless-computed-key
        ["--caseIndex"]: `${index}`,
      } as CSSProperties
    }
  >
    <div className={styles.itemNumber}>{formatValue(n)}</div>
    <div className={styles.expected}>{formatValue(expected)}</div>
    <BlinkOnChange value={result}>
      <div
        className={classNames(styles.result, !outcome && styles.emptyResult)}
      >
        {outcome ? formatValue(result) : "?"}
      </div>
      {outcome && (
        <Mark
          className={styles.mark}
          type={outcome === "success" ? "check" : "cross"}
        />
      )}
    </BlinkOnChange>
  </div>
);

function linearScroll(
  getElement: () => HTMLElement,
  x: number,
  duration: number
) {
  const startTime = Date.now();
  const endTime = startTime + duration;
  const time = () => (Date.now() - startTime) / (endTime - startTime);

  const startScroll = getElement().scrollLeft;
  const lerp = (t: number) => startScroll + t * (x - startScroll);

  const updateLoop = () => {
    const el = getElement();
    const t = time();
    if (t < 1) {
      el.scrollLeft = lerp(t);
      requestAnimationFrame(updateLoop);
    } else {
      el.scrollLeft = x;
    }
  };

  updateLoop();
}
