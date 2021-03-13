import { Mod } from "mods/mod";

export function createModLimitCalls(funcName: string, limit: number) {
  let globalRun = 0;

  const modLimitCalls: Mod = {
    code: `/*icon:change*/ limit_function_calls( '${funcName}', ${limit} )`,
    libraryCode: "function limit_function_calls(){}",
    preprocess: () => {
      globalRun++;
    },
  };

  const limitCalls = <T extends Function>(fn: T, limit: number): T => {
    let run = 0;
    let calls = 0;

    const dummy = {
      [fn.name]: function () {
        if (run !== globalRun) {
          run = globalRun;
          calls = 0;
        }

        calls++;
        if (calls > limit) {
          throw new Error(`${fn.name}() was called more than ${limit} times!`);
        }

        // @ts-ignore
        return fn.apply(this, arguments);
      },
    };
    return (dummy[fn.name] as unknown) as T;
  };

  return { modLimitCalls, limitCalls };
}
