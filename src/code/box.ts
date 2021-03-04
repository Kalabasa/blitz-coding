import { v4 as uuid } from "uuid";

const idk = Symbol("id");

export type Box = {
  [idk]?: string;
};

function boxValue<T>(value: T): Box & T {
  if (value === null || value === undefined) return value;

  if (value instanceof Array || Array.isArray(value)) {
    const arr = [...value] as any;
    arr[idk] = uuid();
    return arr;
  }

  const obj = new (Object.getPrototypeOf(value).constructor)(value);
  obj[idk] = uuid();
  return obj;
}

function boxArrayValues(array: unknown[]): Box[] {
  return array.map((el) => boxValue(el));
}

function unbox(box: Box) {
  if (box === null || box === undefined) return box;
  return box.valueOf();
}

function deepUnbox(box: Box | any): any {
  if (box === null || box === undefined) return box;

  if (
    box instanceof Number ||
    box instanceof String ||
    box instanceof Boolean
  ) {
    return box.valueOf();
  }

  if (box instanceof Array || Array.isArray(box)) {
    return box.map(deepUnbox);
  }

  if (typeof box === "object") {
    return Object.entries(box as any).reduce(
      (acc: any, [key, value]: [string, any]) => {
        acc[key] = deepUnbox(value);
        return acc;
      },
      {}
    );
  }

  return box.valueOf();
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Box = Object.freeze({
  value: boxValue,
  arrayValues: boxArrayValues,
  unbox,
  deepUnbox,
});
