import { Game } from "game/game";
import React, { memo, useCallback, useEffect, useState } from "react";
import { RoundView } from "ui/game/round_view";
import styles from "./game.module.css";

export type GameProps = {
  game: Game;
  onGameEnd?: () => void;
};

export const GameView = memo(({ game, onGameEnd }: GameProps) => {
  const [currentRound, setCurrentRound] = useState(0);

  const startRound = useCallback((index: number) => {
    setCurrentRound(index);
  }, []);

  // Initialization
  useEffect(() => {
    startRound(0);
  }, [startRound]);

  const onRoundComplete = useCallback(() => {
    startRound(currentRound + 1);
  }, [startRound, currentRound]);

  return (
    <div className={styles.container}>
      {game.rounds.map((round, index) => (
        <RoundView
          key={index}
          {...{
            game,
            round: index,
            currentRound,
            nextRound: onRoundComplete,
          }}
        />
      ))}
    </div>
  );
});
