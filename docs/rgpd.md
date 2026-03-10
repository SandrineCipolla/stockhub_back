# RGPD — Politique de protection des données personnelles

> StockHub Backend V2 — Dernière mise à jour : mars 2026

---

## 1. Données personnelles collectées

| Donnée                   | Source                     | Finalité                                             | Base légale                      |
| ------------------------ | -------------------------- | ---------------------------------------------------- | -------------------------------- |
| `email`                  | Azure AD B2C (inscription) | Identification de l'utilisateur, filtrage des stocks | Contrat (utilisation du service) |
| `userId` (OID Azure B2C) | Token JWT Bearer           | Rattachement des stocks à l'utilisateur              | Contrat                          |

**Données non collectées** : nom, prénom, adresse postale, numéro de téléphone, données de paiement.

---

## 2. Stockage et localisation

| Composant                      | Localisation         | Données stockées                                               |
| ------------------------------ | -------------------- | -------------------------------------------------------------- |
| **Base MySQL Azure** (prod)    | West Europe (France) | `users.email`, `users.id`, stocks et items                     |
| **Base MySQL Aiven** (staging) | Europe (EU)          | Données de test uniquement                                     |
| **Azure AD B2C**               | West Europe          | Credentials (email + mot de passe hashé) — géré par Microsoft  |
| **Application Insights**       | West Europe          | Logs applicatifs (sans PII — `loggingNoPII: false` à corriger) |

---

## 3. Durée de rétention

| Donnée                    | Durée                                 | Justification                                 |
| ------------------------- | ------------------------------------- | --------------------------------------------- |
| Compte utilisateur        | Jusqu'à suppression par l'utilisateur | Droit à l'effacement RGPD                     |
| Stocks et items           | Durée de vie du compte                | Suppression en cascade à la clôture du compte |
| Logs Application Insights | 90 jours (défaut Azure)               | Monitoring et débogage                        |
| Tokens JWT                | 1 heure (expiration Azure B2C)        | Sécurité — non stockés côté serveur           |

---

## 4. Droits des utilisateurs

### Droit d'accès (Art. 15 RGPD)

L'utilisateur peut consulter toutes ses données via les endpoints API :

- `GET /api/v2/stocks` → liste de ses stocks
- `GET /api/v2/stocks/:stockId/items` → items de chaque stock

### Droit de rectification (Art. 16 RGPD)

- Stocks et items : `PATCH /api/v2/stocks/:stockId`
- Email : via le portail Azure AD B2C

### Droit à l'effacement (Art. 17 RGPD)

- Suppression d'un stock et de ses items : `DELETE /api/v2/stocks/:stockId` (cascade)
- Suppression complète du compte : procédure manuelle via Azure AD B2C + suppression SQL de la table `users`

> ⚠️ **Procédure de suppression complète du compte** :
>
> 1. Supprimer l'utilisateur dans le portail Azure AD B2C
> 2. Exécuter : `DELETE FROM users WHERE email = 'user@example.com'` (la cascade supprime stocks et items)

### Droit à la portabilité (Art. 20 RGPD)

Non implémenté — à prévoir dans une version future (export JSON des stocks).

---

## 5. Sécurité des données

- **Authentification** : Azure AD B2C — mots de passe non stockés côté application
- **Autorisation** : Chaque utilisateur accède uniquement à ses propres stocks (`userId` vérifié via JWT)
- **Transit** : HTTPS uniquement (Azure App Service + Render.com)
- **Injection** : Requêtes Prisma paramétrées (pas de raw SQL interpolé)
- **Secrets** : Variables d'environnement uniquement, jamais dans le code (`.env` gitignored)

---

## 6. Sous-traitants (Art. 28 RGPD)

| Sous-traitant   | Rôle                                               | Localisation            | DPA                                                                                                                         |
| --------------- | -------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Microsoft Azure | Hébergement, base de données, authentification B2C | UE (West Europe)        | [DPA Microsoft](https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA) |
| Aiven           | Base de données staging                            | UE                      | [DPA Aiven](https://aiven.io/legal/dpa)                                                                                     |
| Render.com      | Hébergement staging                                | US (transfers encadrés) | [DPA Render](https://render.com/privacy)                                                                                    |

---

## 7. Points d'amélioration identifiés

| Priorité     | Action                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------ |
| 🟡 Important | Passer `loggingNoPII: true` dans `authConfig.ts` pour éviter que passport-azure-ad logue des PII |
| 🟡 Important | Implémenter un endpoint d'export des données (portabilité Art. 20)                               |
| 🟢 Bonus     | Ajouter une politique de rétention automatisée sur Application Insights (TTL 30 jours)           |
