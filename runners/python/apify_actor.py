import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

TERMINAL = {"SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"}


def _token():
    value = os.environ.get("APIFY_TOKEN", "").strip()
    if not value:
        raise RuntimeError("Set APIFY_TOKEN in the environment before running this example.")
    return value


def _request_json(url, token, method="GET", body=None):
    data = None if body is None else json.dumps(body).encode("utf-8")
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            return json.loads(response.read().decode("utf-8")), response.headers
    except urllib.error.HTTPError as error:
        body_text = error.read().decode("utf-8", errors="replace")[:800]
        raise RuntimeError(f"Apify API {error.code}: {body_text}") from error


def _wait_for_terminal(run, token):
    current = run
    deadline = time.monotonic() + (20 * 60)
    while current.get("status") not in TERMINAL:
        if time.monotonic() >= deadline:
            raise RuntimeError(f"Timed out waiting for Actor run {current.get('id')} to reach a terminal status.")
        time.sleep(5)
        payload, _ = _request_json(
            f"https://api.apify.com/v2/actor-runs/{urllib.parse.quote(current['id'])}?waitForFinish=60",
            token,
        )
        current = payload["data"]
    return current


def _read_dataset(dataset_id, token):
    items = []
    limit = 1000
    offset = 0
    while True:
        url = (
            f"https://api.apify.com/v2/datasets/{urllib.parse.quote(dataset_id)}/items"
            f"?clean=true&format=json&offset={offset}&limit={limit}"
        )
        batch, headers = _request_json(url, token)
        if not isinstance(batch, list):
            raise RuntimeError("Dataset endpoint did not return a JSON array.")
        items.extend(batch)
        offset += len(batch)
        total_header = headers.get("x-apify-pagination-total")
        total = int(total_header) if total_header and total_header.isdigit() else None
        if not batch or len(batch) < limit or (total is not None and offset >= total):
            return items


def run_actor(actor_ref, input_file):
    if "/" not in actor_ref or actor_ref.count("/") != 1:
        raise RuntimeError("Invalid Actor reference.")
    token = _token()
    input_data = json.loads(Path(input_file).read_text(encoding="utf-8"))
    api_actor_ref = urllib.parse.quote(actor_ref.replace("/", "~"))
    payload, _ = _request_json(
        f"https://api.apify.com/v2/acts/{api_actor_ref}/runs?waitForFinish=120",
        token,
        method="POST",
        body=input_data,
    )
    run = _wait_for_terminal(payload["data"], token)
    run_url = f"https://console.apify.com/storage/runs/{run['id']}"
    if run.get("status") != "SUCCEEDED":
        raise RuntimeError(f"Actor run ended with {run.get('status')}. Inspect {run_url}")
    dataset_id = run.get("defaultDatasetId")
    items = _read_dataset(dataset_id, token) if dataset_id else []
    print(json.dumps({
        "runId": run["id"],
        "status": run["status"],
        "runUrl": run_url,
        "datasetId": dataset_id,
        "itemCount": len(items),
        "items": items,
    }, indent=2, ensure_ascii=False))
