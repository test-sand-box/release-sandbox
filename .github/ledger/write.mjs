// Create-only write of a record to the ledger branch through the Contents API. Synthetic CI sandbox test.
// Usage: GH_TOKEN=<token> node write.mjs <record-file> [path-in-repo]
// The path defaults to records/<recordDigest hex>.json. A PUT without "sha" never overwrites: if the path
// exists, GitHub refuses it, and this exits non-zero.
import fs from 'node:fs';

const [file, explicitPath] = process.argv.slice(2);
const repo = process.env.LEDGER_REPO || process.env.GITHUB_REPOSITORY;
const branch = process.env.LEDGER_BRANCH || 'ledger';
const bytes = fs.readFileSync(file, 'utf8');
const record = JSON.parse(bytes);
const path = explicitPath || `records/${record.recordDigest.replace(/^sha256:/, '')}.json`;

const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
  method: 'PUT',
  headers: { Authorization: `token ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  body: JSON.stringify({ message: `ledger record ${record.recordDigest} (synthetic)`, branch, content: Buffer.from(bytes).toString('base64') }),
});
const body = await res.json().catch(() => ({}));
console.log(JSON.stringify({ path, status: res.status, created: res.status === 201, commit: body.commit?.sha ?? null, message: body.message ?? null }));
process.exit(res.status === 201 ? 0 : 1);
