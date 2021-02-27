import { Game } from "game/game";
import { Difficulty } from "game/types";
import React, { memo } from "react";
import { GameView } from "ui/game/game";
import styles from "./app.module.css";
import "ui/styles/nord.css";
import { Logo } from "ui/logo/logo";

export const App = memo(() => {
  const game = Game.create({
    difficulty: Difficulty.Easy,
    numberOfRounds: 10,
  });

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <span className={styles.logoBar}>
          <span className={styles.logo}>
            &#123;
            <Logo variant="emoji" />
            &#125;
          </span>
          Zy
        </span>
      </div>
      <div className={styles.game}>
        <GameView game={game} />
      </div>
    </div>
  );
});
