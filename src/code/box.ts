const idk = Symbol("id");

export type Box = {
  [idk]?: string;
};

function boxValue<T>(value: T, id?: string): Box & T {
  if (value === null || value === undefined) return value;
  let obj = new (Object.getPrototypeOf(value).constructor)(value);
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

export const Box = Object.freeze({
  value: boxValue,
  arrayValues: boxArrayValues,
  unbox,
});
