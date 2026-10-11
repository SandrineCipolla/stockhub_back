// Lance `npm audit` et applique la règle de scripts/audit-policy.mjs (#324).
// Usage : node scripts/audit-check.mjs
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { evaluateAudit } from './audit-policy.mjs';

const allowlist = JSON.parse(
  readFileSync(new URL('./audit-allowlist.json', import.meta.url), 'utf8')
);

// npm audit sort avec un code non nul dès qu'il trouve une faille : seul son JSON compte.
const run = spawnSync('npm', ['audit', '--json'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  shell: process.platform === 'win32',
});

let audit;
try {
  audit = JSON.parse(run.stdout);
} catch {
  console.error('Sortie de npm audit illisible. Le contrôle échoue plutôt que de laisser passer.');
  console.error(run.stderr || run.stdout);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const result = evaluateAudit(audit, allowlist, today);
const describe = a =>
  `${a.id} (${a.severity}) ${[...a.packages].join(', ')} : ${a.title}\n    ${a.url}`;

for (const { advisory, entry } of result.tolerated) {
  console.log(`Tolérée jusqu'au ${entry.reviewBy} (${entry.issue}) : ${describe(advisory)}`);
}
for (const entry of result.unused) {
  console.log(`Exception à retirer, l'avis n'apparaît plus : ${entry.id} (${entry.package})`);
}
for (const problem of result.problems) console.error(problem);
for (const { advisory, entry } of result.expired) {
  console.error(
    `Exception expirée le ${entry.reviewBy}, à réexaminer (${entry.issue}) : ${describe(advisory)}`
  );
}
for (const advisory of result.blocking) console.error(`Faille bloquante : ${describe(advisory)}`);

if (!result.ok) {
  console.error('\nContrôle de sécurité en échec.');
  process.exit(1);
}
console.log('\nAucune faille high ou critical hors exceptions documentées.');
