// Canonical JSON (sorted keys, no whitespace) and its sha256 digest. Synthetic CI sandbox test.
import { createHash } from 'node:crypto';

export function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}

export const sha256 = text => 'sha256:' + createHash('sha256').update(text).digest('hex');
export const digest = value => sha256(canonical(value));

// Adds recordDigest over every other field.
export function seal(record) {
  const { recordDigest, ...body } = record;
  return { ...body, recordDigest: digest(body) };
}
