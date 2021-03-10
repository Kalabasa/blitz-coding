import { Case } from "code/case";
import { Run } from "code/run";

export type Random = () => number;

export function range(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

export function rangeCases(
  min: number,
  max: number,
  makeCase: (n: number) => { inputs: unknown[]; output: unknown }
): Case[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i).map(makeCase);
}

export function randomInt(
  min: number,
  max: number,
  random: Random = Math.random
): number {
  return min + Math.floor(Math.random() * (1 + Math.ceil(max - min)));
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

export function sample(
  count: number,
  pool: any[],
  unique: boolean = true,
  random: Random = Math.random
) {
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
