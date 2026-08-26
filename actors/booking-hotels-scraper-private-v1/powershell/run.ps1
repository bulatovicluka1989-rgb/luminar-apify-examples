$ErrorActionPreference = 'Stop'
$runner = Join-Path $PSScriptRoot '../../../runners/powershell/Run-ApifyActor.ps1'
$inputFile = Join-Path $PSScriptRoot '../inputs/quick-start.json'
& $runner -ActorRef 'luminar/booking-hotels-scraper-private-v1' -InputFile $inputFile
