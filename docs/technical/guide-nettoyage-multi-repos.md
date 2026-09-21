# 🧹 Guide & Checklist Standard de Nettoyage (Multi-Repos StockHub)

> **Objet** : Checklist de nettoyage éprouvée sur `stockhub_back`, à appliquer à l'identique sur `stockHub_V2_front` et `stockhub_design_system` pour garantir un niveau de qualité et de gouvernance 100% ISO.

---

## 📋 Checklist de Nettoyage en 5 Étapes

### 1. 🧼 Épuration des éléments volatiles & chiffres en dur

- [ ] **Suppression des notes et notations académiques** : Supprimer toute mention de notes (`18/20`, `20/20`, etc.) des textes, titres et noms de fichiers.
- [ ] **Suppression des versions de paquets figées dans la prose** : Remplacer les numéros de version statiques par des renvois dynamiques vers `package.json` ou des badges.
- [ ] **Suppression du jargon & métaphores** : Appliquer les règles du [guide-redaction.md](guide-redaction.md) (pas de qualificatifs dramatiques, tournures concrètes et factuelles).

---

### 2. 🏛️ Gouvernance & Alignement des ADRs

- [ ] **Numérotation locale par repository** : Chaque repo garde sa séquence propre (`ADR-001`, `ADR-002`...).
- [ ] **Table de correspondance sur le Wiki** : Mettre à jour la page Wiki `Architecture-Decision-Records.md` avec la table de parité croisée (Back / Front / DS).
- [ ] **Template allégé** : Utiliser le format épuré (Contexte, Décision avec justification intégrée, Alternatives, Conséquences, Liens).
- [ ] **Immuabilité des archives** : Marquer les anciens audits dans `docs/archive/audits/` comme historiques et ne plus les modifier.

---

### 3. 🗺️ Restructuration & Méta-Documentation ("Single Source of Truth")

- [ ] **Index Principal unique (`docs/INDEX.md`)** : Point d'entrée obligatoire répertoriant tous les sous-dossiers.
- [ ] **Tableau de bord courant (`ETAT_DU_PROJET.md`)** : Centraliser l'état courant et le point de reprise à la racine (un seul fichier mis à jour).
- [ ] **Zéro duplication** : Une information ou un exemple de code ne vit qu'à un seul endroit. Les autres documents y font référence par lien hypertexte.
- [ ] **Nettoyage de la racine** : Déplacer tous les fichiers markdown secondaires vers `docs/` ou `docs/archive/`.

---

### 4. 🧹 Hygiène du Code & Dépendances

- [ ] **Zéro warning ESLint en production** : S'assurer que `--max-warnings 0` passe sur le code applicatif.
- [ ] **Nettoyage npm audit** : Résoudre les vulnérabilités directes et isoler les failles transitives via le bloc `overrides` du `package.json`.
- [ ] **Nettoyage des branches Git** : Supprimer les branches locales et distantes mergées ou obsolètes.

---

### 5. 🧪 Traçabilité des Tests & Badges

- [ ] **Pyramide de tests explicite** : Documenter la répartition unitaires / intégration / E2E dans la fiche de stack du repo.
- [ ] **Badges à jour dans le README** : CI/CD, audit de sécurité, version et couverture Codecov.

---

## 🔄 Ordre d'application pour les autres repos

1. **Étape 1 : Front (`stockHub_V2_front`)**
   - Appliquer la checklist sur les ADRs et la doc du repo front.
   - Synchroniser le Wiki GitHub.
2. **Étape 2 : Design System (`stockhub_design_system`)**
   - Appliquer la checklist sur la documentation des composants Lit / Storybook.
