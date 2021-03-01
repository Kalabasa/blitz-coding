export type Mod = {
  code: string;
  hiddenCode?: string;
  libraryCode?: string;
  preCheck?: (code: string) => void;
};

function generateSetupCode(mods: Mod | Mod[]): string {
  if (Array.isArray(mods)) {
    return (
      compileLibraryCode(mods) +
      ";" +
      mods.map(convertMemberCode).join(";") +
      ";"
    );
  }
  return convertSingleCode(mods);
}

function compileLibraryCode(mods: Mod[]) {
  return (
    Array.from(new Set(mods.map((m) => m.libraryCode)))
      .filter((m) => m)
      .join(";") + ";"
  );
}

function convertMemberCode(mod: Mod) {
  return [mod.hiddenCode, mod.code, ""].join(";");
}

function convertSingleCode(mod: Mod) {
  return [mod.libraryCode, mod.hiddenCode, mod.code, ""].join(";");
}

export function iife(code: string = "") {
  return `(function(){${code}})()`;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Mod = Object.freeze({
  generateSetupCode,
});
