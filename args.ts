import YARGS from 'https://deno.land/x/yargs@v17.1.1-deno/deno.ts';
import { config, DotenvConfig } from "https://deno.land/x/dotenv@v3.0.0/mod.ts";

export interface Arguments {
    organization: string;
    project: string;
    personalAccessToken: string;
    inputFile: string;
    outputFile: string;
    username: string;
    pipelineId: string
    watch?: boolean
    stdout?: boolean
    resources?: string
    templateParameters?: string
    variables?: string
}

async function execThenGetConfig({path= '.azpipe'}: {path: string}): Promise<DotenvConfig> {
    const status = await Deno.permissions.query({ name: "", path: "/etc" });
if (status.state === "granted") {
  data = await Deno.readFile("/etc/passwd");
}
}

export async function getArgs({ version }: { version: string }): Promise<Arguments> {

    // use both local config and home config files
    const dotEnv = config({ path: '.azpipe' })
    const userDotEnv = config({ path: `${Deno.env.get("HOME")}/.azpipe` })
    const getEnv = (varName: string) => dotEnv[varName] ?? userDotEnv[varName]

    const yargs: ReturnType<typeof YARGS> = YARGS(Deno.args)

    yargs.version(version)
    yargs.usage('Use an existing Azure Pipeline instance (pipelineId) to remotely validate and template a local Azure Pipeline YAML file.')

    yargs.options({
        username: {
            alias: 'user',
            default: getEnv('AZPIPE_USERNAME'),
            description: '$AZPIPE_USERNAME',
            string: true,
            required: true
        },
        personalAccessToken: {
            alias: 'pat',
            description: '$AZPIPE_PERSONAL_ACCESS_TOKEN',
            string: true
        },
        organization: {
            alias: 'org',
            default: getEnv('AZPIPE_ORGANIZATION'),
            description: '$AZPIPE_ORGANIZATION',
            string: true,
            required: true
        },
        project: {
            alias: 'proj',
            default: getEnv('AZPIPE_PROJECT'),
            description: '$AZPIPE_PROJECT',
            string: true,
            required: true
        },
        pipelineId: {
            alias: 'pipe',
            default: getEnv('AZPIPE_PIPELINE_ID'),
            description: '$AZPIPE_PIPELINE_ID',
            number: true,
            required: true
        },
        inputFile: {
            alias: 'in',
            default: getEnv('AZPIPE_INPUT_FILE'),
            description: '$AZPIPE_INPUT_FILE',
            string: true,
            required: true
        },
        outputFile: {
            alias: 'out',
            default: getEnv('AZPIPE_OUTPUT_FILE'),
            description: '$AZPIPE_OUTPUT_FILE',
            string: true
        },
        resources: {
            default: getEnv('AZPIPE_RESOURCES_JSON'),
            description: '$AZPIPE_RESOURCES_JSON',
            string: true
        },
        templateParameters: {
            default: getEnv('AZPIPE_TEMPLATE_PARAMETERS_JSON'),
            description: '$AZPIPE_TEMPLATE_PARAMETERS_JSON',
            string: true
        },
        variables: {
            default: getEnv('AZPIPE_VARIABLES_JSON'),
            description: '$AZPIPE_VARIABLES_JSON',
            string: true,
        },
        stdout: {
            flag: 'stdout',
            boolean: true,
        },
        watch: {
            alias: 'w',
            flag: 'watch',
            boolean: true,
        },
        help: {
            alias: 'h',
            flag: 'help'
        },
        version: {
            description: null,
        }
    })

    // set console width a bit wider to show env values in help message
    yargs.wrap(120)

    const cmdArgs: Arguments & ReturnType<typeof YARGS> = yargs.parse();

    // ! add after args as to not print out to console in help message
    cmdArgs.personalAccessToken ??= getEnv('AZPIPE_PERSONAL_ACCESS_TOKEN')
    cmdArgs.outputFile ??= await Deno.makeTempFile({ suffix: '.yml' })

    return cmdArgs
}