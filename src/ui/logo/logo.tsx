import classNames from "classnames";
import { useMemo } from "react";
import styles from "./logo.module.css";

const width = 100;
const height = 200;
const bevelLength = 16;
const rightNotchDepth = 25;
const rightNotchHeight = 40;
const leftNotchDepth = 30;
const leftNotchHeight = 110;

type Variant = "emoji" | "logo" | "colored" | "filled";

type LogoProps = {
  className?: string;
  variant: Variant;
};

export const Logo = ({ className, variant }: LogoProps) => (
  <svg
    className={classNames(styles.svg, className, styles[variant])}
    xmlns="http://www.w3.org/2000/svg"
    viewBox={`0 0 ${width} ${height}`}
  >
    <path fillRule="evenodd" d={useMemo(() => drawPath(variant), [variant])} />
  </svg>
);

function drawPath(variant: Variant) {
  let d = drawOuterPath();

  if (variant !== "filled") {
    d += " " + drawInnerPath();
  }

  return d;
}

function drawOuterPath() {
  let d = "";
  let x = 0;
  let y = 0;

  x += leftNotchDepth;
  d += ` M ${x} ${y}`;

  x = width;
  d += ` L ${x} ${y}`;

  y += bevelLength;
  d += ` L ${x} ${y}`;

  x -= rightNotchDepth;
  y += rightNotchHeight;
  d += ` L ${x} ${y}`;

  x += rightNotchDepth;
  d += ` L ${x} ${y}`;

  y += bevelLength;
  d += ` L ${x} ${y}`;

  x = 0;
  y = height;
  d += ` L ${x} ${y}`;

  x += leftNotchDepth;
  y -= leftNotchHeight;
  d += ` L ${x} ${y}`;

  x -= leftNotchDepth;
  d += ` L ${x} ${y}`;

  d += " Z";

  return d;
}

function drawInnerPath() {
  let d = "";
  let x = 0;
  let y = 0;

  x += leftNotchDepth + bevelLength * 0.5;
  y += bevelLength;
  d += ` M ${x} ${y}`;

  x = width - bevelLength;
  d += ` L ${x} ${y}`;

  x -= rightNotchDepth;
  y += rightNotchHeight;
  d += ` L ${x} ${y}`;

  y += bevelLength;
  d += ` L ${x} ${y}`;

  x += rightNotchDepth;
  d += ` L ${x} ${y}`;

  x = bevelLength * 1.6;
  y = height - bevelLength * 3.3;
  d += ` L ${x} ${y}`;

  x = leftNotchDepth + bevelLength * 0.95;
  y = height - leftNotchHeight - bevelLength * 0.65;
  d += ` L ${x} ${y}`;

  x -= leftNotchDepth;
  d += ` L ${x} ${y}`;

  d += " Z";

  return d;
}
