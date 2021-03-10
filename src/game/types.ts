import { Suite } from "code/run";
import { Mod } from "mods/mod";
import { ComponentType } from "react";
import { GraphicsProps } from "ui/puzzle_graphics/graphics";

// is an enum for ordering
export enum Difficulty {
  Easy, // Intern
  Medium, // Junior
  Hard, // Senior
  Impossible, // JavaScript engine dev
}

export type Round = {
  time: number;
  suite: Suite;
  mods?: Mod[];
  Graphics: ComponentType<GraphicsProps>;
};
