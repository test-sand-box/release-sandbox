// Builds one synthetic, non-authoritative ledger record and the attestation predicate that binds it to this run.
// Usage: node make-record.mjs <record-out> <predicate-out> [verdict]
// Everything here is made up: component names, versions and digests are generated, not real artifacts.
import fs from 'node:fs';
import { canonical, sha256, seal } from './canonical.mjs';

const [recordOut, predicateOut, verdict = 'pass'] = process.argv.slice(2);
const env = new Proxy(process.env, { get: (e, k) => e[k] ?? null }); // missing variables become null, never undefined
const component = (name, version) => ({ name, version, digest: sha256(`synthetic:${name}:${version}`) });

const record = seal({
  schema: 'ledger-record/v1',
  authoritative: false,
  evidenceClass: 'fixture',
  subject: { components: [component('alpha', '1.0.0'), component('beta', '2.3.1')] },
  verdict,
  producer: {
    repository: env.GITHUB_REPOSITORY,
    workflow: env.GITHUB_WORKFLOW_REF,
    ref: env.GITHUB_REF,
    sha: env.GITHUB_SHA,
    runId: env.GITHUB_RUN_ID,
    runAttempt: env.GITHUB_RUN_ATTEMPT,
    event: env.GITHUB_EVENT_NAME,
  },
});

const predicate = {
  recordDigest: record.recordDigest,
  manifestCommit: env.GITHUB_SHA,
  verifierSha: env.GITHUB_SHA,
  runId: env.GITHUB_RUN_ID,
  runAttempt: env.GITHUB_RUN_ATTEMPT,
};

fs.writeFileSync(recordOut, canonical(record) + '\n');
fs.writeFileSync(predicateOut, JSON.stringify(predicate) + '\n');
console.log(`record ${record.recordDigest} verdict=${verdict}`);
