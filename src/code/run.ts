import { Box } from "code/box";
import { Case } from "code/case";
import { memo } from "react";

export type Run = {
  example: Case;
  output: Box;
  match: boolean;
};

export type Suite = {
  funcName: string;
  inputNames: string[];
  cases: Case[];
};

function runCode(funcCode: string, suite: Suite): Run[] | Error {
  try {
    const fn = createFunction(suite, funcCode);
    return runAll(fn, suite.cases);
  } catch (error) {
    return error;
  }
}

function createFunction(suite: Suite, funcCode: string) {
  const { funcName, inputNames } = suite;

  const prefix = "_" + Date.now();
  const n = (name: string) => prefix + name;

  const parameters = inputNames.map((name) => "_" + prefix + name);

  const memoizeNm = n("memoize");
  const fnNm = n("fn");
  const code = `
function ${memoizeNm}(${fnNm}) {
  var cache = Object.create(null);
  return function(){
    var key = JSON.stringify(arguments);
    if (!(key in cache)) {
      cache[key] = ${fnNm}.apply(this, arguments);
    }
    return cache[key];
  };
}

function ${funcName}(${inputNames.join(",")}){
/* ------ PLAYER CODE START ------ */

${funcCode}

/* ------ PLAYER CODE END ------ */
}

${funcName} = ${memoizeNm}(${funcName});
return ${funcName}(${parameters.join(",")});
    `;
  console.log(code);

  return new Function(...parameters, code);
}

function runAll(fn: Function, cases: Case[]): Run[] {
  return cases.map((ex) => run(fn, ex));
}

function run(fn: Function, example: Case): Run {
  const output = fn(...example.inputs.map(Box.unbox));

  return {
    example,
    output,
    match: Case.matchOutput(output, example),
  };
}

export const Run = Object.freeze({
  code: runCode,
});
