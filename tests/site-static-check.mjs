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

assert.match(indexHtml, /id="themeToggleBtn"[^>]*aria-pressed="false"/s);
assert.match(indexHtml, /id="liffUserInfo"[^>]*aria-live="polite"/s);
assert.match(indexHtml, /id="formStatus"[^>]*role="status"/s);
assert.match(supervisorHtml, /class="supervisor-card"/);
assert.match(supervisorHtml, /id="supervisorPreview"[^>]*role="region"/s);

console.log('Static site checks passed.');
