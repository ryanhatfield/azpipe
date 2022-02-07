# Azure Pipeline Preview

```
azpipe --help 

Use an existing Azure Pipeline instance (pipelineId) to remotely validate and template a local Azure
 Pipeline YAML file.

Options:
  -h, --help                                                                               [boolean]
      --version                                                                            [boolean]
      --username, --user                     [string] [required] [default: "jdoe@companyco.com"]
      --personalAccessToken, --pat     [string] [required] [default: "$AZURE_PERSONAL_ACCESS_TOKEN"]
      --organization, --org                           [string] [required] [default: "companyco"]
      --project, --proj                         [string] [required] [default: "project-name"]
      --pipelineId, --pipe                                      [number] [required] [default: "332"]
      --inputFile, --in                                                          [string] [required]
      --outputFile, --out                                                                   [string]
      --stdout                                                                             [boolean]
  -w, --watch                                                                              [boolean]
```