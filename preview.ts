import { Arguments } from "./args.ts"
import { Build, PreviewResources } from './azdo.ts'

export async function Run(args: Arguments) {
    console.debug(`template preview started for ${args.inputFile}`)

    let resources: PreviewResources = {
        repositories: {}
    }

    let templateParameters: Record<string, unknown> = {}

    if (args.resources) {
        try {
            resources = JSON.parse(args.resources)
        } finally {
            // ignore for now
        }
    }

    let variables: Record<string, unknown> = {}

    if (args.variables) {
        try {
            variables = JSON.parse(args.variables)
        } finally {
            // ignore for now
        }
    }

    if (args.templateParameters) {
        try {
            templateParameters = JSON.parse(args.templateParameters)
        } finally {
            // ignore for now
        }
    }

    const { success, previewPipelineYaml, error } = await Build({
        project: args.project,
        pipelineId: args.pipelineId,
        inputFile: args.inputFile,
        organization: args.organization,
        resources,
        templateParameters,
        variables,
    })

    if (!success) {
        console.error(error)
        return
    }

    if (previewPipelineYaml === undefined) {
        console.error('preview pipeline empty')
        return
    }

    if (args.stdout) {
        console.log(previewPipelineYaml)
    } else {
        await Deno.writeTextFile(args.outputFile, previewPipelineYaml)
    }

    console.debug(`template preview success for ${args.inputFile} -> ${args.outputFile}`)

}

export async function Watch(
    args: Arguments,
    runPreview: (args: Arguments) => Promise<void>,
    eventKinds: Deno.FsEvent['kind'][] = ['create', 'modify']
) {
    const watcher = Deno.watchFs(args.inputFile);

    // TODO: Look into using Promise.all to watch this and Deno.signal
    for await (const event of watcher)
        if (eventKinds.includes(event.kind))
            await runPreview(args)
}