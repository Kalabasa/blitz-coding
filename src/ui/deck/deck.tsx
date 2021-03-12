import classNames from "classnames";
import {
  CSSProperties,
  MouseEventHandler,
  useLayoutEffect,
  useRef,
} from "react";
import { CardBackFace } from "ui/puzzle_card/card_backface";
import styles from "./deck.module.css";

export type DeckProps = {
  name: string;
  description: string;
  rounds: number;
  selected?: boolean;
  onClick: MouseEventHandler;
  onConfirm: MouseEventHandler;
};

export const Deck = ({
  name,
  description,
  rounds,
  selected,
  onClick,
  onConfirm,
}: DeckProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const clientRectRef = useRef<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!rootRef.current || selected) return;
    clientRectRef.current = rootRef.current.getBoundingClientRect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef.current]);

  let style: CSSProperties | undefined = undefined;
  if (selected && clientRectRef.current) {
    const clientRect = clientRectRef.current;
    const dx = window.innerWidth / 2 - clientRect.x - clientRect.width / 2;
    const dy = window.innerHeight / 2 - clientRect.y - clientRect.height / 2;
    style = {
      transform: `translate(${dx}px,${dy}px)`,
    };
  }

  return (
    <div
      ref={rootRef}
      className={classNames(styles.rootButton, selected && styles.selected)}
      style={style}
      onClick={onClick}
    >
      <div className={styles.cardsContainer}>
        {Array.from({ length: Math.min(rounds, 4) }, (_, i) => (
          <div key={i} className={styles.cardContainer}>
            <CardBackFace />
          </div>
        ))}
      </div>
      <div className={styles.infoOverlay}>
        <div className={styles.name}>{name}</div>
        <div className={styles.rounds}>{rounds} rounds</div>
        <div className={styles.description}>{description}</div>
        <button className={styles.playButton} onClick={onConfirm}>
          Play
        </button>
      </div>
    </div>
  );
};
