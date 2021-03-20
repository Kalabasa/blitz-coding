import { AsyncFunction, Suite } from "code/run";
import { uuid } from "game/uuid";
import { minify } from "terser";

function createFunction(
  suite: Suite,
  funcCode: string,
  modCode: string,
  modCleanupCode: string,
  setupCode: string,
  logger: (...data: any[]) => void = console.log
): AsyncFunction {
  const { funcName, inputNames } = suite;

  const prefix = "_" + uuid();
  const inputVars = inputNames.map((name) => "_" + prefix + name);
  const contextVar = prefix + "context";

  const thisValue = "{valueOf:function(){return undefined}}";

  return async (...inputs: any[]) => {
    const code = `
try{

with(${contextVar}){
function ${funcName}(${inputNames.join(",")}){

/* ------ PLAYER CODE START ------ */
${await minifyCode(funcCode)}
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

    // console.debug(code);
    const mini = await minifyCode(code);
    // console.debug(mini);
    // eslint-disable-next-line no-new-func
    const fn = detachContext(mini, contextVar, ...inputVars);

    const context = getContext(logger);
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

function detachContext(
  code: string,
  contextVar: string,
  ...inputVars: string[]
): AsyncFunction {
  return (context, ...inputs: any[]) =>
    new Promise((resolve, reject) => {
      const prefix = "_" + uuid();
      const funcName = prefix + "fn";

      const html = `
<body><script>
document.domain = ${JSON.stringify(document.domain)};
window.${funcName} = function (${contextVar}, ${inputVars.join(",")}) {
  ${code}
};
</script></body>
`;

      const iframe = getIFrame();
      iframe.srcdoc = html;
      iframe.onload = () => {
        try {
          const fn = (iframe.contentWindow as any)[funcName];
          const retVal = fn(context, ...inputs);
          resolve(retVal);
        } catch (error) {
          reject(error);
        } finally {
          releaseIFrame(iframe);
        }
      };
    });
}

async function minifyCode(code: string): Promise<string> {
  const mini = await minify(code, {
    mangle: false,
    parse: { bare_returns: true },
    compress: { defaults: false },
  });

  if (!mini.code) throw new Error("Error processing code");

  return mini.code;
}

export const Compiler = Object.freeze({
  createFunction,
  generateSetupCode,
});
