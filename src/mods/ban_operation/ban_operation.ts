import { Mod } from "mods/mod";
import { banSyntaxPreCheck } from "mods/ban_syntax/ban_syntax";

export const modBanOperation = (...operators: string[]): Mod => ({
  code: `/*icon:ban*/ ban_operation( ${operators
    .map((op) => `'${op}'`)
    .join(", ")} )`,
  libraryCode: "function ban_operation(){}",
  preCheck: banSyntaxPreCheck(
    {
      UnaryExpression: (node) => operators.includes(node.operator),
      BinaryExpression: (node) => operators.includes(node.operator),
      AssignmentExpression: (node) => operators.includes(node.operator + "="),
      UpdateExpression: (node) =>
        node.operator.length === 2 &&
        node.operator[0] === node.operator[1] &&
        operators.includes(node.operator[0]),
    },
    (node) => `The ${getName(node.operator)} (${node.operator}) is forbidden!`
  ),
});

const nameMap: { [op in string]: string } = {
  "+": "addition operation",
  "+=": "addition operation",
  "++": "addition operation",
  "-": "subraction operation",
  "-=": "subraction operation",
  "--": "subraction operation",
  "*": "multiplication operation",
  "*=": "multiplication operation",
  "/": "division operation",
  "/=": "division operation",
  "%": "remainder operation",
  "%=": "remainder operation",
  "**": "exponentiation operation",
  "**=": "exponentiation operation",
  "==": "equality operation",
  "===": "equality operation",
  "!=": "inequality operation",
  "!==": "inequality operation",
  ">": "comparison operation",
  ">=": "comparison operation",
  "<": "comparison operation",
  "<=": "comparison operation",
  "<<": "bit shift operation",
  "<<=": "bit shift operation",
  ">>": "bit shift operation",
  ">>=": "bit shift operation",
  ">>>": "bit shift operation",
  ">>>=": "bit shift operation",
  "&": "bitwise AND operation",
  "&=": "bitwise AND operation",
  "|": "bitwise OR operation",
  "|=": "bitwise OR operation",
  "^": "bitwise XOR operation",
  "^=": "bitwise XOR operation",
  "&&": "AND operation",
  "&&=": "AND operation",
  "||": "OR operation",
  "||=": "OR operation",
};

function getName(op: string) {
  return nameMap[op] ?? "operation";
}
