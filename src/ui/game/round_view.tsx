import classNames from "classnames";
import { Game, RoundResult } from "game/game";
import { Round } from "game/types";
import { Mod } from "mods/mod";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import seedrandom from "seedrandom";
import {
  AlertMessage,
  AlertMessageProps,
} from "ui/alert_message/alert_message";
import { Editor } from "ui/editor/editor";
import { Light } from "ui/light/light";
import { PuzzleCard } from "ui/puzzle_card/puzzle_card";
import { Color } from "ui/styles/colors";
import { Timer } from "ui/timer/timer";
import styles from "./round_view.module.css";

enum RoundStep {
  Intro1,
  Intro2,
  Play,
  Flip,
  Outcome,
  Collect,
}

export const RoundView = ({
  game,
  round: roundIndex,
  currentRound,
  collect,
  onRoundEnd,
  onQuit,
}: {
  game: Game;
  round: number;
  currentRound: number;
  collect?: boolean;
  onRoundEnd: (outcome: "success" | "failure") => void;
  onQuit: () => void;
}): JSX.Element => {
  const [result, setResult] = useState(undefined as RoundResult | undefined);
  const [code, setCode] = useState("return ");
  const [executing, setExecuting] = useState(false);
  const [timerStart, setTimerStart] = useState<number>();
  const [timerEnd, setTimerEnd] = useState<number>();
  const [roundStep, setRoundStep] = useState<RoundStep>(RoundStep.Intro1);
  const timeoutHandle = useRef<any>();
  const logsRef = useRef<string[]>([]);

  const round = game.rounds[roundIndex];
  const { Graphics, suite } = round;
  const { funcName, inputNames } = suite;

  const success = result?.success;
  const outcome =
    success === undefined ? undefined : success ? "success" : "failure";

  const active = roundIndex === currentRound;

  const onResult = useCallback(
    (res: RoundResult, end: boolean) => {
      setResult(res);
      if (end) {
        timeout(1000, () => {
          setRoundStep(RoundStep.Flip);
          timeout(600, () => {
            setRoundStep(RoundStep.Outcome);
            timeout(100, () => onRoundEnd(res.success ? "success" : "failure"));
          });
        });
      }
    },
    [onRoundEnd]
  );

  const onRun = useCallback(
    (res: RoundResult, end: boolean) => {
      onResult(res, end);
      setExecuting(false);
    },
    [onResult]
  );

  // This callback is a ref so that async callbacks will submit the latest code.
  // Regularly-defined callback or useCallback'd callbacks messes up b/c of closures.
  const submitRef = useRef<(final: boolean) => void>();
  useEffect(() => {
    submitRef.current = (final: boolean) => {
      if (roundStep !== RoundStep.Play) return;

      setExecuting(true);

      runCode(code, round, logsRef.current, (res) =>
        onRun(res, res.success || final)
      );
    };
  }, [code, round, roundStep, onRun]);

  const quit = useCallback(() => {
    setRoundStep(RoundStep.Flip);
    onQuit();
  }, [onQuit]);

  const skip = useCallback(() => {
    setResult({ success: false });
    setRoundStep(RoundStep.Outcome);
    timeout(100, () => onRoundEnd("failure"));
  }, [onRoundEnd]);

  // lifecycle
  useEffect(() => {
    if (active && roundStep === RoundStep.Play) {
      const start = Date.now() + 500;
      const end = start + round.time * 1000 + 999;

      setTimerStart(start);
      setTimerEnd(end);

      clearTimeout(timeoutHandle.current);
      timeoutHandle.current = setTimeout(() => {
        submitRef.current?.(true);
      }, end - Date.now());
    } else {
      clearTimeout(timeoutHandle.current);
      if (collect) {
        setRoundStep(RoundStep.Collect);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, roundStep, collect, onResult]);

  useEffect(() => {
    setTimeout(() => setRoundStep(RoundStep.Intro2));
    setTimeout(() => setRoundStep(RoundStep.Play), 1750);
  }, []);

  const graphics = useMemo(
    () => <Graphics suite={round.suite} runs={result?.runs} />,
    [Graphics, round, result]
  );

  let logAlerts: AlertMessageProps["messages"] = [];
  if (logsRef.current?.length) {
    const logs = logsRef.current;
    const sampleLength = 3;
    const random = seedrandom(String(timerStart));
    const sampleIndex = Math.max(
      0,
      Math.floor(random() * (logs.length - sampleLength))
    );
    logAlerts = logs
      .slice(sampleIndex, sampleIndex + sampleLength)
      .map((log) => ({ log }));
  }

  const errorAlerts = result?.error ? [{ error: result.error }] : [];
  const alertMessages = [...logAlerts, ...errorAlerts];

  const modCode = formatMods(round.mods);
  const introMode = roundStep <= RoundStep.Intro2;
  const collectMode = roundStep === RoundStep.Collect;
  const isPlaying = active && roundStep === RoundStep.Play;

  return (
    <div
      className={classNames({
        [styles.container]: true,
        [styles.introMode]: introMode,
        [styles.collectMode]: collectMode,
      })}
    >
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
          [styles.flipped]: roundStep >= RoundStep.Flip,
        })}
      >
        <PuzzleCard
          graphics={
            <>
              {graphics}
              {alertMessages.length > 0 && (
                <AlertMessage messages={alertMessages} />
              )}
            </>
          }
          editor={
            <Editor disabled={!isPlaying} code={code} setCode={setCode} />
          }
          modCode={modCode}
          codePrefix={`function ${funcName}( ${inputNames.join(", ")} ) {`}
          codeSuffix="}"
          outcome={roundStep === RoundStep.Outcome ? outcome : undefined}
          focus={isPlaying}
          darken={!active && roundStep !== RoundStep.Intro1 && !collectMode}
          executing={executing}
          submitDisabled={executing || !isPlaying}
          onSubmit={() => submitRef.current?.(false)}
        />
      </div>

      <div className={styles.timerContainer}>
        <Timer startTime={timerStart} endTime={isPlaying ? timerEnd : 0} />
      </div>

      <div
        className={classNames({
          [styles.gameInfoContainer]: true,
          [styles.gameInfoContainerHidden]: !isPlaying,
        })}
      >
        <button onClick={quit} className={styles.gameButton}>
          Quit
        </button>
        <h2 className={styles.roundCount}>
          Round {roundIndex + 1}/{game.rounds.length}
        </h2>
        <button onClick={skip} className={styles.gameButton}>
          Skip
        </button>
      </div>

      {roundStep === RoundStep.Intro2 && currentRound === roundIndex && (
        <Light color={Color.accent} />
      )}
      {roundStep >= RoundStep.Outcome && currentRound <= roundIndex + 1 && (
        <Light color={outcome === "success" ? Color.success : Color.failure} />
      )}
    </div>
  );
};

function runCode(
  code: string,
  round: Round,
  outLogs: string[],
  onRun: (result: RoundResult) => void
) {
  outLogs.length = 0;

  const logger = (...data: any[]) => {
    // `logs` is not reactive but is picked up due to callback
    outLogs.push(data?.map((d) => d?.toString()).join(" "));
  };

  setTimeout(() => {
    Game.runRound(code, round, logger).then(onRun);
  });
}

function formatMods(mods?: Mod[]) {
  if (!mods || !mods.length) return "";

  return [
    ...mods
      .filter((mod) => mod.code)
      .map((mod) => mod.code!)
      .map(applyModCodeEmoji),
    "",
  ].join(";\n");
}

function applyModCodeEmoji(modCode: string) {
  return modCode.replaceAll(
    /\/\*icon:(\w+)\*\//g,
    (_, icon) => iconToEmoji[icon] ?? ""
  );
}

const iconToEmoji: { [id in string]: string } = {
  change: "🔧",
  ban: "🚫",
  add: "✏️",
};

// Swap args for better code sequence
function timeout(ms: number, fn: Function) {
  return setTimeout(fn, ms);
}
