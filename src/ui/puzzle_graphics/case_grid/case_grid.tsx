import { Children, ReactNode } from "react";
import styles from "./case_grid.module.css";

export type CaseGridProps = {
  columns?: number;
  rows?: number;
  children?: ReactNode;
};

export const CaseGrid = ({
  columns = 1,
  rows = 1,
  children,
}: CaseGridProps) => (
  <div
    className={styles.container}
    style={{
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
    }}
  >
    {Children.toArray(children).slice(0, rows * columns)}
  </div>
);
