import classNames from "classnames";
import { debounce } from "debounce";
import { Game, RoundResult } from "game/game";
import { Mod } from "game/mod";
import { Round } from "game/types";
import { useCallback, useMemo, useState } from "react";
import { Editor } from "ui/editor/editor";
import { ErrorMessage } from "ui/error_message/error_message";
import { PuzzleCard } from "ui/puzzle_card/puzzle_card";
import styles from "./round_view.module.css";

export const RoundView = ({
  game,
  round: roundIndex,
  currentRound,
  active,
  onRoundComplete,
}: {
  game: Game;
  round: number;
  currentRound: number;
  active: boolean;
  onRoundComplete: (round: number) => void;
}): JSX.Element => {
  const [result, setResult] = useState(undefined as RoundResult | undefined);
  const [code, setCode] = useState("return ");
  const [waiting, setWaiting] = useState(false);

  const round = game.rounds[roundIndex];
  const { Graphics, suite } = round;
  const { funcName, inputNames } = suite;

  const success = result?.success;
  const outcome =
    success === undefined ? undefined : success ? "success" : "failure";

  const onRunResult = useCallback(
    (res) => {
      setWaiting(true);

      setResult(res);
      console.debug(res);
      if (res.success) {
        onRoundComplete(roundIndex);
      }

      setTimeout(() => setWaiting(false), 500);
    },
    [onRoundComplete, roundIndex]
  );

  const onSubmit = useCallback(() => {
    submitRunCode.clear();
    runCode(code, round, onRunResult);
  }, [code, round, onRunResult]);

  const setAndRunCode = useCallback(
    (cd: string) => {
      setCode(cd);
      submitRunCode(cd, round, onRunResult);
    },
    [round, onRunResult]
  );

  const graphics = useMemo(
    () => <Graphics suite={round.suite} runs={result?.runs} />,
    [Graphics, round, result]
  );

  const modCode = formatMods(round.mods);

  return (
    <div
      className={classNames({
        [styles.cardContainer]: true,
        [styles.farPrevCard]: roundIndex < currentRound - 2,
        [styles.prevPrevCard]: roundIndex === currentRound - 2,
        [styles.prevCard]: roundIndex === currentRound - 1,
        [styles.currentCard]: roundIndex === currentRound,
        [styles.nextCard]: roundIndex === currentRound + 1,
        [styles.nextNextCard]: roundIndex === currentRound + 2,
        [styles.farNextCard]: roundIndex > currentRound + 2,
      })}
    >
      <PuzzleCard
        graphics={
          <>
            {graphics}
            {result?.error && <ErrorMessage error={result.error} />}
          </>
        }
        editor={
          <Editor
            disabled={!active || roundIndex !== currentRound}
            code={code}
            setCode={setAndRunCode}
          />
        }
        modCode={modCode}
        codePrefix={`function ${funcName}( ${inputNames.join(", ")} ) {`}
        codeSuffix="}"
        outcome={outcome}
        focus={active && roundIndex === currentRound}
        darkened={roundIndex !== currentRound}
        submitDisabled={waiting}
        onSubmit={onSubmit}
      />
    </div>
  );
};

const submitRunCode = debounce(runCode, 2000);

function runCode(
  cd: string,
  round: Round,
  onResult: (result: RoundResult) => void
) {
  const result = Game.runRound(cd, round);
  onResult(result);
}

function formatMods(mods?: Mod[]) {
  if (!mods || !mods.length) return "";

  return [...mods.map((mod) => mod.code).map(applyModCodeEmoji), ""].join(
    ";\n"
  );
}

function applyModCodeEmoji(modCode: string) {
  return modCode.replaceAll("$BAN$", "🚫 ");
}
