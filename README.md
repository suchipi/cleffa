# cleffa

CLI tool that:

- Parses argv into an object (of command-line flags) and an array of positional arguments
- Loads a function from the specified file (supports JavaScript, TypeScript, ESM, etc)
- Calls your function with that object and any positional args, and, if an error occurs (via sync throw or Promise rejection):
  - Pretty-prints the error
  - Exits the process with status code 1

It's an untyped CLI version of [clefairy](https://npm.im/clefairy), suitable for use in simple scripts/programs.

## Usage Example

`some-file.js`:

```ts
export default async function main(options, ...args) {
  console.log({ options, args });
}
```

Then, if you run:

```
npx cleffa ./some-file.js --user-name Jeff one two -v -- --hi
```

It logs:

```js
{
  options: { userName: 'Jeff', v: true },
  args: [ 'one', 'two', '--hi' ]
}
```

## Supported Syntax

Your input file will be compiled with [kame](https://npm.im/kame) prior to execution. As such, you can use ESM and TypeScript syntax in your input file.

## Shebang Usage (use without installing)

You can put this line at the top of any executable JavaScript/TypeScript file to make it run with cleffa anywhere that node is installed:

```
#!/usr/bin/env -S npx --yes cleffa
```

For example, if you made a file named `print-files` (this is a contrived example):

```ts
#!/usr/bin/env -S npx --yes cleffa
import fs from "fs";

export default function main(options, ...args) {
  for (const file of args) {
    console.log(fs.readFileSync(file, "utf-8"));
  }
}
```

Then marked it as executable:

```
$ chmod +x ./print-files
```

Then ran it:

```
$ ./print-files ./index.js ./index.ts
```

It would print the contents of index.js and index.ts.

## License

MIT
