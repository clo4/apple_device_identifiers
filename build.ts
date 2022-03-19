#!/usr/bin/env deno --quiet --allow-all

import * as path from "https://deno.land/std@0.130.0/path/mod.ts";
import { debounce } from "https://deno.land/std@0.130.0/async/debounce.ts";

function timer() {
  const start = performance.now();
  return () => performance.now() - start;
}

async function generate(init: {
  inputDirectory: string;
  outputJson: string;
  outputTypescript: string;
}) {
  const { inputDirectory, outputJson, outputTypescript } = init;

  const time = timer();

  const readPromises = [...Deno.readDirSync(inputDirectory)]
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => path.join(inputDirectory, name))
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
    Deno.writeTextFile(outputJson, devices + "\n"),
    Deno.writeTextFile(outputTypescript, mod),
  ]);

  await Deno.run({ cmd: ["deno", "fmt", "--quiet"] }).status();
  console.log("%c√", "color: green", `Generated in ${time()} ms`);
}

async function main() {
  const thisFile = path.fromFileUrl(import.meta.url);
  const thisDir = path.dirname(thisFile);

  const inputDirectory = path.join(thisDir, "devices");
  const outputJson = path.join(thisDir, "devices.json");
  const outputTypescript = path.join(thisDir, "mod.ts");

  const run = () => generate({ inputDirectory, outputJson, outputTypescript });

  if (Deno.args.includes("--watch")) {
    console.log("Building and watching for changes, ^c to exit");
    const generateDebounced = debounce(run, 500);
    run();
    for await (const _ of Deno.watchFs(inputDirectory)) {
      generateDebounced();
    }
  } else {
    run();
  }
}

if (import.meta.main) main();
