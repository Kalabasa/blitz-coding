import classNames from "classnames";
import { Game } from "game/game";
import { Difficulty } from "game/types";
import React, { memo, MouseEvent, useCallback, useState } from "react";
import { randomInt } from "round_types/utils";
import { Deck } from "ui/deck/deck";
import { GameView } from "ui/game/game";
import { BackLightPortal, LightContainer } from "ui/light/light";
import { Logo } from "ui/logo/logo";
import { CardBackFace } from "ui/puzzle_card/card_backface";
import "ui/styles/nord.css";
import styles from "./app.module.css";

type GameDeck = {
  name: string;
  description: string;
  difficulty: Difficulty;
  rounds: number;
};

const gameDecks: GameDeck[] = [
  {
    name: "Easy",
    description: "Trivial one-liners and basic algorithms.",
    difficulty: Difficulty.Easy,
    rounds: 6,
  },
  {
    name: "Easy Marathon",
    description: "Trivial one-liners and basic algorithms.",
    difficulty: Difficulty.Easy,
    rounds: 20,
  },
  {
    name: "Medium",
    description: "Simple puzzles with quirks and intermediate algorithms.",
    difficulty: Difficulty.Medium,
    rounds: 6,
  },
  {
    name: "Medium Marathon",
    description: "Simple puzzles with quirks and intermediate algorithms.",
    difficulty: Difficulty.Medium,
    rounds: 20,
  },
  {
    name: "Hard",
    description: "Simple and complex puzzlers with tricky edge cases.",
    difficulty: Difficulty.Hard,
    rounds: 6,
  },
  {
    name: "Impossible",
    difficulty: Difficulty.Impossible,
    description: "Challenges for computer scientists and JavaScript experts.",
    rounds: 6,
  },
];

export const App = memo(() => {
  const [game, setGame] = useState<Game | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const reset = useCallback(() => {
    setGame(null);
    setSelected(null);
    setScore(null);
  }, []);

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
            <h2
              className={classNames({
                [styles.menuHeading]: true,
                [styles.menuHeadingHidden]: selected !== null,
              })}
            >
              Select a set
            </h2>
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
                  setScore(null);
                };
                return (
                  <div
                    key={i}
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
        {game && score === null && (
          <div className={styles.game}>
            <GameView game={game} onGameEnd={(s) => setScore(s)} />
          </div>
        )}
        {game && score !== null && (
          <div className={styles.scoreScreen}>
            <div className={styles.scoreText}>
              <p>
                You got {score} out of {game.rounds.length} correct!
              </p>
              <p>{getRemark(score, game.rounds.length)}</p>
            </div>
            <button className={styles.backToMenu} onClick={reset}>
              Back to menu
            </button>
            <div className={styles.scoreCard}>
              <CardBackFace />
            </div>
          </div>
        )}
        <div className={styles.backLight}>
          <BackLightPortal />
        </div>
      </LightContainer>
    </div>
  );
});

function getRemark(score: number, total: number) {
  let choices = [];
  if (score === total) {
    choices = ["Perfect!", "Fantastic!", "Impressive."];
  } else if (score > total * 0.8) {
    choices = [
      "Excellent!",
      "Awesome!",
      "That's awesome!",
      "Well done!",
      "Great!",
      "That's great!",
    ];
  } else if (score > total * 0.5) {
    choices = [
      "Good job!",
      "Great job!",
      "Cheers!",
      "Not bad!",
      "That's not half bad!",
      "Cool!",
      "Nice!",
      "That's nice!",
      "Pretty good!",
    ];
  } else if (score > total * 0.4) {
    choices = [
      "That's alright.",
      "That's fine.",
      "That's okay.",
      "Not bad! Not good either.",
    ];
  } else if (score > 0) {
    choices = [
      "Wow.",
      "You tried.",
      "Nice try!",
      "Try again!",
      "Better luck next time.",
      "Why don't you try again?",
      "Come on, now.",
    ];
  } else {
    choices = [
      "Sad.",
      "So sad.",
      "That's sad.",
      "That sucks.",
      "Terrible.",
      "What a shame!",
      "Too bad!",
    ];
  }

  return choices[randomInt(0, choices.length - 1)];
}
