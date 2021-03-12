import { Game } from "game/game";
import React, { memo, useCallback, useEffect, useState } from "react";
import { RoundView } from "ui/game/round_view";
import styles from "./game.module.css";

export type GameProps = {
  game: Game;
  onGameEnd?: (score: number) => void;
};

export const GameView = memo(({ game, onGameEnd }: GameProps) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [collecting, setCollecting] = useState(false);

  const startRound = useCallback((index: number) => {
    setCurrentRound(index);
  }, []);

  // Initialization
  useEffect(() => {
    startRound(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRoundEnd = useCallback(
    (outcome: "success" | "failure") => {
      let newScore = score;
      if (outcome === "success") newScore++;
      setScore(newScore);

      if (currentRound + 1 < game.rounds.length) {
        startRound(currentRound + 1);
      } else {
        setTimeout(() => setCollecting(true), 1000);
        setTimeout(() => onGameEnd?.(newScore), 2600);
      }
    },
    [score, currentRound, startRound, game, onGameEnd]
  );

  const onQuit = useCallback(() => {
    setScore(0);
    setCollecting(true);
    setTimeout(() => onGameEnd?.(0), 2000);
  }, [onGameEnd]);

  return (
    <div className={styles.container}>
      {game.rounds.map((round, index) => (
        <RoundView
          key={index}
          {...{
            game,
            round: index,
            currentRound,
            collect: collecting,
            onRoundEnd,
            onQuit,
          }}
        />
      ))}
    </div>
  );
});
