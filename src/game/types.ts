import { Suite } from "code/run";
import { Mod } from "game/mod";
import { ComponentType } from "react";
import { GraphicsProps } from "ui/puzzle_graphics/graphics";

// is an enum for ordering
export enum Difficulty {
  Easy,
  Medium,
  Hard,
}

export type Round = {
  points: number;
  time: number;
  suite: Suite;
  mods?: Mod[];
  Graphics: ComponentType<GraphicsProps>;
};
