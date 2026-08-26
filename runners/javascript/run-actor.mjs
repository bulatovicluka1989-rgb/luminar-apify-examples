import { readFile } from 'node:fs/promises';

const TERMINAL = new Set(['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT']);

function requireToken() {
  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) throw new Error('Set APIFY_TOKEN in the environment before running this example.');
  return token;
}

async function requestJson(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.text()).slice(0, 800);
    throw new Error(`Apify API ${response.status}: ${body}`);
  }
  return { data: await response.json(), headers: response.headers };
}

async function waitForTerminal(run, token) {
  let current = run;
  const deadline = Date.now() + (20 * 60 * 1000);
  while (!TERMINAL.has(current.status)) {
    if (Date.now() >= deadline) throw new Error(`Timed out waiting for Actor run ${current.id} to reach a terminal status.`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const response = await requestJson(
      `https://api.apify.com/v2/actor-runs/${encodeURIComponent(current.id)}?waitForFinish=60`,
      token,
    );
    current = response.data.data;
  }
  return current;
}

async function readDataset(datasetId, token) {
  const items = [];
  const limit = 1000;
  let offset = 0;
  while (true) {
    const response = await requestJson(
      `https://api.apify.com/v2/datasets/${encodeURIComponent(datasetId)}/items?clean=true&format=json&offset=${offset}&limit=${limit}`,
      token,
    );
    const batch = response.data;
    if (!Array.isArray(batch)) throw new Error('Dataset endpoint did not return a JSON array.');
    items.push(...batch);
    offset += batch.length;
    const total = Number(response.headers.get('x-apify-pagination-total'));
    if (batch.length === 0 || batch.length < limit || (Number.isFinite(total) && offset >= total)) break;
  }
  return items;
}

export async function runActor({ actorRef, inputFile }) {
  if (!/^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(actorRef)) throw new Error('Invalid Actor reference.');
  const token = requireToken();
  const input = JSON.parse(await readFile(inputFile, 'utf8'));
  const apiActorRef = actorRef.replace('/', '~');
  const response = await requestJson(
    `https://api.apify.com/v2/acts/${encodeURIComponent(apiActorRef)}/runs?waitForFinish=120`,
    token,
    { method: 'POST', body: JSON.stringify(input) },
  );
  const run = await waitForTerminal(response.data.data, token);
  const runUrl = `https://console.apify.com/storage/runs/${run.id}`;
  if (run.status !== 'SUCCEEDED') {
    throw new Error(`Actor run ended with ${run.status}. Inspect ${runUrl}`);
  }
  const items = run.defaultDatasetId ? await readDataset(run.defaultDatasetId, token) : [];
  process.stdout.write(`${JSON.stringify({
    runId: run.id,
    status: run.status,
    runUrl,
    datasetId: run.defaultDatasetId ?? null,
    itemCount: items.length,
    items,
  }, null, 2)}\n`);
}
