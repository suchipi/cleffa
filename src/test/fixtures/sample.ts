#!/usr/bin/env -S npx cleffa
type Something = 4;

export function main(options: any, ...args: Array<string>) {
  console.log({
    options,
    args,
  });

  throw new Error("oh no");
}
