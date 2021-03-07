import classNames from "classnames";
import { debounce } from "debounce";
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
import { Light } from "ui/light/light";
import { Editor } from "ui/editor/editor";
import { PuzzleCard } from "ui/puzzle_card/puzzle_card";
import { Color } from "ui/styles/colors";
import { Timer } from "ui/timer/timer";
import styles from "./round_view.module.css";
import { act } from "react-dom/test-utils";

enum RoundStep {
  Intro,
  Play,
  Flip,
  Outcome,
}

export const RoundView = ({
  game,
  round: roundIndex,
  currentRound,
  nextRound,
}: {
  game: Game;
  round: number;
  currentRound: number;
  nextRound: () => void;
}): JSX.Element => {
  const [result, setResult] = useState(undefined as RoundResult | undefined);
  const [code, setCode] = useState("return ");
  const [executing, setExecuting] = useState(false);
  const [timerStart, setTimerStart] = useState<number>();
  const [timerEnd, setTimerEnd] = useState<number>();
  const [roundStep, setRoundStep] = useState<RoundStep>(RoundStep.Intro);
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
      console.debug(res);
      if (end) {
        setRoundStep(RoundStep.Flip);
        timeout(1500, () => {
          setRoundStep(RoundStep.Outcome);
          timeout(100, nextRound);
        });
      }
    },
    [nextRound]
  );

  const onRun = useCallback(
    (res: RoundResult, end: boolean) => {
      setExecuting(true);
      onResult(res, end);
      setTimeout(() => setExecuting(false), 500);
    },
    [nextRound]
  );

  const submit = useCallback(
    (final: boolean) => {
      enqueueRunCode.clear();
      runCode(code, round, logsRef.current, (res) =>
        onRun(res, res.success || final)
      );
    },
    [code, round, logsRef.current, onRun]
  );

  const setAndRunCode = useCallback(
    (cd: string) => {
      setCode(cd);
      enqueueRunCode(cd, round, logsRef.current, (res) =>
        onRun(res, res.success)
      );
    },
    [round, logsRef.current, onRun]
  );

  useEffect(() => {
    clearTimeout(timeoutHandle.current);
    if (active) {
      const start = Date.now() + 1000;
      const end = start + round.time * 1000 + 999;
      setTimerStart(start);
      setTimerEnd(end);
      timeoutHandle.current = setTimeout(() => {
        submit(true);
      }, end - Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, onResult]);

  useEffect(() => {
    setTimeout(() => setRoundStep(RoundStep.Play), 1000);
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
  const introMode = roundStep === RoundStep.Intro;
  const isPlaying = active && roundStep === RoundStep.Play;

  return (
    <div
      className={classNames({
        [styles.container]: true,
        [styles.introMode]: introMode,
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
            <Editor disabled={!isPlaying} code={code} setCode={setAndRunCode} />
          }
          modCode={modCode}
          codePrefix={`function ${funcName}( ${inputNames.join(", ")} ) {`}
          codeSuffix="}"
          outcome={roundStep === RoundStep.Outcome ? outcome : undefined}
          focus={isPlaying}
          darken={!active && !introMode}
          executing={executing}
          submitDisabled={executing || !isPlaying}
          onSubmit={() => submit(false)}
        />
      </div>

      <div className={styles.timerContainer}>
        <Timer startTime={timerStart} endTime={isPlaying ? timerEnd : 0} />
      </div>

      {roundStep >= RoundStep.Outcome && currentRound <= roundIndex + 1 && (
        <Light color={outcome === "success" ? Color.success : Color.failure} />
      )}
    </div>
  );
};

const enqueueRunCode = debounce(runCode, 2000);

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

  const result = Game.runRound(code, round, logger);

  onRun(result);
}

function formatMods(mods?: Mod[]) {
  if (!mods || !mods.length) return "";

  return [...mods.map((mod) => mod.code).map(applyModCodeEmoji), ""].join(
    ";\n"
  );
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
};

// Swap args for better code sequence
function timeout(ms: number, fn: Function) {
  return setTimeout(fn, ms);
}
