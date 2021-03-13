import { Case } from "code/case";
import { Run } from "code/run";
import { render } from "react-dom";
import { formatValue, toFormatString } from "ui/puzzle_graphics/graphics";

export type Random = () => number;

export function range(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

export function rangeCases(
  min: number,
  max: number,
  makeCase: (n: number) => Case
): Case[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i).map(makeCase);
}

export function formatValueText(value: unknown): string {
  const node = formatValue(value);
  const el = document.createElement("div");
  render([<>{node}</>], el);
  const { textContent } = el;
  el.remove();
  return textContent ?? "";
}

export function randomInt(
  min: number,
  max: number,
  random: Random = Math.random
): number {
  return (
    Math.ceil(min) + Math.floor(Math.random() * (1 + Math.ceil(max - min)))
  );
}

export function limitCalls(fn: Function, limit: number) {
  let calls = 0;
  const dummy = {
    [fn.name]: function () {
      if (calls > limit) {
        throw new Error(`${fn.name}() was called more than ${limit} times!`);
      }

      calls++;
      // @ts-ignore
      return fn.apply(this, arguments);
    },
  };
  return dummy[fn.name];
}

export function formattedFunction<T extends Function>(
  fn: T,
  source: string,
  name?: string
): T {
  type U = T & { [toFormatString]: Function };

  const funcName = name ?? fn.name ?? "Function";
  const dummy: { [k in string]: U } = {};

  dummy[funcName] = (function () {
    return fn.apply(null, arguments);
  } as unknown) as U;

  dummy[funcName].toString = () => funcName;
  dummy[funcName][toFormatString] = () => source;
  if ("toSource" in dummy[funcName]) {
    (dummy[funcName] as any).toSource = () => funcName;
  }

  return dummy[funcName];
}

export function pick<T>(array: T[], random: Random = Math.random): T {
  const i = Math.floor(random() * array.length);
  return array[i];
}

export function pluck<T>(array: T[], random: Random = Math.random): T {
  const i = Math.floor(random() * array.length);
  return array.splice(i, 1)[0];
}

export function shuffle(array: any[], random: Random = Math.random) {
  for (let i = 0; i < array.length; i++) {
    const j = Math.floor(random() * i);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function sample<T>(
  count: number,
  pool: T[],
  unique: boolean = true,
  random: Random = Math.random
): T[] {
  if (unique) pool = [...pool];
  count = Math.min(count, pool.length);
  const a = [];
  while (a.length < count) {
    a.push((unique || a.length === 0 ? pluck : pick)(pool, random));
  }
  return a;
}

function runOutcome(run?: Run): "success" | "failure" | undefined {
  return run === undefined ? undefined : run.match ? "success" : "failure";
}

export const RoundTypeUtil = Object.freeze({
  runOutcome,
});
