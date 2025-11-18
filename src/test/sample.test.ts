import { test, expect } from "vitest";
import { spawn } from "first-base";
import { rootDir } from "./utils";

test("sample", async () => {
  const run = spawn(
    "npx",
    ["cleffa", "src/test/fixtures/sample.ts", "--blah", "45", "yes"],
    { cwd: rootDir },
  );
  await run.completion;
  expect(run.cleanResult()).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "Error: oh no

    ./src/test/fixtures/sample.ts:17:11
      at somewhere
    ",
      "stdout": "{ options: { blah: 45 }, args: [ 'yes' ] }
    ",
    }
  `);
});
