import { Run } from "code/run";
import { Generate } from "game/generate";
import { Mod } from "mods/mod";
import { Bootstrap } from "game/bootstrap";
import { Difficulty, Round } from "game/types";

export type Game = {
  difficulty: Difficulty;
  rounds: Round[];
};

function createGame({
  difficulty,
  numberOfRounds,
}: {
  difficulty: Difficulty;
  numberOfRounds: number;
}): Game {
  return {
    difficulty,
    rounds: Generate.randomRounds(difficulty, numberOfRounds),
  };
}

export type RoundResult = {
  success: boolean;
  runs?: Run[];
  error?: Error;
};

function runRound(
  code: string,
  round: Round,
  logger?: (...data: any[]) => void
): RoundResult {
  try {
    for (let mod of round.mods ?? []) {
      mod.preCheck?.(code);
    }

    const fn = Bootstrap.createFunction(
      round.suite,
      code,
      round.mods ? Mod.generateSetupCode(round.mods) : "",
      round.mods ? Mod.generateCleanupCode(round.mods) : "",
      Bootstrap.generateSetupCode(round.suite),
      logger
    );

    const result = Run.cases(fn, round.suite.cases);

    return {
      success: result.every((run) => run.match),
      runs: result,
    };
  } catch (error) {
    return { success: false, error };
  }
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Game = Object.freeze({
  create: createGame,
  runRound,
});
