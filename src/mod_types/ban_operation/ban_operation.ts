import { Mod } from "game/mod";
import { banSyntaxPreCheck } from "mod_types/ban_syntax/ban_syntax";

export const modBanOperation = (...operators: string[]): Mod => ({
  code: `$BAN$ban_operation( ${operators.map((op) => `'${op}'`).join(", ")} )`,
  libraryCode: "function $BAN$ban_operation(){}",
  preCheck: banSyntaxPreCheck(
    {
      BinaryExpression: (node) => node.operator === "%",
      AssignmentExpression: (node) => node.operator === "%=",
    },
    (node) => `The remainder operator (${node.operator}) is banned!`
  ),
});
