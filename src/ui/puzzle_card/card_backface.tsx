import classNames from "classnames";
import React from "react";
import { Logo } from "ui/logo/logo";
import styles from "./card_backface.module.css";

export type CardBackFaceProps = {
  outcome?: "success" | "failure";
};

export const CardBackFace = ({ outcome }: CardBackFaceProps) => (
  <div className={classNames(styles.backface, outcome && styles[outcome])}>
    <Logo className={styles.logo} variant="colored" />
  </div>
);
