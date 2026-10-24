import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function inspectHtml(fileName) {
  const html = readFileSync(new URL(`../${fileName}`, import.meta.url), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

  assert.deepEqual(duplicateIds, [], `${fileName} contains duplicate IDs`);

  for (const match of html.matchAll(/<label\b[^>]*\bfor="([^"]+)"[^>]*>/g)) {
    assert(ids.includes(match[1]), `${fileName} label points to missing #${match[1]}`);
  }

  for (const match of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(
      () => new Function(match[1]),
      `${fileName} contains invalid inline JavaScript`,
    );
  }

  return html;
}

const indexHtml = inspectHtml('index.html');
const supervisorHtml = inspectHtml('supervisor.html');
const appJs = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

assert.match(indexHtml, /id="themeToggleBtn"[^>]*aria-pressed="false"/s);
assert.match(indexHtml, /id="liffUserInfo"[^>]*aria-live="polite"/s);
assert.match(indexHtml, /id="formStatus"[^>]*role="status"/s);
assert.match(supervisorHtml, /class="supervisor-card"/);
assert.match(supervisorHtml, /id="supervisorPreview"[^>]*role="region"/s);
assert.match(appJs, /const REQUEST_TIMEOUT_MS = 30000/);
assert.match(appJs, /new AbortController\(\)/);
assert.match(appJs, /let imageProcessingGeneration = 0/);
assert.match(appJs, /MAX_IMAGE_FILE_SIZE_BYTES/);
assert.match(appJs, /MAX_TOTAL_IMAGE_SIZE_BYTES/);
assert.doesNotMatch(
  appJs,
  /DOMContentLoaded',\s*async\s+function/,
  'Core form setup must not wait for LIFF initialization',
);
assert.doesNotMatch(appJs, /console\.log\(\s*'SEND:'/s);
assert.doesNotMatch(appJs, /console\.log\(\s*'GAS RESPONSE:'/s);
assert.match(supervisorHtml, /async function fetchJsonWithTimeout/);
assert.match(supervisorHtml, /MAX_SUPERVISOR_IMAGE_COUNT = 4/);
assert.match(supervisorHtml, /MAX_IMAGE_FILE_SIZE_BYTES/);
assert.doesNotMatch(supervisorHtml, /SUPERVISOR SEARCH RESULT/);

console.log('Static site checks passed.');
