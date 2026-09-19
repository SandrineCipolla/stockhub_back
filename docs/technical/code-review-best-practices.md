# Best Practices — Code Reviews StockHub Backend

Compilation des meilleures pratiques identifiées lors des code reviews avec Ch\*\*\* (mentor technique).

---

## 1. Repository Pattern — Encapsuler l'accès aux données

**Principe** : Isoler les requêtes base de données dans des repositories dédiés.

❌ **À éviter** :

```typescript
// Dans un middleware
const user = await prisma.users.findUnique({ where: { EMAIL: email } });
```

✅ **Recommandé** :

```typescript
// AuthorizationRepository.ts
export class AuthorizationRepository {
  constructor(private prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.users.findUnique({ where: { EMAIL: email } });
  }
}

// Dans le middleware
const user = await authRepository.findUserByEmail(email);
```

---

## 2. Typed Errors — Éviter les Error génériques

❌ **À éviter** :

```typescript
throw new Error('Family name is required');
```

✅ **Recommandé** :

```typescript
// errors/FamilyErrors.ts
export class FamilyNameRequiredError extends Error {
  constructor() {
    super('Family name is required');
    this.name = 'FamilyNameRequiredError';
  }
}

throw new FamilyNameRequiredError();
```

---

## 3. Constants — Pas de valeurs magiques

❌ **À éviter** :

```typescript
if (permission === 'read') {
  /* ... */
}
```

✅ **Recommandé** :

```typescript
export const PERMISSIONS = {
  READ: 'read' as const,
  WRITE: 'write' as const,
  SUGGEST: 'suggest' as const,
} as const;

if (permission === PERMISSIONS.READ) {
  /* ... */
}
```

---

## 4. Logic in Value Objects — Logique métier dans les VOs

❌ **À éviter** : switch/case dans un middleware  
✅ **Recommandé** : méthode `hasRequiredPermission()` dans `StockRole.ts`

---

## 5. Factory Methods — Éviter la duplication de création d'objets

```typescript
// Dans Family.ts
private static createAdminMember(userId: number): FamilyMemberData {
  return { id: 0, userId, role: FamilyRoleEnum.ADMIN, joinedAt: new Date() };
}

const family = new Family({ name, members: [Family.createAdminMember(creatorId)] });
```

---

## 6. Reuse Existing Methods — Ne pas réimplémenter

```typescript
// ✅ Réutilise getMember() au lieu de refaire un findIndex
removeMember(userId: number): void {
  const member = this.getMember(userId);
  if (!member) throw new MemberNotFoundError(userId);
  this.members.splice(this.members.indexOf(member), 1);
}
```

---

## 7. Extract Complex Logic — Méthodes privées bien nommées

```typescript
private hasAdmin(): boolean {
  return this.members.some(m => m.role === FamilyRoleEnum.ADMIN);
}

removeMember(userId: number): void {
  if (!this.hasAdmin()) throw new NoAdminError();
}
```

---

## 8. Null Object Pattern — Éviter undefined quand possible

```typescript
export const NULL_MEMBER: FamilyMemberData = { id: -1, userId: -1, ... };

getMember(userId: number): FamilyMemberData {
  return this.members.find(m => m.userId === userId) ?? NULL_MEMBER;
}
```

> ⚠️ Utiliser avec précaution — parfois `undefined` est plus explicite.

---

## 9. Methods on Business Objects — Encapsuler les comportements

```typescript
export class FamilyMember {
  isAdmin(): boolean {
    return this.data.role === FamilyRoleEnum.ADMIN;
  }
  canManageMembers(): boolean {
    return this.isAdmin();
  }
}

if (member.isAdmin()) {
  /* ... */
}
```

---

## 10. File Organization — Enums dans des fichiers séparés

```
StockRoleEnum.ts   ← l'enum seul
StockRole.ts       ← la classe, importe l'enum
```

---

## 11. Split Large Test Files — < 500 lignes par fichier

```
Family.create.test.ts
Family.addMember.test.ts
Family.removeMember.test.ts
```

---

## 12. Input Validation — Fail-fast avec messages clairs

```typescript
if (!Object.values(StockRoleEnum).includes(role as StockRoleEnum)) {
  throw new InvalidStockRoleError(`Invalid role: ${role}`);
}
```

---

## Checklist avant chaque PR

- [ ] Repository Pattern : accès DB dans des repositories
- [ ] Typed Errors : pas de `throw new Error()` générique
- [ ] Constants : pas de strings/numbers hardcodés
- [ ] Logic in VOs : logique métier dans les Value Objects
- [ ] Factory Methods : pas de duplication de création d'objets
- [ ] Reuse Methods : pas de réimplémentation de logique existante
- [ ] Extract Logic : pas de logique complexe inline
- [ ] Methods on Objects : comportements encapsulés
- [ ] File Organization : enums dans des fichiers séparés
- [ ] Test Files : < 500 lignes par fichier
- [ ] Input Validation : toutes les entrées sont validées
- [ ] Logging : pas de `console.*`
- [ ] Security : pas de credentials dans les logs
