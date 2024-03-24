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
      at main (<rootDir>/src/test/fixtures/sample.ts:17:11)
      at cleffa (<rootDir>/dist/index.js:105:15)
      at Object.<anonymous> (<rootDir>/dist/index.js:108:1)
      at node:internal/main/run_main_module:23:47
    ",
      "stdout": "{ options: { blah: 45 }, args: [ 'yes' ] }
    ",
    }
  `);
});
