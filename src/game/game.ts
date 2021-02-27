import { Run } from "code/run";
import { Generate } from "game/generate";
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

function runRound(code: string, round: Round): RoundResult {
  const result = Run.code(code, round.suite);
  if (result instanceof Error) {
    return { success: false, error: result };
  }

  return {
    success: result.every((run) => run.match),
    runs: result,
  };
}

export const Game = Object.freeze({
  create: createGame,
  runRound,
});
