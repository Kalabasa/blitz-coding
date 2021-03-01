const idk = Symbol("id");

export type Box = {
  [idk]?: string;
};

function boxValue<T>(value: T, id?: string): Box & T {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    const arr = [...value] as any;
    arr[idk] = id;
    return arr;
  }

  const obj = new (Object.getPrototypeOf(value).constructor)(value);
  obj[idk] = id;
  return obj;
}

function boxArrayValues(
  array: unknown[],
  id?: (index: number) => string
): Box[] {
  return array.map((el, i) => boxValue(el, id?.(i)));
}

function unbox(box: Box) {
  if (box === null || box === undefined) return box;
  return box.valueOf();
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Box = Object.freeze({
  value: boxValue,
  arrayValues: boxArrayValues,
  unbox,
});
