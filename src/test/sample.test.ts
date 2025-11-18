import { test, expect } from "vitest";
import { spawn } from "first-base";
import { rootDir, cleanResult } from "./utils";

test("sample", async () => {
  const run = spawn(
    "npx",
    ["cleffa", "src/test/fixtures/sample.ts", "--blah", "45", "yes"],
    { cwd: rootDir.toString() },
  );
  await run.completion;
  expect(cleanResult(run.result)).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "Error: oh no

    ./src/test/fixtures/sample.ts:17:11


      at main (<rootDir>/src/test/fixtures/sample.ts:17:11)
      at cleffa (<rootDir>/dist/index.js:105:15)
      at runMain (<rootDir>/node_modules/@suchipi/run-main/dist/index.js:28:24)
      at Object.<anonymous> (<rootDir>/dist/index.js:108:24)
      at node:internal/main/run_main_module:28:49
    ",
      "stdout": "{ options: { blah: 45 }, args: [ 'yes' ] }
    ",
    }
  `);
});
