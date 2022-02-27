#!/usr/bin/env node
import path from "path";
import * as changeCase from "change-case";
import { formatError } from "pretty-print-error";
import * as kame from "kame";

async function cleffa() {
  const argv = process.argv.slice(2);

  const options: any = {};
  const positionalArgs: Array<any> = [];

  let isAfterDoubleDash = false;
  while (argv.length > 0) {
    let item = argv.shift();
    if (!item) break;

    if (item === "--") {
      isAfterDoubleDash = true;
      continue;
    }

    if (item.startsWith("-")) {
      if (isAfterDoubleDash) {
        positionalArgs.push(item);
      } else {
        const propertyName = changeCase.camelCase(item.replace(/^-{1,2}/, ""));
        let propertyValue: string | number | boolean | null | undefined = null;

        const nextValue = argv[0];
        if (nextValue === "true" || nextValue === "false") {
          argv.shift();
          propertyValue = nextValue === "true";
        } else if (nextValue == null || nextValue.startsWith("-")) {
          propertyValue = true;
        } else if (nextValue === "null") {
          argv.shift();
          propertyValue = null;
        } else if (nextValue === "undefined") {
          argv.shift();
          propertyValue = undefined;
        } else if (nextValue === String(Number(nextValue))) {
          argv.shift();
          propertyValue = Number(nextValue);
        } else {
          argv.shift();
          propertyValue = nextValue;
        }

        options[propertyName] = propertyValue;
      }
    } else {
      positionalArgs.push(item);
    }
  }

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
  ].filter(Boolean);

  let absolutePathToTargetFilePath: string | null = null;

  let pathThatWorked: string | null = null;
  let resolveError: Error | null = null;
  for (const pathToTry of pathsToTry) {
    try {
      absolutePathToTargetFilePath = kame.defaultResolver.resolve(
        pathToTry,
        path.join(process.cwd(), "<cleffa-entrypoint>")
      );
      pathThatWorked = pathToTry;
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
      "Failed to find the target file to load. Please specify it on the command line as a positional argument, eg 'npx cleffa ./my-script.js'."
    );
    Object.assign(err, {
      pathsWeTried: pathsToTry,
      originalError: resolveError,
    });
    throw err;
  }

  const runtime = new kame.Runtime();
  const targetMod = runtime.load(absolutePathToTargetFilePath);

  const mainFn = targetMod.__esModule
    ? targetMod.default || targetMod.main
    : targetMod || targetMod.main;

  if (typeof mainFn !== "function") {
    const err = new Error(
      `'${pathThatWorked}' didn't export a function to call. It should export the function as either the default export, a named export called \`main\`, or by setting \`module.exports\` to the function.`
    );
    Object.assign(err, {
      "example export syntax that would work": [
        "export default function main() {}",
        "export function main() {}",
        "export const main = () => {}",
        "module.exports = function main() {}",
        "exports.main = function main() {}",
      ],
    });
    throw err;
  }

  await mainFn(options, ...positionalArgs);
}

cleffa().catch((err) => {
  console.error(formatError(err));
  process.exit(1);
});
