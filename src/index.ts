#!/usr/bin/env node
import path from "path";
import { formatError } from "pretty-print-error";
import { parseArgv } from "clef-parse";
import * as kame from "kame";

async function cleffa() {
  const { options, positionalArgs } = parseArgv();

  const nextPositionalArg = positionalArgs[0];
  const targetFilePath =
    nextPositionalArg && nextPositionalArg.startsWith("-")
      ? null
      : positionalArgs.shift();

  const pathsToTry = [
    targetFilePath,
    typeof targetFilePath === "string" && !/^\.{1,2}\//.test(targetFilePath)
      ? "./" + targetFilePath
      : null,
    ...(targetFilePath == null
      ? [
          "./src/index.tsx",
          "./src/index.ts",
          "./src/index.jsx",
          "./src/index.js",
          "./index.tsx",
          "./index.ts",
          "./index.jsx",
          "./index.js",
        ]
      : []),
  ].filter(Boolean) as Array<string>;

  let absolutePathToTargetFilePath: string | null = null;

  let resolveError: Error | null = null;
  for (const pathToTry of pathsToTry) {
    try {
      absolutePathToTargetFilePath = kame.defaultResolver.resolve(
        pathToTry,
        path.join(process.cwd(), "<cleffa-entrypoint>"),
      );
      break;
    } catch (err) {
      resolveError = err as Error;
    }
  }

  if (absolutePathToTargetFilePath === __filename) {
    absolutePathToTargetFilePath = null;
  }

  if (absolutePathToTargetFilePath == null) {
    const err = new Error(
      "Failed to find the target file to load. Please specify it on the command line as a positional argument, eg 'npx cleffa ./my-script.js'.",
    );
    Object.assign(err, {
      pathsWeTried: pathsToTry,
      originalError: resolveError,
    });
    throw err;
  }

  // Remove cleffa from argv, making it look like node
  // is the calling thing. This makes process.argv.slice(2)
  // work as expected in user code.
  process.argv.splice(1, 1);

  const kameForCurrentNode = kame.configure({
    loader: (filename: string) =>
      kame.defaultLoader.load(filename, { target: "es2022" }),
  });

  const runtime = new kameForCurrentNode.Runtime();

  // In case they don't want to use a main function
  global.options = options;
  global.args = positionalArgs;

  const targetMod = runtime.load(absolutePathToTargetFilePath);

  let mainFn;
  if (typeof targetMod === "function") {
    mainFn = targetMod;
  } else if (typeof targetMod === "object" && targetMod != null) {
    if (typeof targetMod.main === "function") {
      mainFn = targetMod.main;
    } else if (typeof targetMod.default === "function") {
      mainFn = targetMod.default;
    }
  }

  if (typeof mainFn === "function") {
    await mainFn(options, ...positionalArgs);
  }
}

cleffa().catch((err) => {
  console.error(formatError(err));
  process.exit(1);
});
