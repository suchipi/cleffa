import { RunContext } from "first-base";
import { Path } from "nice-path";

export const rootDir = new Path(__dirname, "../..").normalize();

export function cleanStr(str: string) {
  return str.replaceAll(rootDir.toString(), "<rootDir>");
}

export function cleanResult(
  result: RunContext["result"],
): RunContext["result"] {
  return {
    ...result,
    stderr: cleanStr(result.stderr),
    stdout: cleanStr(result.stdout),
  };
}
