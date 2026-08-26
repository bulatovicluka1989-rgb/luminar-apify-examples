param(
    [Parameter(Mandatory = $true)][string]$ActorRef,
    [Parameter(Mandatory = $true)][string]$InputFile
)

$ErrorActionPreference = 'Stop'
$terminal = @('SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT')
$token = [Environment]::GetEnvironmentVariable('APIFY_TOKEN')
if ([string]::IsNullOrWhiteSpace($token)) {
    throw 'Set APIFY_TOKEN in the environment before running this example.'
}
if ($ActorRef -notmatch '^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$') {
    throw 'Invalid Actor reference.'
}

$headers = @{ Authorization = "Bearer $token"; Accept = 'application/json' }
$inputJson = Get-Content -LiteralPath $InputFile -Raw
$apiActorRef = [Uri]::EscapeDataString($ActorRef.Replace('/', '~'))
$response = Invoke-RestMethod `
    -Method Post `
    -Uri "https://api.apify.com/v2/acts/$apiActorRef/runs?waitForFinish=120" `
    -Headers $headers `
    -ContentType 'application/json' `
    -Body $inputJson
$run = $response.data
$deadline = [DateTimeOffset]::UtcNow.AddMinutes(20)

while ($terminal -notcontains $run.status) {
    if ([DateTimeOffset]::UtcNow -ge $deadline) {
        throw "Timed out waiting for Actor run $($run.id) to reach a terminal status."
    }
    Start-Sleep -Seconds 5
    $runResponse = Invoke-RestMethod `
        -Method Get `
        -Uri "https://api.apify.com/v2/actor-runs/$($run.id)?waitForFinish=60" `
        -Headers $headers
    $run = $runResponse.data
}

$runUrl = "https://console.apify.com/storage/runs/$($run.id)"
if ($run.status -ne 'SUCCEEDED') {
    throw "Actor run ended with $($run.status). Inspect $runUrl"
}

$items = [System.Collections.Generic.List[object]]::new()
if (-not [string]::IsNullOrWhiteSpace($run.defaultDatasetId)) {
    $offset = 0
    $limit = 1000
    while ($true) {
        $datasetUrl = "https://api.apify.com/v2/datasets/$($run.defaultDatasetId)/items?clean=true&format=json&offset=$offset&limit=$limit"
        $batch = @(Invoke-RestMethod -Method Get -Uri $datasetUrl -Headers $headers)
        foreach ($item in $batch) { $items.Add($item) }
        $offset += $batch.Count
        if ($batch.Count -eq 0 -or $batch.Count -lt $limit) { break }
    }
}

[ordered]@{
    runId = $run.id
    status = $run.status
    runUrl = $runUrl
    datasetId = $run.defaultDatasetId
    itemCount = $items.Count
    items = $items
} | ConvertTo-Json -Depth 100
