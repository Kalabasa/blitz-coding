export type Mod = {
  code?: string;
  hiddenCode?: string;
  libraryCode?: string | string[];
  cleanupCode?: string;
  preprocess?: (code: string) => string | void;
};

function generateSetupCode(mods: Mod[]): string {
  return (
    compileLibraryCode(mods) + ";" + mods.map(convertMemberCode).join(";") + ";"
  );
}

function generateCleanupCode(mods: Mod[]): string {
  return mods.map((mod) => mod.cleanupCode).join(";") + ";";
}

function compileLibraryCode(mods: Mod[]) {
  return (
    Array.from(new Set(mods.flatMap((m) => m.libraryCode)))
      .filter((m) => m)
      .join(";") + ";"
  );
}

function convertMemberCode(mod: Mod) {
  return [mod.hiddenCode, mod.code, ""].join(";");
}

export function iife(code: string = "") {
  return `(function(){${code}})()`;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Mod = Object.freeze({
  generateSetupCode,
  generateCleanupCode,
});
