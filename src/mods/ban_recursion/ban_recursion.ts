import { iife, Mod } from "mods/mod";

export const modBanRecursion = (funcName: string): Mod => ({
  code: `/*icon:ban*/ ban_recursion()`,
  libraryCode: "function ban_recursion(){}",
  hiddenCode: iife(`
function throwOnRecursion(fn) {
  var inside = false;
  return function(){
    if (inside) throw new Error('Recursion is not allowed!');

    inside = true;
    const ret = fn.apply(this, arguments);
    inside = false;

    return ret;
  };
}
${funcName} = throwOnRecursion(${funcName});
`),
});
