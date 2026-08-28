$ErrorActionPreference = 'Stop'
$runner = Join-Path $PSScriptRoot '../../../runners/powershell/Run-ApifyActor.ps1'
$inputFile = Join-Path $PSScriptRoot '../inputs/quick-start.json'
& $runner -ActorRef 'luminar/gleif-lei-change-monitor' -InputFile $inputFile
