import styles from "./colors.module.css";

export type Color = {
  r: number; // [0,255]
  g: number; // [0,255]
  b: number; // [0,255]
  a: number; // [0,1]
};

const colors: [string, Color][] = [];

for (let [name, value] of Object.entries(styles)) {
  if (name.endsWith("Color")) {
    colors.push([name.substring(0, name.length - 5), convertColor(value)]);
  }
}

function convertColor(cssString: string): Color {
  if (cssString.startsWith("rgb(")) {
    const [, ...rgb] =
      /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(cssString) ??
      unsupported(cssString);
    const [r, g, b] = rgb.map(Number);
    return { r, g, b, a: 255 };
  }

  if (cssString.startsWith("rgba(")) {
    const [, ...rgba] =
      /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+\.?\d+)\s*\)/.exec(
        cssString
      ) ?? unsupported(cssString);
    const [r, g, b, a] = rgba.map(Number);
    return { r, g, b, a };
  }

  unsupported(cssString);
}

function unsupported(string?: string): never {
  throw new Error(`Unsupported format: '${string}'`);
}

export const Color = Object.fromEntries(colors);

export const interpolateColor = (a: Color, b: Color, t: number): Color => ({
  r: gerp(a.r, b.r, t),
  g: gerp(a.g, b.g, t),
  b: gerp(a.b, b.b, t),
  a: gerp(a.a, b.a, t),
});

const gerp = (a: number, b: number, t: number) =>
  Math.pow(a * a * (1 - t) + b * b * t, 0.5);
