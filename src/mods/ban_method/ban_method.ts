import { libThrowsAnError } from "mods/lib_throws_an_error/lib_throws_an_error";
import { Mod } from "mods/mod";

export const modBanMethod = (type: any, methodName: string): Mod => {
  const original = "_" + Date.now().toString() + "original";

  return {
    code: `/*icon:change*/ ${type}.prototype.${methodName} = throws_an_error()`,
    libraryCode: [
      `var ${original} = ${type}.prototype.${methodName}`,
      libThrowsAnError,
    ],
    cleanupCode: `${type}.prototype.${methodName} = ${original};`,
  };
};

export const modBanStaticMethod = (object: any, methodName: string): Mod => {
  const original = "_" + Date.now().toString() + "original";

  return {
    code: `/*icon:change*/ ${object}.${methodName} = throws_an_error()`,
    libraryCode: [
      `var ${original} = ${object}.${methodName}`,
      libThrowsAnError,
    ],
    cleanupCode: `${object}.${methodName} = ${original};`,
  };
};
