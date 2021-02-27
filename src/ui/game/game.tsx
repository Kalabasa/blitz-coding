import { Game } from "game/game";
import React, { memo, useCallback, useEffect, useState } from "react";
import { RoundView } from "ui/game/round_view";
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
      const start = Date.now() + 600;

      setActive(true);
      setCurrentRound(nextRoundIndex);
      setTimerStart(start);
      setTimerEnd(start + nextRound.time * 1000);
    }, 1000);
  }, [currentRound]);

  useEffect(() => {
    const firstRound = game.rounds[currentRound];
    const start = Date.now() + 1000;
    setTimerStart(start);
    setTimerEnd(start + firstRound.time * 1000);
  }, []);

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
        {active && timerStart && timerEnd && (
          <Timer startTime={timerStart} endTime={timerEnd} />
        )}
      </div>
    </div>
  );
});
