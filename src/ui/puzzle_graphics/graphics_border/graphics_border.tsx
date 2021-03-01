import classNames from 'classnames';
import { ReactNode, CSSProperties } from 'react';
import styles from "./graphics_border.module.css";

export type GraphicsBorderProps = {
  disableBottomRight?: boolean;
  disableTopLeft?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
};

export const GraphicsBorder = ({
  disableBottomRight,
  disableTopLeft,
  children,
  style,
}: GraphicsBorderProps) => (
  <div
    className={classNames({
      [styles.border]: true,
      [styles.disableBottomRight]: disableBottomRight,
      [styles.disableTopLeft]: disableTopLeft,
    })}
    style={style}
  >
    {children}
  </div>
);
