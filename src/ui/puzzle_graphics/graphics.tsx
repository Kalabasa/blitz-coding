import classNames from "classnames";
import { Run, Suite } from "code/run";
import React, {
  CSSProperties,
  ReactNode,
  useLayoutEffect,
  useState,
} from "react";
import { getVisibleRuns, runOutcome } from "round_types/utils";
import { CaseGrid } from "ui/puzzle_graphics/case_grid/case_grid";
import { PlainIO } from "ui/puzzle_graphics/plain_io/plain_io";
import styles from "./graphics.module.css";

export type GraphicsProps = {
  suite: Suite;
  runs?: Run[];
};

export type GraphicsBorderProps = {
  disableBottomRight?: boolean;
  disableTopLeft?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
};

export const GraphicsBorder = ({
  disableBottomRight,
  disableTopLeft,
  children,
  style,
}: GraphicsBorderProps) => (
  <div
    className={classNames({
      [styles.border]: true,
      [styles.disableBottomRight]: disableBottomRight,
      [styles.disableTopLeft]: disableTopLeft,
    })}
    style={style}
  >
    {children}
  </div>
);

export type BlinkOnChangeProps = {
  children?: ReactNode;
  value: any;
};

export const BlinkOnChange = ({ children, value }: BlinkOnChangeProps) => {
  const [show, setShow] = useState(false);

  useLayoutEffect(() => {
    setShow(false);
    setTimeout(() => setShow(true));
  }, [value]);

  return show ? <>{children}</> : null;
};

export const createPlainCaseGridGraphics = (
  rows?: number,
  columns?: number
) => ({ suite, runs }: { suite: Suite; runs?: Run[] }) => (
  <CaseGrid rows={rows} columns={columns}>
    {getVisibleRuns(countStableItems(rows, columns), suite, runs).map(
      ({ example, run }, i) => (
        <GraphicsBorder
          key={`${i}:${example.inputs.join(",")}`}
          style={
            {
              ["--caseIndex"]: `${i}`,
            } as CSSProperties
          }
        >
          <PlainIO
            funcName={suite.funcName}
            inputs={suite.inputNames.map((name, j) => [
              name,
              example.inputs[j].valueOf(),
            ])}
            expected={example.output.valueOf()}
            result={run?.output.valueOf()}
            outcome={runOutcome(run)}
          />
        </GraphicsBorder>
      )
    )}
  </CaseGrid>
);

function countStableItems(
  rows: number | undefined,
  columns: number | undefined
): number {
  return Math.floor(((rows ?? 0) * (columns ?? 0)) / 2);
}

/*
Text description
-----------------------------------------------
|                                             |
|                                             |
| Make a function that computes the nth prime |
|                                             |
|                                             |
-----------------------------------------------


Isolated cases
-------------------------------
|                             |
| n: 10  isEven: true         |
|                             |
-------------------------------
| n: 10  isEven: true         |
|                             |
| isEven(10)   = ?            |
-------------------------------
| n: 10  isEven: true         |
|                             |
| isEven(10)   = true     (✔) |
-------------------------------
| n: 10  isEven: true         |
|                             |
| isEven(10)   = false    (⨯) |
-------------------------------

Sequential cases
| n           | 1 | 2 | 3 | 4 |
| S_n         | 2 | 4 | 6 | 8 |

| n           | 1 | 2 | 3 | 4 |
| S_n         | 2 | 4 | 6 | 8 |
| sequence(n) | ? | ? | ? | ? |

| n           | 1 | 2 | 3 | 4 |
| S_n         | 2 | 4 | 6 | 8 |
| sequence(n) | 2✔| 3⨯| 4⨯| 5⨯|

Array manipulation
-------------------------------
|  [ B ]               [ A ]  |
|  [ A ]               [ B ]  |
|  [ E ]      ->       [ C ]  |
|  [ C ]               [ D ]  |
|  [ D ]               [ E ]  |
-------------------------------

-------------------------------
|     [ B ]     ?   |  [ A ]  |
|     [ A ]     ?   |  [ B ]  |
| fn( [ E ] ) = ?   |  [ C ]  |
|     [ C ]     ?   |  [ D ]  |
|     [ D ]     ?   |  [ E ]  |
-------------------------------
*/
