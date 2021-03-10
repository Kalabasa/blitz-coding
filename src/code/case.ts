export type Case = {
  inputs: any[];
  output: any;
  visibility?: "visible" | "discoverable";
};

function matchOutput(output: any, ex: Case): boolean {
  const a = output;
  const b = ex.output;
  return equal(a, b);
}

function equal(a: any, b: any): boolean {
  if (a == b) return true;

  const aIsArray = a instanceof Array || Array.isArray(a);
  const bIsArray = b instanceof Array || Array.isArray(b);
  if (aIsArray !== bIsArray) {
    return false;
  } else if (aIsArray && bIsArray) {
    return (
      a.length === b.length && a.every((v: any, i: number) => equal(v, b[i]))
    );
  }

  switch (typeof a) {
    case "number":
      const signA = Math.sign(a);
      const signB = Math.sign(b);
      const decimalA = Math.round(1000 * Math.abs(a))
        .toString()
        .padStart(3, "0");
      const decimalB = Math.round(1000 * Math.abs(b))
        .toString()
        .padStart(3, "0");
      const integralA = decimalA.slice(0, -3);
      const integralB = decimalB.slice(0, -3);
      const fractionalA = decimalA.slice(-3);
      const fractionalB = decimalB.slice(-3);
      return (
        signA === signB &&
        integralA === integralB &&
        fractionalA === fractionalB
      );
    case "object":
      if (typeof b !== "object") return false;
      return Object.keys(a).every((k) => equal(a[k], b[k]));
  }

  return false;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Case = Object.freeze({
  matchOutput,
});
