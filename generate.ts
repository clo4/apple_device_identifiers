import * as path from "https://deno.land/std@0.108.0/path/mod.ts";

function timer() {
  const start = performance.now();
  return function time() {
    return performance.now() - start;
  };
}

async function main(dir = "devices") {
  const timeWriting = timer();

  const readPromises = [...Deno.readDirSync(dir)]
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => path.join(dir, name))
    .map((path) => Deno.readTextFile(path));

  const files = await Promise.all(readPromises);

  const objects = files.map((text) => JSON.parse(text));

  const data = Object.assign({}, ...objects);

  const devices = JSON.stringify(data, null, 2);

  // JSON is now officially a subset of ECMAScript, so this is fine.
  const mod = `
// This file was generated automatically (./generate.ts)
// Don't edit this file directly.

export const devices = ${devices} as const;
`.trimStart();

  await Promise.all([
    Deno.writeTextFile("devices.json", devices + "\n"),
    Deno.writeTextFile("mod.ts", mod),
  ]);

  console.log(`Generated in ${timeWriting()} ms`);
}

if (import.meta.main) {
  main();
}
