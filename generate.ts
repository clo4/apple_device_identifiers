import * as path from "https://deno.land/std@0.112.0/path/mod.ts";

function timer() {
  const start = performance.now();
  return () => performance.now() - start;
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
  const data = Object.assign({}, ...objects) as Record<string, string>;
  const devices = JSON.stringify(data, null, 2);

  // 'YYYY-MM-DD'.length === 10
  const yyyymmdd = new Date().toISOString().slice(0, 10);

  const mod = `
/**
 * This file was generated automatically on ${yyyymmdd}.
 *
 * @module
 */

/**
 * A map of device name to device identifier.
 */
export const devices = ${devices} as const;

/**
 * A type that maps device name to device identifier.
 */
export type Devices = typeof devices;

/**
 * An exclusive union of device identifiers. Only currently known identifiers
 * can be assigned to this type.
 *
 * Most of the time, \`AnyIdentifier\` is a better fit as it also allows
 * any string to be assigned to it
 */
export type Identifier = Devices[keyof Devices];

// All strings can be assigned to \`string & {}\`, but because it's a distinct
// type from \`string\`, the compiler can't simplify the type.

/**
 * An union of device identifiers. Any string can be assigned to this
 * type, which allows for future identifiers that were unknown at the time this
 * list was created.
 */
// deno-lint-ignore ban-types
export type AnyIdentifier = Identifier | (string & {});
`.trimStart();

  await Promise.all([
    Deno.writeTextFile("devices.json", devices + "\n"),
    Deno.writeTextFile("mod.ts", mod),
  ]);
  console.log(`Wrote files ${timeWriting()} ms`);

  const timeFormatting = timer();
  await Deno.run({ cmd: ["deno", "fmt", "--quiet"] }).status();
  console.log(`Formatted in ${timeFormatting()} ms`);
}

if (import.meta.main) {
  main();
}
