import { Run } from "code/run";
import { Generate } from "game/generate";
import { Mod } from "mods/mod";
import { Compiler } from "game/compiler";
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

async function runRound(
  code: string,
  round: Round,
  logger?: (...data: any[]) => void
): Promise<RoundResult> {
  try {
    let origCode = code;

    for (let mod of round.mods ?? []) {
      const result = mod.preprocess?.(code);
      if (result !== undefined && typeof result === "string") {
        code = result;
      }
    }

    if (code !== origCode) {
      code = "//" + origCode.replaceAll("\n", "\n//") + "\n" + code;
    }

    const fn = await Compiler.createFunction(
      round.suite,
      code,
      round.mods ? Mod.generateSetupCode(round.mods) : "",
      round.mods ? Mod.generateCleanupCode(round.mods) : "",
      logger
    );

    const result = await Run.cases(fn, round.suite.cases);
    // console.debug(result);

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
