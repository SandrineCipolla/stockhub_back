# Session du 26 Février 2026 — Configuration Azure App Service (CORS + diagnostic QuotaExceeded)

> **Travail frontend associé** : voir [session front 2026-02-25-merge-pr65-logout-fix-deploy.md](https://github.com/SandrineCipolla/stockHub_V2_front/blob/main/documentation/sessions/2026-02-25-merge-pr65-logout-fix-deploy.md)

---

## Objectif

Déboguer les erreurs CORS après merge de la PR frontend #65 et mise à jour des variables Vercel.

---

## Réalisations

- ✅ **ALLOWED_ORIGINS mis à jour via Azure CLI**

  ```bash
  az webapp config appsettings set \
    --name stockhub-back \
    --resource-group StockHubApp-resources \
    --settings ALLOWED_ORIGINS="https://brave-field-03611eb03.5.azurestaticapps.net,https://stock-hub-v2-front.vercel.app,https://localhost:5173"
  ```

  - Ajout de `https://localhost:5173` (HTTPS)
  - `VERCEL_PREVIEW_CORS=true` déjà en place ✅

- ✅ **CLAUDE.md mis à jour**
  - Nouvelle URL backend : `stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net`
  - Ancienne URL `stockhub-back.azurewebsites.net` ne résout plus (changement Azure du format de nommage)

- ✅ **Issues créées**
  - [#85](https://github.com/SandrineCipolla/stockhub_back/issues/85) — Staging avec BDD de test isolée

---

## Problèmes en Suspens

| Problème                                                | Priorité | Action requise                                                                                                                      |
| ------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **QuotaExceeded** — Plan F1 (60 min CPU/jour dépassées) | Haute    | Upgrader vers B1 : `az appservice plan update --name ASP-StockHubAppresources-8934 --resource-group StockHubApp-resources --sku B1` |
| `http://localhost:5173` retiré de ALLOWED_ORIGINS       | Basse    | Re-ajouter si dev local contre backend Azure nécessaire                                                                             |

---

## Prochaines Étapes

- [ ] Upgrade App Service Plan F1 → B1 avant les démos RNCP7
- [ ] Mettre en place staging environment (issue #85)

---

**Date** : 26/02/2026
**Développeuse** : Sandrine Cipolla
