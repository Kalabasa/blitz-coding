import { Suite } from "code/run";
import { ComponentType } from "react";
import { GraphicsProps } from "ui/puzzle_graphics/graphics";

export enum Difficulty {
  Easy,
  Medium,
  Hard,
}

export type Round = {
  points: number;
  time: number;
  suite: Suite;
  Graphics: ComponentType<GraphicsProps>;
};
