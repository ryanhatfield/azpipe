import { getArgs } from "./args.ts";
import { Run, Watch } from "./preview.ts";
import { parse } from "https://deno.land/std@0.127.0/flags/mod.ts";

export async function RunCMD() {
  const { buildVersion } = parse(Deno.args);
  const args = await getArgs({ version: buildVersion ?? "1.8.1" });

  // run at least once
  await Run(args);

  if (args.watch) {
    Watch(args, Run);
  }
}

await RunCMD();
