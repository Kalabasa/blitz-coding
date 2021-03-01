import { Game } from "game/game";
import { Difficulty } from "game/types";
import React, { memo } from "react";
import { GameView } from "ui/game/game";
import styles from "./app.module.css";
import "ui/styles/nord.css";
import { Logo } from "ui/logo/logo";

export const App = memo(() => {
  const game = Game.create({
    difficulty: Difficulty.Hard,
    numberOfRounds: 6,
  });

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <span className={styles.logoBar}>
          &#123;
          <Logo className={styles.logo} variant="emoji" />
          <span className={styles.appName}>blitz-coding</span>&#125;
        </span>
      </div>
      <div className={styles.game}>
        <GameView game={game} />
      </div>
    </div>
  );
});
