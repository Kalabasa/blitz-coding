import { banSyntaxPreCheck } from "mods/ban_syntax/ban_syntax";
import { Mod } from "mods/mod";

export const modBanLoops = (): Mod => ({
  code: `/*icon:ban*/ ban_loops()`,
  libraryCode: "function ban_loops(){}",
  preCheck: banSyntaxPreCheck(
    {
      WhileStatement: () => true,
      DoWhileStatement: () => true,
      ForStatement: () => true,
      ForInStatement: () => true,
      ForOfStatement: () => true,
    },
    () => `Loops are not allowed!`
  ),
});
