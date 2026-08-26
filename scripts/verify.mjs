#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

const secretPatterns = [
  ['APIFY_TOKEN_VALUE', /\bapify_api_[A-Za-z0-9_-]{16,}\b/i],
  ['OPENAI_KEY', /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ['GITHUB_TOKEN', /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/i],
  ['TELEGRAM_TOKEN', /\b\d{7,12}:[A-Za-z0-9_-]{30,}\b/],
  ['PRIVATE_KEY', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['TOKEN_IN_URL', /https?:\/\/[^\s"']*[?&]token=[^\s"'&]+/i],
];
const forbiddenTerms = [
  ['implementation', 'Root'].join(''),
  ['source', 'Route'].join(''),
  ['.', 'hermes'].join(''),
  ['proxy', 'Url'].join(''),
  ['cookie', 'Header'].join(''),
  ['route', '-health.mjs'].join(''),
  ['proxy', '-policy.mjs'].join(''),
  ['released', '-sources'].join(''),
  ['usage', '_audit.jsonl'].join(''),
];
const allowedTop = new Set(['.github', 'README.md', 'SECURITY.md', 'actors', 'catalog.json', 'catalog.schema.json', 'runners', 'scripts', 'source-locks.json']);

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

async function readJson(relative) {
  try { return JSON.parse(await readFile(path.join(root, ...relative.split('/')), 'utf8')); }
  catch (error) { errors.push(`${relative}: invalid or missing JSON (${error.message})`); return null; }
}

async function walk(current = root) {
  const result = [];
  for (const entry of await readdir(current, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) result.push(...await walk(absolute));
    else result.push(path.relative(root, absolute).replaceAll('\\', '/'));
  }
  return result.sort();
}

async function scan(relative) {
  const absolute = path.join(root, ...relative.split('/'));
  if (!(await exists(absolute))) { errors.push(`${relative}: missing`); return null; }
  const content = await readFile(absolute, 'utf8');
  for (const [code, pattern] of secretPatterns) if (pattern.test(content)) errors.push(`${relative}: ${code}`);
  for (const term of forbiddenTerms) if (content.includes(term)) errors.push(`${relative}: private implementation term ${term}`);
  if (relative.endsWith('.json')) {
    try { JSON.parse(content); } catch (error) { errors.push(`${relative}: invalid JSON (${error.message})`); }
  }
  return content;
}

const allFiles = await walk();
for (const relative of allFiles) {
  if (!allowedTop.has(relative.split('/')[0])) errors.push(`${relative}: path is outside the public allowlist`);
  await scan(relative);
}

const catalog = await readJson('catalog.json');
const locks = await readJson('source-locks.json');
await readJson('catalog.schema.json');
if (catalog) {
  if (catalog.repository?.status !== 'LOCAL_HASH_LOCKED_STAGING' || catalog.repository?.approvalGranted !== false || catalog.repository?.remoteUrl !== null) {
    errors.push('catalog.json: staging must not claim a remote publication');
  }
  if (catalog.actorCount !== catalog.actors?.length) errors.push('catalog.json: actorCount mismatch');
  const keys = new Set();
  for (const actor of catalog.actors ?? []) {
    if (keys.has(actor.actorKey)) errors.push(`${actor.actorKey}: duplicate catalog entry`);
    keys.add(actor.actorKey);
    if (!/^[a-f0-9]{64}$/.test(actor.sourceLockSha256 ?? '')) errors.push(`${actor.actorKey}: invalid source lock`);
    const manifest = await readJson(actor.manifestPath);
    if (!manifest) continue;
    if (manifest.actorKey !== actor.actorKey || manifest.actorRef !== actor.actorRef) errors.push(`${actor.actorKey}: manifest identity mismatch`);
    if (manifest.sourceLock?.status !== 'READY' || manifest.sourceLock?.sha256 !== actor.sourceLockSha256) errors.push(`${actor.actorKey}: manifest source lock mismatch`);
    for (const suffix of ['/inputs/quick-start.json', '/outputs/sample.json', '/javascript/run.mjs', '/python/run.py', '/powershell/run.ps1']) {
      if (!manifest.files?.some((file) => file.endsWith(suffix))) errors.push(`${actor.actorKey}: missing ${suffix}`);
    }
    for (const file of manifest.files ?? []) if (!(await exists(path.join(root, ...file.split('/'))))) errors.push(`${actor.actorKey}: missing manifest file ${file}`);
  }
}

if (catalog && locks) {
  const catalogKeys = [...catalog.actors.map((actor) => actor.actorKey)].sort();
  const lockKeys = [...locks.actors.map((actor) => actor.actorKey)].sort();
  if (JSON.stringify(catalogKeys) !== JSON.stringify(lockKeys)) errors.push('source-locks.json: Actor set mismatch');
  for (const lock of locks.actors ?? []) {
    const actor = catalog.actors.find((item) => item.actorKey === lock.actorKey);
    if (!actor || actor.sourceLockSha256 !== lock.sourceLockSha256) errors.push(`${lock.actorKey}: root source lock mismatch`);
    for (const [relative, expected] of Object.entries(lock.files ?? {})) {
      const content = await readFile(path.join(root, ...relative.split('/')), 'utf8').catch(() => null);
      if (content === null) errors.push(`${lock.actorKey}: locked file missing ${relative}`);
      else if (sha256(content) !== expected) errors.push(`${lock.actorKey}: locked file drift ${relative}`);
    }
  }
}

const report = {
  ok: errors.length === 0,
  actorCount: catalog?.actorCount ?? 0,
  fileCount: allFiles.length,
  sourceLockedActors: locks?.actors?.length ?? 0,
  networkCalls: 0,
  errors: [...new Set(errors)],
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (!report.ok) process.exitCode = 1;
