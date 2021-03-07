import { Mod } from "mods/mod";
import { banSyntaxPreCheck } from "mods/ban_syntax/ban_syntax";

export const modBanOperation = (...operators: string[]): Mod => ({
  code: `/*icon:ban*/ ban_operation( ${operators.map((op) => `'${op}'`).join(", ")} )`,
  libraryCode: "function ban_operation(){}",
  preCheck: banSyntaxPreCheck(
    {
      BinaryExpression: (node) => node.operator === "%",
      AssignmentExpression: (node) => node.operator === "%=",
    },
    (node) => `The remainder operation (${node.operator}) is forbidden!`
  ),
});
