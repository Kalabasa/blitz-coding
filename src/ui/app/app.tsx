import { Game } from "game/game";
import { Difficulty } from "game/types";
import React, { memo } from "react";
import { GameView } from "ui/game/game";
import styles from "./app.module.css";
import "ui/styles/nord.css";
import { Logo } from "ui/logo/logo";
import { BackLightContainer, BackLightPortal } from "ui/back_light/back_light";

export const App = memo(() => {
  const game = Game.create({
    difficulty: Difficulty.Medium,
    numberOfRounds: 6,
  });

  return (
    <div className={styles.app}>
      <BackLightContainer>
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
        <div className={styles.backLight}>
          <BackLightPortal />
        </div>
      </BackLightContainer>
    </div>
  );
});
