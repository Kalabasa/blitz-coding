import { Suite } from "code/run";

function createFunction(
  suite: Suite,
  funcCode: string,
  modCode: string,
  modCleanupCode: string,
  setupCode: string,
  logger: (...data: any[]) => void = console.log
) {
  const { funcName, inputNames } = suite;

  const prefix = "_" + Date.now();
  const inputVars = inputNames.map((name) => "_" + prefix + name);
  const contextVar = prefix + "context";

  const code = `
try{

function ${funcName}(${inputNames.join(",")}){
with(${contextVar}){

/* ------ PLAYER CODE START ------ */
${funcCode}
/* ------ PLAYER CODE END ------ */

}
}

/* ------ MODS START ------ */
${modCode}
/* ------ MODS END ------ */

/* ------ SETUP START ------ */
${setupCode}
/* ------ SETUP END ------ */

return ${funcName}.call({},${inputVars.join(",")});

}finally{
/* ------ MOD CLEANUP START ------ */
${modCleanupCode}
/* ------ MOD CLEANUP END ------ */
}
`;
  console.debug(code);

  const context = getContext(logger);

  // eslint-disable-next-line no-new-func
  const fn = new Function(contextVar, ...inputVars, code);

  return (...inputs: any[]) => {
    return fn(context, ...inputs);
  };
}

function generateSetupCode(suite: Suite): string {
  const { funcName } = suite;

  return `
(function(){
  function memoize(fn) {
    var cache = Object.create(null);

    return function(){
      var key = JSON.stringify(arguments,
        function (_,v) {
          return v == null || Number.isNaN(v) || v === Number.POSITIVE_INFINITY || v === Number.NEGATIVE_INFINITY ? "Infinity" : v; });

      if (!(key in cache)) {
        cache[key] = fn.apply(this, arguments);
      }

      return cache[key];
    };
  }

  ${funcName} = memoize(${funcName});
})();

${funcName}.toString = function(){ return "${funcName}" };
`;
}

function getContext(log: (...data: any[]) => void) {
  const context: any = {};

  for (let name in window) {
    context[name] = null;
  }

  context.console = { log };

  return context;
}

export const Bootstrap = Object.freeze({
  createFunction,
  generateSetupCode,
});
