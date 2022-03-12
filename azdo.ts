
export interface PreviewResponse {
    finalYaml: string
}

export interface PreviewRequest {
    previewRun: true
    stagesToSkip?: string[]
    templateParameters?: Record<string, unknown>
    variables?: Record<string, unknown>
    yamlOverride: string
    resources: PreviewResources
}

export interface PreviewResources {
    repositories: {
        [key: string]: { refName: string }
    }
}

export interface BuildProps {
    project: string;
    pipelineId: string;
    organization: string;
    inputFile: string;
    resources: PreviewResources,
    templateParameters: Record<string, unknown>,
    variables: Record<string, unknown>
}

export interface BuildResult {
    success: boolean,
    error?: string,
    previewPipelineYaml?: string
}

const decoder = new TextDecoder()

export async function Build({ project, pipelineId, inputFile, resources, templateParameters, variables, organization }: BuildProps): Promise<BuildResult> {
    const inputFileText = await Deno.readTextFile(inputFile)
    const tempFile = await Deno.makeTempFile({ suffix: '.yml' })

    const request: PreviewRequest = {
        previewRun: true,
        yamlOverride: inputFileText,
        resources,
        templateParameters,
        variables,
    }

    const requestJson = JSON.stringify(request)

    await Deno.writeTextFile(tempFile, requestJson)

    const cmdArgs = [
        "az", "devops", "invoke",
        "--area=pipelines",
        "--resource=preview",
        `--route-parameters`,
        `project=${project}`,
        `pipelineId=${pipelineId}`,
        "--api-version=6.0-preview",
        "--http-method=post",
        `--in-file=${tempFile}`
    ]

    if (organization && organization !== "") {
        cmdArgs.push(`--organization=${organization}`)
    }

    const result = await Deno.run({
        cmd: cmdArgs,
        stdout: 'piped',
        stderr: 'piped'
    });

    const status = await result.status()

    if (!status.success) {
        return {
            success: false,
            error: await (async () => {
                const errorRaw = await result.stderrOutput()
                if (errorRaw && errorRaw.length > 0) {
                    const errorText = decoder.decode(errorRaw)

                    const matches = errorText.match(/\(Line: ([0-9]*), Col: ([0-9]*)(?:, Idx: ([0-9]*))?\)(?: - \(Line: ([0-9]*), Col: ([0-9]*), Idx: ([0-9]*)\))?: (.*)/)

                    if (matches && matches.length > 1) {
                        return `ERROR: ${inputFile}:${matches[1]}:${matches[2]} : ${matches[matches.length - 1]};\n original error: ${errorText}\n`
                    }

                    return errorText
                }
                return "Unknown error occurred"
            })()
        }
    }

    const resultRaw = await result.output()

    if (!resultRaw || resultRaw.length <= 0) {
        return { success: false, error: "Empty result" }
    }

    let response: PreviewResponse = { finalYaml: "" }

    try {
        const resultText = decoder.decode(resultRaw)
        response = JSON.parse(resultText)
    } catch (error) {
        throw new Error(`JSON Parse error happened when calling az devops invoke: ${error}`)
    }

    return {
        success: status.success,
        previewPipelineYaml: response.finalYaml,
    }

}