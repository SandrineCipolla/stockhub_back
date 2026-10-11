// Règle du contrôle de sécurité des dépendances (#324).
// Les failles high et critical bloquent, sauf celles de scripts/audit-allowlist.json.
// Une exception porte une raison, une issue de suivi et une date de réexamen : passé ce jour, elle bloque de nouveau.

const SEVERITY_RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

const advisoryId = url => (typeof url === 'string' ? url.split('/').pop() : undefined);

// Chaque faille apparaît comme objet dans `via` du paquet qui la porte. Les chaînes de `via`
// désignent seulement un paquet qui dépend d'un paquet vulnérable : elles n'ajoutent aucune faille.
export const collectAdvisories = audit => {
  const found = new Map();
  for (const vulnerability of Object.values(audit.vulnerabilities ?? {})) {
    for (const via of vulnerability.via ?? []) {
      if (typeof via !== 'object') continue;
      const id = advisoryId(via.url);
      if (!id) continue;
      const known = found.get(id);
      if (known) {
        known.packages.add(via.name);
      } else {
        found.set(id, {
          id,
          severity: via.severity,
          title: via.title,
          url: via.url,
          packages: new Set([via.name]),
        });
      }
    }
  }
  return [...found.values()];
};

export const validateAllowlist = allowlist => {
  const problems = [];
  for (const entry of allowlist) {
    for (const field of ['id', 'package', 'reason', 'issue', 'reviewBy']) {
      if (!entry[field])
        problems.push(`Exception ${entry.id ?? '(sans id)'} : champ "${field}" manquant`);
    }
    if (entry.reviewBy && !/^\d{4}-\d{2}-\d{2}$/.test(entry.reviewBy)) {
      problems.push(`Exception ${entry.id} : "reviewBy" doit être une date AAAA-MM-JJ`);
    }
  }
  return problems;
};

export const evaluateAudit = (audit, allowlist, today, threshold = 'high') => {
  if (audit.error) {
    return {
      ok: false,
      blocking: [],
      expired: [],
      tolerated: [],
      unused: [],
      problems: [
        `npm audit n'a pas pu s'exécuter : ${audit.error.summary ?? audit.error.code ?? 'erreur inconnue'}`,
      ],
    };
  }

  const problems = validateAllowlist(allowlist);
  const minimum = SEVERITY_RANK[threshold];
  const advisories = collectAdvisories(audit).filter(
    a => (SEVERITY_RANK[a.severity] ?? 0) >= minimum
  );
  const allowed = new Map(allowlist.map(entry => [entry.id, entry]));

  const blocking = [];
  const expired = [];
  const tolerated = [];
  for (const advisory of advisories) {
    const entry = allowed.get(advisory.id);
    if (!entry) blocking.push(advisory);
    else if (entry.reviewBy < today) expired.push({ advisory, entry });
    else tolerated.push({ advisory, entry });
  }

  const present = new Set(advisories.map(a => a.id));
  const unused = allowlist.filter(entry => !present.has(entry.id));

  return {
    ok: problems.length === 0 && blocking.length === 0 && expired.length === 0,
    blocking,
    expired,
    tolerated,
    unused,
    problems,
  };
};
