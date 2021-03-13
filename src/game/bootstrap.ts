import { AsyncFunction, Suite } from "code/run";

function createFunction(
  suite: Suite,
  funcCode: string,
  modCode: string,
  modCleanupCode: string,
  setupCode: string,
  logger: (...data: any[]) => void = console.log
): AsyncFunction {
  const { funcName, inputNames } = suite;

  const prefix = "_" + Date.now();
  const inputVars = inputNames.map((name) => "_" + prefix + name);
  const contextVar = prefix + "context";

  const thisValue = "{valueOf:function(){return undefined}}";

  const code = `
try{

with(${contextVar}){
function ${funcName}(${inputNames.join(",")}){

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

return ${funcName}.call(${thisValue},${inputVars.join(",")});

}finally{
/* ------ MOD CLEANUP START ------ */
${modCleanupCode}
/* ------ MOD CLEANUP END ------ */
}
`;

  console.debug(code);

  const context = getContext(logger);

  // eslint-disable-next-line no-new-func
  const fn = detachContext(contextVar, ...inputVars, code);

  return async (...inputs: any[]) => {
    return await fn(context, ...inputs);
  };
}

function generateSetupCode(suite: Suite): string {
  const { funcName } = suite;

  return `
(function(){
  function memoize(fn) {
    var cache = Object.create(null);

    return function(){
      var args = Array.prototype.slice.call(arguments);

      if (args.some(v => v === undefined || Number.isNaN(v) || v === Number.POSITIVE_INFINITY || v === Number.NEGATIVE_INFINITY || typeof v === 'function')) {
        return fn.apply(this, args);
      }

      var key = JSON.stringify(args);

      if (!(key in cache)) {
        cache[key] = fn.apply(this, args);
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

  for (let name in globalThis) {
    context[name] = undefined;
  }

  context.console = { log };

  return context;
}

const iframePool: HTMLIFrameElement[] = [];
setInterval(flushIFramePool, 10 * 60 * 1000);

function getIFrame(): HTMLIFrameElement {
  if (iframePool.length) return iframePool.pop()!;

  const iframe = document.createElement("iframe");
  iframe.classList.add("codeRunner");
  document.body.appendChild(iframe);
  return iframe;
}

function releaseIFrame(iframe: HTMLIFrameElement) {
  iframePool.push(iframe);
}

function flushIFramePool() {
  while (iframePool.length) {
    iframePool.pop()!.remove();
  }
}

function detachContext(...funcArgs: string[]): AsyncFunction {
  return (context, ...params: any[]) =>
    new Promise((resolve, reject) => {
      const prefix = "_" + Date.now();
      const funcName = prefix + "fn";
      const contextVar = prefix + "context";
      const paramsVar = prefix + "params";
      const funcArgList = funcArgs.map((a) => JSON.stringify(a)).join(",");

      const html = `
<body><script>
document.domain = ${JSON.stringify(document.domain)};
window.${funcName} = function (${contextVar}, ${paramsVar}) {
  return new Function(${funcArgList})(${contextVar}, ...${paramsVar});
};
</script></body>
`;

      const iframe = getIFrame();
      iframe.srcdoc = html;
      iframe.onload = () => {
        try {
          const fn = (iframe.contentWindow as any)[funcName];
          const retVal = fn(context, params);
          resolve(retVal);
        } catch (error) {
          reject(error);
        } finally {
          releaseIFrame(iframe);
        }
      };
    });
}

export const Bootstrap = Object.freeze({
  createFunction,
  generateSetupCode,
});
