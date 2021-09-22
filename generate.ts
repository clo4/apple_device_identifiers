import * as path from "https://deno.land/std@0.108.0/path/mod.ts";

async function main() {
  Deno.chdir(path.dirname(path.fromFileUrl(import.meta.url)));

  const all: Record<string, string> = {};

  for await (const entry of Deno.readDir("devices")) {
    const string = await Deno.readTextFile(path.join("devices", entry.name));
    const json = JSON.parse(string);
    Object.assign(all, json);
  }

  const ids = JSON.stringify(all, null, 2);

  // JSON is now officially a subset of ECMAScript, so this is fine.
  const out = `
// This file was generated automatically (./generate.ts)
// Don't edit this file directly.

export const devices = ${ids} as const;
`.trimStart();

  await Promise.all([
    Deno.writeTextFile("devices.json", ids),
    Deno.writeTextFile("mod.ts", out),
  ]);
}

if (import.meta.main) {
  main();
}
