import * as acorn from "acorn";
import * as walk from "acorn-walk";
import { iife, Mod } from "game/mod";

type ModPreCheck = Mod["preCheck"];

export const banSyntaxPreCheck = (
  rules: { [type in string]: (node: acorn.Node & any) => boolean },
  message: (node: acorn.Node & any) => string
): ModPreCheck => (code: string) => {
  const visitors = Object.fromEntries(
    Object.entries(rules).map(([type, rule]) => [
      type,
      (node: acorn.Node) => {
        if (rule(node)) throw new Error(message(node));
      },
    ])
  );

  let ast;
  try {
    ast = acorn.parse(iife(code));
  } catch (error) {
    return; // Ignore incomplete code
  }

  walk.simple(ast, visitors);
};
