import { Case } from "code/case";
import { Run, Suite } from "code/run";
import React, {
  CSSProperties,
  Fragment,
  PropsWithChildren,
  ReactNode,
} from "react";
import { RoundTypeUtil } from "round_types/utils";
import { CaseGrid } from "ui/puzzle_graphics/case_grid/case_grid";
import { GraphicsBorder } from "ui/puzzle_graphics/graphics_border/graphics_border";
import { PlainIO } from "ui/puzzle_graphics/plain_io/plain_io";
import styles from "./graphics.module.css";

export type GraphicsProps = {
  suite: Suite;
  runs?: Run[];
};

type FormatStyle = undefined | "native" | "shortest";

export type FormatOptions = {
  style?: FormatStyle;
  maxFuncStrLen?: number;
};

export const toFormatString = Symbol("toFormatString");

export function formatValue(value: unknown, opts?: FormatOptions): ReactNode {
  if (value === undefined) return "undefined";
  if (value === null) return "null";

  const { style, maxFuncStrLen } = opts ?? {};

  if (style === undefined && (value as any)[toFormatString]) {
    return (value as any)[toFormatString]();
  }

  if (style === "native") {
    return "" + value;
  }

  value = (value as any).valueOf();

  if (value === undefined) return "undefined";
  if (value === null) return "null";

  if (value instanceof Array || Array.isArray(value)) {
    if (style === "shortest") {
      const json = JSON.stringify(value);
      const alt = shortest([
        (value as any)[toFormatString]?.(),
        value.toString(),
        "array",
      ]);
      if (alt.length < json.length) return alt;
    }

    return (
      <>
        <Sym>[</Sym>
        {value.map((v, i) => (
          <Fragment key={i}>
            {i > 0 && <Sym>,&#8203;</Sym>}
            {formatValue(v, opts)}
          </Fragment>
        ))}
        <Sym>]</Sym>
      </>
    );
  }

  switch (typeof value) {
    case "string":
      return (
        <>
          <Sym>‘</Sym>
          {value.replace(/\\/g, "\\\\").replace("'", "\\'")}
          <Sym>’</Sym>
        </>
      );

    case "number":
      if (
        Number.isNaN(value) ||
        value === Number.POSITIVE_INFINITY ||
        value === Number.NEGATIVE_INFINITY
      ) {
        return "" + value;
      }

      let num = value * 100;

      const floatError = Math.abs(num - Math.round(num)) < 1e-12;
      if (floatError) {
        num = Math.round(100 * num) / 100;
      }

      const truncate =
        Math.abs(Math.round(Math.abs(num)) - Math.abs(num)) > 1e-6;
      const sign = Math.sign(num);

      const decimal = Math.round(Math.abs(num)).toString().padStart(3, "0");
      const integral = decimal.slice(0, -2);
      let fractional = decimal.slice(-2);
      if (!truncate) fractional = fractional.replace(/0+$/, "");

      return (
        <>
          {sign < 0 ? "-" : ""}
          {integral ?? "0"}
          {fractional ? "." + fractional : ""}
          {truncate ? <Sym>…</Sym> : ""}
        </>
      );

    case "boolean":
      return "" + value;

    case "function":
      const funcStr = value.toString();

      if (style === "shortest") {
        return shortest([funcStr, value.name, "function"]);
      }

      return funcStr && funcStr.length <= (maxFuncStrLen ?? 12)
        ? funcStr
        : value.name ?? "function";

    case "object":
      if (value === null) return "null";
      if (value instanceof Date) return value.toISOString();

      if (style === "shortest") {
        const json = JSON.stringify(value);
        const alt = shortest([
          (value as any)[toFormatString]?.(),
          value.toString(),
          "object",
        ]);
        if (alt.length < json.length) return alt;
      }

      return (
        <>
          <Sym>{"{"}</Sym>
          {Object.keys(value).map((k, i) => {
            const key = formatKey(k);
            return (
              <Fragment key={i}>
                {i > 0 && <Sym>,&#8203;</Sym>}
                {key}
                <Sym>:</Sym>
                {formatValue((value as any)[k], opts)}
              </Fragment>
            );
          })}
          <Sym>{"}"}</Sym>
        </>
      );
  }

  throw new Error("Unsupported value: " + value);
}

function shortest(arr: string[]): string {
  arr = arr.filter((s) => s);
  let min = arr[0];
  for (let s of arr.slice(1)) {
    if (s.length < min.length) min = s;
  }
  return min;
}

function formatKey(k: string) {
  return /^[a-z_$][a-z0-9_$]*$/i.test(k) ? (
    k
  ) : (
    <>
      <Sym>“</Sym>
      {k}
      <Sym>”</Sym>
    </>
  );
}

const Sym = ({ children }: PropsWithChildren<{}>) => (
  <span className={styles.symbol}>{children}</span>
);

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
              // eslint-disable-next-line no-useless-computed-key
              ["--caseIndex"]: `${i}`,
            } as CSSProperties
          }
        >
          <PlainIO
            funcName={suite.funcName}
            inputs={suite.inputNames.map((name, j) => [
              name,
              example.inputs[j],
            ])}
            expected={example.output}
            result={run?.output}
            outcome={RoundTypeUtil.runOutcome(run)}
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

// returns: range[0, 1]
// higher order shows up first
function inputValueSortOrder(value: any): number {
  if (value === undefined) return 0;
  if (value === null) return 0;
  const p = value.valueOf();

  if (p instanceof Array || Array.isArray(p)) {
    const itemSum: number = p.reduce(
      (acc, v) => acc + inputValueSortOrder(v),
      0
    );
    return p.length ? itemSum / p.length : 0;
  }

  switch (typeof p) {
    case "boolean":
      return p ? 1 : 0.5;
    case "number":
      return isFinite(p) ? (p > 0 ? 1 / p : 0.01 / (1 - p)) : 0;
    case "string":
      return p.length ? 0.5 / p.length : 0;
    case "function":
      return 0.5 * inputValueSortOrder(p.toString());
    case "object":
      if (p === null) return 0;
      return 0.5 * inputValueSortOrder(Object.values(p));
  }

  return 0;
}

function caseSortOrder(example: Case, run?: Run) {
  let order = 0;

  if (!example.visibility || example.visibility === "visible") order += 10;

  if (run?.match === false) order += 100;

  order +=
    example.inputs.reduce((acc, value) => acc + inputValueSortOrder(value), 0) /
    example.inputs.length;

  return order;
}

const orderKey = Symbol("order");

export function getVisibleRuns(
  stableCount: number,
  suite: Suite,
  runs?: Run[]
): { example: Case; run?: Run }[] {
  const items = [...suite.cases].map((c, i) => ({
    example: c,
    run: runs?.[i],
  }));

  const stableItems = items
    .map((obj) => ({
      ...obj,
      [orderKey]: caseSortOrder(obj.example),
    }))
    .sort((a, b) => b[orderKey] - a[orderKey])
    .slice(0, stableCount);

  const dynamicItems = items
    .filter((item) => !stableItems.some((si) => si.example === item.example))
    .map((obj) => ({
      ...obj,
      [orderKey]: caseSortOrder(obj.example, obj.run),
    }))
    .sort((a, b) => b[orderKey] - a[orderKey]);

  return stableItems.concat(dynamicItems);
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
