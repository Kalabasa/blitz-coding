import { iife, Mod } from "game/mod";

export const modBanRecursion = (funcName: string): Mod => ({
  code: `$BAN$ban_recursion()`,
  libraryCode: "function $BAN$ban_recursion(){}",
  hiddenCode: iife(`
function recursionLimited(fn) {
  var inside = false;
  return function(){
    if (inside) throw new Error('Recursion is banned!');

    inside = true;
    const ret = fn.apply(this, arguments);
    inside = false;

    return ret;
  };
}
${funcName} = recursionLimited(${funcName});
`),
});
