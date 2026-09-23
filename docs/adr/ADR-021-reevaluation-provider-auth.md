---
author: Sandrine Cipolla
status: PROPOSÉ
related: ./ADR-003-azure-ad-b2c-authentication.md
---

# ADR-021 - Réévaluation du provider d'authentification : Azure AD B2C vs Auth0 vs Clerk

## Contexte

ADR-003 a choisi Azure AD B2C en décembre 2025. Depuis, Microsoft a annoncé
la fin de vie du produit : fermé aux nouveaux clients depuis mai 2025,
palier P2 retiré le 15 mars 2026 (bascule automatique vers P1), migration
vers Microsoft Entra External ID recommandée par l'éditeur lui-même. Le
support P1 reste garanti au moins jusqu'à mai 2030, donc pas d'urgence
immédiate, mais un signal de dépréciation direct plutôt qu'une supposition.

Un bug d'expiration de token (PR #191 côté `stockHub_V2_front`, "fix auth
token expiry") était par ailleurs en cours de correction au moment de
l'analyse, signe que la couche auth méritait un audit plus large que ce
seul fix ponctuel.

Cette réévaluation a été menée comme benchmark technique dans le cadre du
TD "Assurer une veille technologique performante" (RNCP7 EADL, compétence
C1.2), avec une pondération pensée pour le contexte réel de StockHub :
projet perso/familial, budget contraint, développeuse solo, produit déjà
fonctionnel sur Azure AD B2C. Le coût de migration compte donc autant que
la solution elle-même.

## Décision

**Recommandation : Clerk**, à titre principal. La migration n'est pas
engagée à ce jour : cette ADR documente l'analyse et sert de base si la
bascule est décidée, elle n'annonce pas un chantier planifié.

**Auth0** reste une alternative crédible si un besoin de compliance
renforcée (FGA, certifications) émerge, par exemple si StockHub s'ouvrait
à un usage pro/B2B.

### Grille d'évaluation

| Critère (poids)                           | Azure AD B2C (actuel)                                                    | Auth0                                                              | Clerk                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Maturité / pérennité (25%)                | 2/5, produit en fin de vie annoncée, migration recommandée par Microsoft | 5/5, leader IAM historique (Okta), très mature                     | 3/5, plus récent, forte adoption React/Next.js, moins éprouvé côté enterprise        |
| Coût (25%)                                | 4/5, déjà en place, pas de coût de changement                            | 2/5, gratuit jusqu'à 25k MAU puis 0,07$/MAU, plans dès 35$/mois    | 5/5, gratuit jusqu'à 10k MAU puis 0,02$/MAU                                          |
| Compatibilité / effort de migration (20%) | 5/5, déjà intégré (JWT Bearer back, MSAL front)                          | 3/5, réécriture middleware back + front                            | 3/5, réécriture nécessaire aussi, SDK reconnu pour sa DX d'intégration React         |
| Sécurité (15%)                            | 4/5, solution enterprise Microsoft, robuste par héritage                 | 5/5, forte compliance (SOC2, ISO), autorisation fine (FGA)         | 4/5, robuste pour un usage standard, moins poussé qu'Auth0 sur la compliance avancée |
| Communauté & documentation (10%)          | 3/5, doc Microsoft complète mais désormais orientée migration            | 5/5, large communauté, SDKs multiples, doc de référence du secteur | 4/5, DX très appréciée, SDKs Node/Python/Go/Ruby                                     |
| Courbe d'apprentissage (5%)               | 5/5, déjà maîtrisé                                                       | 3/5, bien documenté mais configuration IAM parfois complexe        | 5/5, "time-to-first-login" rapide, pensé pour React                                  |
| **Score pondéré**                         | **3.65**                                                                 | **3.75**                                                           | **3.85**                                                                             |

Azure AD B2C et Auth0 ont chacun un point fort net et une faiblesse
sévère. Clerk n'a pas de faiblesse critique : c'est cette absence de point
faible, plus que des scores exceptionnels, qui explique sa légère avance
(3.85 contre 3.75 et 3.65).

## Alternatives

### Alternative 1 : Auth0

Meilleur score sur maturité, sécurité et communauté (5/5 sur les trois),
mais coût le plus élevé à l'échelle (2/5) et vendor lock-in.

**Pourquoi non retenu à titre principal :** le budget contraint du projet
pèse plus que la compliance avancée, qui n'est pas requise pour un usage
familial.

### Alternative 2 : rester sur Azure AD B2C

Le plus économique et le plus compatible immédiatement (déjà intégré),
mais plombé par sa pérennité (2/5).

**Pourquoi non retenu :** le signal de dépréciation Microsoft est direct.
Attendre revient à laisser la décision devenir contrainte plutôt que
choisie.

## Conséquences

### Positives (si la migration est engagée un jour)

- Meilleur rapport coût/pérennité/DX pour un projet React comme StockHub
- SDK reconnu pour son "time-to-first-login" rapide

### Négatives

- Réécriture du middleware d'authentification back (Express, vérification
  JWT) et front (remplacement de MSAL par le SDK Clerk)
- Risque de régression sur le mapping des rôles existants
  (OWNER/EDITOR/VIEWER/VIEWER_CONTRIBUTOR), logique à recréer et tester
- Nouveau vendor lock-in (Clerk), à mettre en balance avec le lock-in
  actuel (Azure AD B2C, déjà en fin de vie)

### Risques

Fenêtre de risque limitée dans le temps : Azure AD B2C P1 reste supporté
jusqu'à au moins mai 2030, la migration n'est donc pas urgente. Le risque
principal est de la reporter indéfiniment jusqu'à ce qu'elle devienne
contrainte plutôt que choisie.

## Critères de vérification

Rouvrir cette décision, ou la transformer en ADR Accepté, si :

- Un vrai spike technique chiffré (temps de migration réel) est mené, ce
  qui manque aujourd'hui pour sécuriser la décision
- StockHub s'ouvre à un usage pro/B2B : le calcul coût Clerk vs Auth0
  change au-delà de quelques milliers de MAU, et Auth0 deviendrait
  probablement le choix par défaut pour sa compliance
- Azure AD B2C P1 reçoit un signal de fin de support plus rapproché que
  mai 2030

## Liens

- ADR liée : [ADR-003](./ADR-003-azure-ad-b2c-authentication.md), décision
  initiale Azure AD B2C
- Issue liée : PR #191 "fix auth token expiry" (`stockHub_V2_front`)
- Analyse menée dans le cadre du TD veille technologique RNCP7 (C1.2),
  incluant le détail radar et les questions de recul non reproduites ici

---

Les ADR sont immuables. Si cette décision change, créer une nouvelle ADR qui supplante celle-ci plutôt que de modifier celle-ci.
