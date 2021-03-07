import { libThrowAnError } from "mods/lib_throw_an_error/lib_throw_an_error";
import { Mod } from "mods/mod";

export const modBanMethod = (type: any, methodName: string): Mod => {
  const original = "_" + Date.now().toString() + "original";

  return {
    code: `/*icon:change*/ ${type}.prototype.${methodName} = throwAnError()`,
    libraryCode: [
      `var ${original} = ${type}.prototype.${methodName}`,
      libThrowAnError,
    ],
    cleanupCode: `${type}.prototype.${methodName} = ${original};`,
  };
};
