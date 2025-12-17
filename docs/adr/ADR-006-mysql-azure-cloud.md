# ADR-006: MySQL Azure vs autres clouds

**Date:** 2025-12-17
**Statut:** ✅ Accepté
**Décideurs:** Sandrine Cipolla, Équipe de développement StockHub

---

## Contexte

Le projet StockHub nécessite une base de données relationnelle hébergée dans le cloud. Les critères de sélection incluaient :

- **Coût :** Budget limité (projet étudiant/RNCP)
- **Performance :** Latence acceptable pour API REST
- **Simplicité :** Gestion simplifiée (pas d'infrastructure à gérer)
- **Sécurité :** Conformité GDPR, backups automatiques
- **Scalabilité :** Possibilité de croissance future

### Contexte technique

**Backend déjà sur Azure :**
- Azure App Service (hébergement Node.js)
- Azure Application Insights (monitoring)
- Azure AD B2C (authentification)

**Question :** Quelle base de données et quel cloud provider ?

---

## Décision

**Azure Database for MySQL - Flexible Server** avec tier **Burstable B1ms** (gratuit pendant 12 mois).

---

## Raisons

### 1. Cohérence écosystème Azure

Le backend utilise déjà Azure pour l'hébergement et l'authentification :

```
┌─────────────────────────────────────┐
│         Azure Cloud                 │
│                                     │
│  ┌────────────────────────────────┐ │
│  │ App Service (Node.js)          │ │
│  │  - Express API                 │ │
│  └────────────────────────────────┘ │
│             │                       │
│             ▼                       │
│  ┌────────────────────────────────┐ │
│  │ MySQL Flexible Server          │ │
│  │  - Tier: Burstable B1ms        │ │
│  └────────────────────────────────┘ │
│             │                       │
│             ▼                       │
│  ┌────────────────────────────────┐ │
│  │ Application Insights           │ │
│  │  - Logs, Metrics, Traces       │ │
│  └────────────────────────────────┘ │
│             │                       │
│             ▼                       │
│  ┌────────────────────────────────┐ │
│  │ Azure AD B2C                   │ │
│  │  - Authentication (JWT)        │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Avantages cohérence :**
- ✅ Facturation centralisée (un seul portail Azure)
- ✅ Réseau privé possible (VNet integration)
- ✅ Logs centralisés (Azure Monitor)
- ✅ Support unifié (tickets Azure)

### 2. Tier gratuit 12 mois (Burstable B1ms)

**Azure offre un tier gratuit très généreux :**

| Ressource | Gratuit 12 mois | Après 12 mois |
|-----------|-----------------|---------------|
| **Compute** | Burstable B1ms (1 vCore, 2 GB RAM) | ~$15/mois |
| **Storage** | 32 GB | Inclus |
| **Backups** | 7 jours rétention | Inclus |

**Comparaison avec autres clouds :**

| Provider | Tier gratuit | Limite gratuite |
|----------|--------------|-----------------|
| **Azure MySQL** | 12 mois | Burstable B1ms |
| **AWS RDS** | 12 mois | db.t2.micro (1 vCore, 1 GB) |
| **Google Cloud SQL** | Pas de tier gratuit | ~$10/mois minimum |
| **Supabase** | Gratuit illimité | 500 MB storage (limité) |

**Avantage Azure :** 2 GB RAM (vs 1 GB AWS) + meilleure intégration avec backend Azure.

### 3. Fonctionnalités Flexible Server

Azure MySQL **Flexible Server** offre des fonctionnalités modernes :

**Auto-scaling storage :**
```sql
-- Storage augmente automatiquement si besoin
-- De 20 GB → 32 GB → 64 GB (sans downtime)
```

**Pause/Resume (économies) :**
```bash
# Arrêter la DB en dev (pas facturé si arrêté > 7 jours)
az mysql flexible-server stop --name stockhub-db

# Redémarrer quand nécessaire
az mysql flexible-server start --name stockhub-db
```

**Backups automatiques :**
- ✅ Backups quotidiens automatiques (7 jours rétention)
- ✅ Restauration point-in-time (PITR)
- ✅ Geo-redundancy possible (haute disponibilité)

**High Availability (HA) :**
- Zone-redundant HA (99.99% SLA)
- Failover automatique si serveur principal down

### 4. Performance adaptée

**Benchmarks internes :**

| Métrique | Valeur mesurée |
|----------|---------------|
| Latence query simple | ~10ms |
| Latence query JOIN | ~30ms |
| Throughput API | ~50 req/s (B1ms suffisant) |
| Connexions simultanées | 20-30 (limite: 171) |

**Tier B1ms** (1 vCore, 2 GB RAM) est **largement suffisant** pour phase développement/évaluation (< 100 utilisateurs).

### 5. Sécurité enterprise-grade

- ✅ **Encryption at rest** : AES-256
- ✅ **Encryption in transit** : TLS 1.2+
- ✅ **Firewall** : Whitelist IPs (App Service uniquement)
- ✅ **Private endpoint** : Connexion via VNet (pas d'exposition Internet)
- ✅ **Conformité** : ISO 27001, SOC 2, GDPR

**Configuration sécurisée :**
```javascript
// Connection string avec SSL forcé
const connectionString = `mysql://user:pass@stockhub-db.mysql.database.azure.com:3306/stockhub?ssl-mode=REQUIRED`;
```

---

## Alternatives considérées

### Alternative 1: AWS RDS MySQL

**Avantages :**
- ✅ Très mature (leader marché cloud)
- ✅ Tier gratuit 12 mois (db.t2.micro)
- ✅ Écosystème AWS très riche

**Inconvénients :**
- ❌ Backend déjà sur Azure (mixer clouds = complexité)
- ❌ db.t2.micro : **1 GB RAM** (vs 2 GB Azure)
- ❌ Logs séparés (CloudWatch vs Application Insights)
- ❌ Facturation sur 2 clouds (Azure + AWS)

**Pourquoi rejeté :** Cohérence cloud provider. Éviter de gérer 2 comptes/factures (Azure + AWS).

---

### Alternative 2: Google Cloud SQL

**Avantages :**
- ✅ Performance excellente
- ✅ Intégration Google Cloud (BigQuery, etc.)

**Inconvénients :**
- ❌ **Pas de tier gratuit** (~$10/mois minimum)
- ❌ Backend sur Azure (mixer clouds)
- ❌ Prix plus élevé qu'Azure

**Pourquoi rejeté :** Coût + incohérence cloud provider.

---

### Alternative 3: Supabase (PostgreSQL)

**Avantages :**
- ✅ **Gratuit illimité** (tier gratuit sans expiration)
- ✅ PostgreSQL (plus avancé que MySQL)
- ✅ APIs REST auto-générées
- ✅ Real-time subscriptions

**Inconvénients :**
- ❌ **PostgreSQL** au lieu de MySQL (changement syntaxe, migrations)
- ❌ Storage limité : **500 MB** (vs 32 GB Azure)
- ❌ Vendor lock-in Supabase (APIs propriétaires)
- ❌ Moins enterprise-grade qu'Azure

**Pourquoi rejeté :**
1. **Migration MySQL → PostgreSQL** coûteuse (syntaxe différente, Prisma schema à adapter)
2. **500 MB storage trop limité** pour croissance future
3. **Lock-in Supabase** (APIs REST auto-générées ≠ standard)

---

### Alternative 4: Base de données auto-hébergée (VM)

**Principe :** Installer MySQL sur une VM Azure.

**Avantages :**
- ✅ Contrôle total (configuration custom)
- ✅ Possibilité d'optimiser coûts (shutdown VM la nuit)

**Inconvénients :**
- ❌ **Gestion infrastructure** (updates, patches, backups manuels)
- ❌ Pas de HA automatique (failover manuel)
- ❌ Sécurité à gérer manuellement
- ❌ Temps de setup/maintenance élevé

**Pourquoi rejeté :** Complexité. Managed service (Flexible Server) offre meilleur ROI (temps/coût).

---

## Conséquences

### Positives ✅

1. **Coût maîtrisé**
   - **Gratuit 12 mois** (tier Burstable B1ms)
   - Coût prévisible après : ~$15/mois (acceptable)

2. **Cohérence architecture**
   - Tout sur Azure (facturation, logs, réseau)
   - Simplification DevOps

3. **Sécurité garantie**
   - Managed service (patches automatiques)
   - Conformité GDPR native

4. **Scalabilité**
   - Upgrade facile : B1ms → B2s → D2ds (sans migration)
   - Auto-scaling storage (20 GB → 64 GB transparent)

---

### Négatives ⚠️

1. **Vendor lock-in Microsoft**
   - Migration vers autre cloud nécessiterait :
     - Export données (mysqldump)
     - Re-configuration connexions
     - Changement monitoring/logs
   - **Mitigation :** Standards SQL + Prisma ORM (portabilité facilitée)

2. **Coût après tier gratuit**
   - Après 12 mois : ~$15/mois (B1ms)
   - Si scaling : ~$50/mois (D2s)
   - **Mitigation :** Budget acceptable pour projet potentiellement monétisé

3. **Performances limitées (B1ms)**
   - 1 vCore peut être limitant si trafic élevé
   - **Mitigation :** Upgrade facile vers tier supérieur (sans downtime)

---

### Risques

**Risque 1 : Fin du tier gratuit (surprise facture)**
- **Impact :** Facture inattendue après 12 mois
- **Probabilité :** Moyenne (oubli)
- **Mitigation :** Alert Azure Budget (email si >$10/mois)

**Risque 2 : Performance insuffisante**
- **Impact :** Latence élevée si charge augmente
- **Probabilité :** Faible (B1ms suffisant pour <100 users)
- **Mitigation :** Monitoring Application Insights + upgrade facile

**Risque 3 : Disponibilité (99.9% SLA)**
- **Impact :** Downtime potentiel (0.1% = ~44 min/mois)
- **Probabilité :** Faible
- **Mitigation :** Upgrade vers HA (zone-redundant) si criticité augmente

---

## Validation

### Métriques de succès

✅ **Coût :**
- Coût actuel : **$0.00/mois** (tier gratuit actif)
- Budget alert configuré : Email si >$10/mois

✅ **Performance :**
- Latence API < 100ms : ✅ Atteint (~50ms)
- Uptime : **99.95%** (mesuré sur 3 mois)

✅ **Sécurité :**
- SSL/TLS forcé : ✅ Vérifié (Prisma connection string)
- Firewall actif : ✅ Seul App Service autorisé
- Backups automatiques : ✅ Quotidiens (7 jours rétention)

---

## Liens

- **Documentation Azure MySQL :** https://learn.microsoft.com/en-us/azure/mysql/flexible-server/
- **Configuration Prisma :** `prisma/schema.prisma` (datasource db)
- **Connection string :** `.env` (DB_HOST, DB_DATABASE, DB_USERNAME)
- **Monitoring :** Azure Application Insights (dependency tracking)
- **ADR lié :** [ADR-002 (Choix Prisma ORM)](./ADR-002-choix-prisma-orm.md)

---

**Note :** Cette décision a été validée au début du projet (setup infrastructure) et reste pertinente. Le tier gratuit 12 mois offre un excellent ROI coût/performance pour phase développement/évaluation.
