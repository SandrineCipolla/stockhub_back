import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectAdvisories, evaluateAudit, validateAllowlist } from './audit-policy.mjs';

const advisory = (id, severity, name = 'pkg') => ({
  source: 1,
  name,
  title: `Faille ${id}`,
  url: `https://github.com/advisories/${id}`,
  severity,
});

// Un paquet qui dépend d'un paquet vulnérable ne porte aucune faille propre : via contient son nom.
const audit = {
  vulnerabilities: {
    'node-forge': { via: [advisory('GHSA-aaaa-aaaa-aaaa', 'high', 'node-forge')] },
    'node-jose': { via: ['node-forge'] },
    'passport-azure-ad': { via: ['node-jose'] },
    moment: { via: [advisory('GHSA-bbbb-bbbb-bbbb', 'moderate', 'moment')] },
  },
};

const entry = (id, reviewBy = '2026-12-11') => ({
  id,
  package: 'node-forge',
  reason: 'Pas de correctif publié',
  issue: '#324',
  reviewBy,
});

test('collectAdvisories ignore les chaînes de via et déduplique', () => {
  const doubled = {
    vulnerabilities: {
      a: { via: [advisory('GHSA-aaaa-aaaa-aaaa', 'high', 'a')] },
      b: { via: [advisory('GHSA-aaaa-aaaa-aaaa', 'high', 'b'), 'a'] },
    },
  };
  const found = collectAdvisories(doubled);
  assert.equal(found.length, 1);
  assert.deepEqual([...found[0].packages].sort(), ['a', 'b']);
});

test('une faille high hors liste bloque', () => {
  const result = evaluateAudit(audit, [], '2026-10-11');
  assert.equal(result.ok, false);
  assert.deepEqual(
    result.blocking.map(a => a.id),
    ['GHSA-aaaa-aaaa-aaaa']
  );
});

test('une faille moderate ne bloque pas', () => {
  const onlyModerate = { vulnerabilities: { moment: audit.vulnerabilities.moment } };
  assert.equal(evaluateAudit(onlyModerate, [], '2026-10-11').ok, true);
});

test('une exception valide tolère la faille', () => {
  const result = evaluateAudit(audit, [entry('GHSA-aaaa-aaaa-aaaa')], '2026-10-11');
  assert.equal(result.ok, true);
  assert.equal(result.tolerated.length, 1);
});

test('une exception dont la date est dépassée bloque de nouveau', () => {
  const result = evaluateAudit(audit, [entry('GHSA-aaaa-aaaa-aaaa', '2026-10-10')], '2026-10-11');
  assert.equal(result.ok, false);
  assert.equal(result.expired.length, 1);
});

test('le jour de réexamen lui-même est encore toléré', () => {
  const result = evaluateAudit(audit, [entry('GHSA-aaaa-aaaa-aaaa', '2026-10-11')], '2026-10-11');
  assert.equal(result.ok, true);
});

test('une nouvelle faille high bloque même quand une autre est tolérée', () => {
  const withNew = {
    vulnerabilities: {
      ...audit.vulnerabilities,
      other: { via: [advisory('GHSA-cccc-cccc-cccc', 'critical', 'other')] },
    },
  };
  const result = evaluateAudit(withNew, [entry('GHSA-aaaa-aaaa-aaaa')], '2026-10-11');
  assert.equal(result.ok, false);
  assert.deepEqual(
    result.blocking.map(a => a.id),
    ['GHSA-cccc-cccc-cccc']
  );
});

test('une exception devenue inutile est signalée sans bloquer', () => {
  const result = evaluateAudit(
    { vulnerabilities: {} },
    [entry('GHSA-aaaa-aaaa-aaaa')],
    '2026-10-11'
  );
  assert.equal(result.ok, true);
  assert.equal(result.unused.length, 1);
});

test('une erreur de npm audit fait échouer le contrôle', () => {
  const result = evaluateAudit({ error: { summary: 'réseau indisponible' } }, [], '2026-10-11');
  assert.equal(result.ok, false);
  assert.match(result.problems[0], /réseau indisponible/);
});

test('une exception incomplète est refusée', () => {
  const problems = validateAllowlist([{ id: 'GHSA-aaaa-aaaa-aaaa', package: 'x' }]);
  assert.ok(problems.some(p => p.includes('"reason"')));
  assert.ok(problems.some(p => p.includes('"reviewBy"')));
});
