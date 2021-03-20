import * as acorn from "acorn";
import * as walk from "acorn-walk";
import { AsyncFunction, Suite } from "code/run";
import { uuid } from "game/uuid";
import { minify } from "terser";

async function createFunction(
  suite: Suite,
  funcCode: string,
  modCode: string,
  modCleanupCode: string,
  logger: (...data: any[]) => void = console.log
): Promise<AsyncFunction> {
  const { funcName, inputNames } = suite;

  const prefix = "_" + uuid();
  const inputVars = inputNames.map((name) => "_" + prefix + name);
  const contextVar = prefix + "context";
  const cpointFunc = prefix + "cp";

  const thisValue = "{valueOf:function(){return undefined}}";

  let playerCode = funcCode;
  playerCode = await addCheckpoints(funcCode, `${cpointFunc}()`);
  // playerCode = await minifyCode(playerCode);

  const code = `
try{

with(${contextVar}){
function ${funcName}(${inputNames.join(",")}){

/* ------ PLAYER CODE START ------ */
${playerCode}
/* ------ PLAYER CODE END ------ */

}
}

/* ------ MODS START ------ */
${modCode}
/* ------ MODS END ------ */

/* ------ SETUP START ------ */
${generateSetupCode(suite, cpointFunc)}
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

  return async (...inputs: any[]) => {
    return await fn(context, ...inputs);
  };
}

function generateSetupCode(suite: Suite, cpointFunc: string): string {
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

var ${cpointFunc} = (function(){
  var count = 0;
  return function(){
    if (count++ > 1e5) throw new Error('Maximum execution time exceeded!');
  };
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
  setTimeout(() => document.body.appendChild(iframe));
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

type CodeWalkState = { start: number; end: number; insert: string }[];

async function addCheckpoints(
  code: string,
  cpointStmt: string
): Promise<string> {
  let ast;
  try {
    ast = acorn.parse(code, {
      allowAwaitOutsideFunction: true,
      allowReturnOutsideFunction: true,
    });
  } catch (error) {
    const { pos, loc } = error;
    if (pos !== undefined) {
      if (pos < code.length) {
        const char = code.charAt(pos);
        error.message = `Unexpected '${char}' at line ${loc.line}, column ${loc.column}.`;
      } else {
        error.message = "Unexpected end of function.";
      }
    }
    throw error;
  }

  const splices: CodeWalkState = [];
  splices.push({
    start: 0,
    end: 0,
    insert: cpointStmt + ";",
  });
  const visitLoop = (node: acorn.Node & any, state: CodeWalkState) => {
    state.push({
      start: node.body.start,
      end: node.body.start,
      insert: "{" + cpointStmt + ";",
    });
    state.push({
      start: node.body.end,
      end: node.body.end,
      insert: "}",
    });
  };
  walk.simple<CodeWalkState>(
    ast,
    {
      WhileStatement: visitLoop,
      DoWhileStatement: visitLoop,
      ForStatement: visitLoop,
      ForInStatement: visitLoop,
      ForOfStatement: visitLoop,
    },
    undefined,
    splices
  );

  const chars = [...code];
  splices.sort((a, b) => b.start - a.start);
  for (let splice of splices) {
    chars.splice(splice.start, splice.end - splice.start, ...splice.insert);
  }

  return chars.join("");
}

async function minifyCode(code: string): Promise<string> {
  const mini = await minify(code, {
    mangle: false,
    parse: { bare_returns: true },
    compress: false,
  });
  return mini.code || code;
}

export const Compiler = Object.freeze({
  createFunction,
});
