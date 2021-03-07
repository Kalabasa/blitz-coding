import classNames from "classnames";
import { Game } from "game/game";
import { Difficulty } from "game/types";
import React, { memo, MouseEvent, useState } from "react";
import { Deck } from "ui/deck/deck";
import { GameView } from "ui/game/game";
import { BackLightPortal, LightContainer } from "ui/light/light";
import { Logo } from "ui/logo/logo";
import "ui/styles/nord.css";
import styles from "./app.module.css";

type Deck = {
  name: string;
  description: string;
  difficulty: Difficulty;
  rounds: number;
};

const gameDecks: Deck[] = [
  {
    name: "Easy",
    description: "Trivial one-liners and basic algorithms.",
    difficulty: Difficulty.Easy,
    rounds: 6,
  },
  {
    name: "Medium",
    description: "Simple problems with some Modifiers.",
    difficulty: Difficulty.Medium,
    rounds: 6,
  },
  {
    name: "Hard",
    description: "Simple and complex problems with tricky edge cases.",
    difficulty: Difficulty.Hard,
    rounds: 6,
  },
  {
    name: "Impossible",
    difficulty: Difficulty.Impossible,
    description: "Problems fit for a JavaScript spec implementer.",
    rounds: 6,
  },
];

export const App = memo(() => {
  const [game, setGame] = useState<Game | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className={styles.app}>
      <LightContainer>
        <div className={styles.header}>
          <span className={styles.logoBar}>
            &#123;
            <Logo className={styles.logo} variant="emoji" />
            <span className={styles.appName}>blitz-coding</span>&#125;
          </span>
        </div>
        {!game && (
          <div className={styles.menu} onClick={() => setSelected(null)}>
            <div className={styles.deckList}>
              {gameDecks.map((deck, i) => {
                const onClick = (event: MouseEvent) => {
                  event.stopPropagation();
                  setSelected(i);
                };
                const onConfirm = () => {
                  const newGame = Game.create({
                    difficulty: deck.difficulty,
                    numberOfRounds: deck.rounds,
                  });
                  setGame(newGame);
                };
                return (
                  <div
                    className={classNames({
                      [styles.deckItem]: true,
                      [styles.unselected]: selected !== null && i !== selected,
                    })}
                  >
                    <Deck
                      name={deck.name}
                      description={deck.description}
                      rounds={deck.rounds}
                      selected={i === selected}
                      onClick={onClick}
                      onConfirm={onConfirm}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {game && (
          <div className={styles.game}>
            <GameView game={game} />
          </div>
        )}
        <div className={styles.backLight}>
          <BackLightPortal />
        </div>
      </LightContainer>
    </div>
  );
});
