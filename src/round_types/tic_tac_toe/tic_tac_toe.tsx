import { RoundGenerator } from "game/generate";
import { Difficulty, Round } from "game/types";
import React from "react";
import { rangeCases, shuffle } from "round_types/utils";
import {
  createPlainCaseGridGraphics,
  Sym,
  toFormatString,
} from "ui/puzzle_graphics/graphics";

const ticTacToe = (): Round => ({
  time: 300,
  suite: {
    funcName: "winTicTacToe",
    inputNames: ["board"],
    cases: rangeCases(1, 10, () => {
      const { board, winningMove } = createCase();

      (board as any)[toFormatString] = () => (
        <>
          <Sym>[[ '</Sym>
          {board[0][0]}
          <Sym>', '</Sym>
          {board[0][1]}
          <Sym>', '</Sym>
          {board[0][2]}
          <Sym>' ],</Sym>
          <br />
          <Sym>{' '}[ '</Sym>
          {board[1][0]}
          <Sym>', '</Sym>
          {board[1][1]}
          <Sym>', '</Sym>
          {board[1][2]}
          <Sym>' ],</Sym>
          <br />
          <Sym>{' '}[ '</Sym>
          {board[2][0]}
          <Sym>', '</Sym>
          {board[2][1]}
          <Sym>', '</Sym>
          {board[2][2]}
          <Sym>' ]]</Sym>
        </>
      );

      const output = `${winningMove[0]}(${winningMove[1]},${winningMove[2]})`;

      return {
        inputs: [board],
        output,
      };
    }),
  },
  Graphics: createPlainCaseGridGraphics(2, 1),
});

export const createTicTacToe: RoundGenerator = {
  minDifficulty: Difficulty.Medium,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: ticTacToe,
    params: [],
  }),
};

type Play = "X" | "O";
type Cell = Play | "-";
type Row = [Cell, Cell, Cell];
type Board = [Row, Row, Row];

function createCase(): { board: Board; winningMove: [Play, number, number] } {
  const board: Board = [
    ["-", "-", "-"],
    ["-", "-", "-"],
    ["-", "-", "-"],
  ];

  const winningMove = playUntilWinningMove(board, "X");

  if (!winningMove) throw Error("Logic error");

  board[winningMove[1]][winningMove[2]] = "-";

  return { board, winningMove };
}

function playUntilWinningMove(
  board: Board,
  play: Play
): [Play, number, number] | null {
  const moves = findMoves(board);
  const winningMoves = [];
  const losingMoves = [];

  for (let move of moves) {
    board[move[0]][move[1]] = play;
    if (won(board)) {
      winningMoves.push(move);
    }

    board[move[0]][move[1]] = oppositePlay(play);
    if (won(board)) {
      losingMoves.push(move);
    }

    board[move[0]][move[1]] = "-";
  }

  if (winningMoves.length > 1) {
    return null;
  } else if (winningMoves.length === 1 && losingMoves.length === 0) {
    return [play, ...winningMoves[0]];
  }

  for (let move of shuffle(moves)) {
    board[move[0]][move[1]] = play;
    let winningMove = playUntilWinningMove(board, oppositePlay(play));
    if (winningMove) return winningMove;
    board[move[0]][move[1]] = "-";
  }

  return null;
}

function oppositePlay(play: string): Play {
  return play === "X" ? "O" : "X";
}

function findMoves(board: Board): [number, number][] {
  const moves: [number, number][] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === "-") {
        moves.push([i, j]);
      }
    }
  }
  return moves;
}

function won(board: Board): Play | null {
  for (let i = 0; i < 3; i++) {
    const row = board[i][0];
    if (row !== "-" && row === board[i][1] && row === board[i][2]) {
      return row;
    }
    const col = board[0][i];
    if (col !== "-" && col === board[1][i] && col === board[2][i]) {
      return col;
    }
  }

  const center = board[1][1];
  if (
    center !== "-" &&
    ((center === board[0][0] && center === board[2][2]) ||
      (center === board[0][2] && center === board[2][0]))
  ) {
    return center;
  }

  return null;
}
