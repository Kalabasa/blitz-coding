import { Game } from "game/game";
import React, { memo, useCallback, useEffect, useState } from "react";
import { RoundView } from "ui/game/round_view";
import { BlinkOnChange } from "ui/blink_on_change/blink_on_change";
import { Timer } from "ui/timer/timer";
import styles from "./game.module.css";

export type GameProps = {
  game: Game;
  onGameEnd?: () => void;
};

export const GameView = memo(({ game, onGameEnd }: GameProps) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [active, setActive] = useState(true);
  const [timerStart, setTimerStart] = useState<number>();
  const [timerEnd, setTimerEnd] = useState<number>();

  const onRoundComplete = useCallback(() => {
    setActive(false);
    setTimeout(() => {
      const nextRoundIndex = currentRound + 1;
      const nextRound = game.rounds[nextRoundIndex];
      const start = Date.now() + 1000;

      setActive(true);
      setCurrentRound(nextRoundIndex);
      setTimerStart(start);
      setTimerEnd(start + nextRound.time * 1000);
    }, 1200);
  }, [game.rounds, currentRound]);

  // Initialization
  useEffect(() => {
    setCurrentRound(0);
    const firstRound = game.rounds[0];
    const start = Date.now() + 2000;
    setTimerStart(start);
    setTimerEnd(start + firstRound.time * 1000);
  }, [game.rounds]);

  return (
    <div className={styles.container}>
      {game.rounds.map((_, index) => (
        <RoundView
          key={index}
          {...{
            game,
            round: index,
            currentRound,
            active,
            onRoundComplete,
          }}
        />
      ))}
      <div className={styles.timerContainer}>
        <BlinkOnChange value={timerStart}>
          {timerStart && timerEnd && (
            <Timer startTime={timerStart} endTime={timerEnd} />
          )}
        </BlinkOnChange>
      </div>
    </div>
  );
});
