import classNames from "classnames";
import React, { Fragment } from "react";
import { BlinkOnChange } from "ui/blink_on_change/blink_on_change";
import { formatValue } from "ui/puzzle_graphics/graphics";
import { Mark } from "ui/puzzle_graphics/mark/mark";
import styles from "./plain_io.module.css";

export type PlainIOProps = {
  inputs: [string, any][];
  funcName: string;
  expected: any;
  result?: any;
  outcome?: "success" | "failure";
};

export const PlainIO = ({
  inputs,
  funcName,
  expected,
  result,
  outcome,
}: PlainIOProps) => (
  <div className={classNames(styles.container, outcome && styles[outcome])}>
    <div className={styles.inputSection}>
      {inputs.map(([name, value]) => (
        <div key={name} className={styles.inputLine}>
          <span className={styles.inputName}>{name}:</span>
          <span className={styles.inputValue}>
            {formatValue(value, { maxFuncStrLen: 30 })}
          </span>
        </div>
      ))}
    </div>
    <div className={styles.expectationSection}>
      <span className={styles.funcName}>{funcName}:</span>{" "}
      <span className={styles.expected}>{formatValue(expected)}</span>
    </div>
    <BlinkOnChange value={result}>
      <div
        className={classNames({
          [styles.resultSection]: true,
        })}
      >
        <span className={styles.resultPrefix}>
          {funcName}(
          {inputs.map(([name], i) => (
            <Fragment key={i}>
              {i > 0 && <>,</>}
              {name}
            </Fragment>
          ))}
          )&nbsp;=&nbsp;
        </span>
        <span
          className={classNames(styles.result, !outcome && styles.emptyResult)}
        >
          {outcome ? formatValue(result) : "?"}
        </span>
        {outcome && (
          <Mark
            className={styles.mark}
            type={outcome === "success" ? "check" : "cross"}
          />
        )}
      </div>
    </BlinkOnChange>
  </div>
);
