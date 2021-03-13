import { Mod } from "mods/mod";

export const modFake = (funcName: string, args: string[]): Mod => ({
  code: `/*icon:change*/ ${funcName}( ${args.join(", ")} )`,
  libraryCode: `function ${funcName}(){}`,
});
