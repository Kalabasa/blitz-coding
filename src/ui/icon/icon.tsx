import classNames from "classnames";
import { ComponentType, CSSProperties, SVGProps } from "react";
import styles from "./icon.module.css";

export type IconProps = {
  className?: string;
  style?: CSSProperties;
  svg: ComponentType<SVGProps<SVGSVGElement>>;
};

export const Icon = ({ className, style, svg: Component }: IconProps) => {
  return (
    <Component className={classNames(styles.icon, className)} style={style} />
  );
};
