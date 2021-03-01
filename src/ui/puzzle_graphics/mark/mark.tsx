import classNames from "classnames";
import React, { useMemo } from "react";
import seedrandom from "seedrandom";
import { Icon } from "ui/icon/icon";
import { ReactComponent as CheckSVG } from "ui/icon/svg/check.svg";
import { ReactComponent as CrossSVG } from "ui/icon/svg/cross.svg";
import styles from "./mark.module.css";

export type MarkProps = {
  className?: string;
  type: "check" | "cross"; // TODO unify ("success" | "failure") type
};

export const Mark = ({ className, type }: MarkProps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const seed = useMemo(() => Date.now().toString(), [type]);
  const random = seedrandom(seed);

  let child = (
    <Icon
      style={{
        transform: `translate(
          ${random() * 6 - 3}px,
          ${random() * 6 - 3}px)
          rotate(${random() * 30 - 15}deg)`,
      }}
      svg={type === "check" ? CheckSVG : CrossSVG}
    />
  );

  return <div className={classNames(styles[type], className)}>{child}</div>;
};
