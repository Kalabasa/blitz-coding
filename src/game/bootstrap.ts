import { Suite } from "code/run";

function createFunction(
  suite: Suite,
  funcCode: string,
  modCode: string,
  setupCode: string
) {
  const { funcName, inputNames } = suite;

  const prefix = "_" + Date.now();
  const parameters = inputNames.map((name) => "_" + prefix + name);

  const code = `
function ${funcName}(${inputNames.join(",")}){

/* ------ PLAYER CODE START ------ */
${funcCode}
/* ------ PLAYER CODE END ------ */

}

/* ------ MODS START ------ */
${modCode}
/* ------ MODS END ------ */

/* ------ SETUP START ------ */
${setupCode}
/* ------ SETUP END ------ */

return ${funcName}(${parameters.join(",")});
    `;
  console.debug(code);

  // eslint-disable-next-line no-new-func
  return new Function(...parameters, code);
}

function generateSetupCode(suite: Suite): string {
  const { funcName } = suite;

  return `
(function(){
  function memoize(fn) {
    var cache = Object.create(null);

    return function(){
      var key = JSON.stringify(arguments);

      if (!(key in cache)) {
        cache[key] = fn.apply(this, arguments);
      }

      return cache[key];
    };
  }

  ${funcName} = memoize(${funcName});
})();
`;
}

export const Bootstrap = Object.freeze({
  createFunction,
  generateSetupCode,
});
