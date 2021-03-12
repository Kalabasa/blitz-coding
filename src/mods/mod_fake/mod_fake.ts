import { Mod } from "mods/mod";

export const modText = (funcName: string, args: string[]): Mod => ({
  code: `/*icon:change*/ ${funcName}( ${args.join(", ")} )`,
  libraryCode: `function ${funcName}(){}`,
});
