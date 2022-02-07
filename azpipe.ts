import { getArgs } from "./args.ts"
import { Run, Watch } from './preview.ts'

export async function RunCMD() {
    const buildVersion = Deno.env.get("AZPIPE_BUILD_VERSION") ?? "1.6.0"
    const args = await getArgs({ version: buildVersion })

    // run at least once
    await Run(args)

    if (args.watch)
        Watch(args, Run)
}

await RunCMD()