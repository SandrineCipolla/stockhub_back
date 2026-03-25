/**
 * Seed idempotent pour environnement staging / dev local.
 * Exécuter avec : npm run db:seed
 *
 * Données créées :
 *  - 3 utilisateurs : owner (email depuis SEED_OWNER_EMAIL), alice, bob
 *  - 1 famille (owner ADMIN, alice MEMBER)
 *  - 3 stocks (owner) : alimentation, hygiene, artistique
 *  - 3 items par stock (dont 1 en sous-stock intentionnel)
 *  - alice → EDITOR sur le stock Café
t *  - 90 jours d'historique de consommation par item (pour les prédictions IA)
 */

import { PrismaClient, StockCategory, StockRole, FamilyRole } from '@prisma/client';

// --- Gaussian (Box-Muller) ---
function gaussianRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, mean + z * stdDev);
}

const prisma = new PrismaClient();

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed interdit en production. Utilisez NODE_ENV=development ou staging.');
  }

  const ownerEmail = process.env.SEED_OWNER_EMAIL ?? 'owner@stockhub.local';
  const aliceEmail = 'alice@stockhub.local';
  const bobEmail = 'bob@stockhub.local';

  // --- Utilisateurs ---
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: { email: ownerEmail },
  });

  const alice = await prisma.user.upsert({
    where: { email: aliceEmail },
    update: {},
    create: { email: aliceEmail },
  });

  const bob = await prisma.user.upsert({
    where: { email: bobEmail },
    update: {},
    create: { email: bobEmail },
  });

  // --- Famille ---
  let family = await prisma.family.findFirst({
    where: { name: 'Famille StockHub' },
  });
  if (!family) {
    family = await prisma.family.create({
      data: { name: 'Famille StockHub' },
    });
  }

  await prisma.familyMember.upsert({
    where: { familyId_userId: { familyId: family.id, userId: owner.id } },
    update: {},
    create: { familyId: family.id, userId: owner.id, role: FamilyRole.ADMIN },
  });

  await prisma.familyMember.upsert({
    where: { familyId_userId: { familyId: family.id, userId: alice.id } },
    update: {},
    create: { familyId: family.id, userId: alice.id, role: FamilyRole.MEMBER },
  });

  // --- Stocks ---
  const stockCafe = await upsertStock(
    'Stock Café',
    'Provisions café et thé',
    StockCategory.alimentation,
    owner.id
  );
  const stockHygiene = await upsertStock(
    'Stock Hygiène',
    'Produits hygiène quotidienne',
    StockCategory.hygiene,
    owner.id
  );
  const stockArt = await upsertStock(
    'Stock Artistique',
    'Matériel peinture et dessin',
    StockCategory.artistique,
    owner.id
  );

  // --- Items stock Café (1 item en sous-stock intentionnel) ---
  await upsertItem('Café Arabica 250g', 'Grains torréfiés', 15, 5, stockCafe.id);
  await upsertItem('Thé Vert', 'Feuilles de thé vert', 8, 3, stockCafe.id);
  await upsertItem('Café Soluble', 'Café instantané', 1, 10, stockCafe.id); // ⚠ sous-stock

  // --- Items stock Hygiène (1 item en sous-stock intentionnel) ---
  await upsertItem('Savon Liquide 500ml', 'Savon mains', 20, 5, stockHygiene.id);
  await upsertItem('Gel Douche', 'Gel douche neutre', 12, 4, stockHygiene.id);
  await upsertItem('Shampoing', 'Shampoing usage fréquent', 2, 6, stockHygiene.id); // ⚠ sous-stock

  // --- Items stock Artistique (1 item en sous-stock intentionnel) ---
  await upsertItem('Peinture Acrylique Rouge', 'Tube 100ml', 5, 2, stockArt.id);
  await upsertItem('Pinceaux Set', 'Lot de 10 pinceaux', 3, 1, stockArt.id);
  await upsertItem('Toile 30x40cm', 'Toile coton apprêtée', 0, 3, stockArt.id); // ⚠ sous-stock

  // --- Collaborateur : alice EDITOR sur stock Café ---
  await prisma.stockCollaborator.upsert({
    where: { stockId_userId: { stockId: stockCafe.id, userId: alice.id } },
    update: {},
    create: {
      stockId: stockCafe.id,
      userId: alice.id,
      role: StockRole.EDITOR,
      grantedBy: owner.id,
    },
  });

  // --- Historique 90 jours pour les prédictions IA ---
  const allItems = await prisma.item.findMany({
    where: { stockId: { in: [stockCafe.id, stockHygiene.id, stockArt.id] } },
  });

  const itemProfiles: Record<
    string,
    { avgConsumption: number; stdDev: number; weekendMultiplier: number }
  > = {
    'Café Arabica 250g': { avgConsumption: 2, stdDev: 0.5, weekendMultiplier: 1.3 },
    'Thé Vert': { avgConsumption: 1, stdDev: 0.3, weekendMultiplier: 1.0 },
    'Café Soluble': { avgConsumption: 0.5, stdDev: 0.2, weekendMultiplier: 1.1 },
    'Savon Liquide 500ml': { avgConsumption: 3, stdDev: 1, weekendMultiplier: 1.2 },
    'Gel Douche': { avgConsumption: 2, stdDev: 0.5, weekendMultiplier: 1.3 },
    Shampoing: { avgConsumption: 2, stdDev: 0.5, weekendMultiplier: 1.4 },
    'Peinture Acrylique Rouge': { avgConsumption: 1, stdDev: 0.5, weekendMultiplier: 2.0 },
    'Pinceaux Set': { avgConsumption: 0, stdDev: 0, weekendMultiplier: 1.0 },
    'Toile 30x40cm': { avgConsumption: 0.3, stdDev: 0.2, weekendMultiplier: 2.5 },
  };

  for (const item of allItems) {
    const existing = await prisma.itemHistory.count({ where: { itemId: item.id } });
    if (existing > 0) continue;

    const profile = itemProfiles[item.label ?? ''];
    if (!profile || profile.avgConsumption === 0) continue;

    await seedItemHistory(item.id, item.quantity ?? 0, item.minimumStock, profile, ownerEmail);
  }

  console.log('✅ Seed terminé avec succès');
  console.log(`   Owner : ${ownerEmail} (id=${owner.id})`);
  console.log(`   Alice : ${aliceEmail} (id=${alice.id})`);
  console.log(`   Bob   : ${bobEmail} (id=${bob.id})`);
  console.log(`   Stocks créés : ${stockCafe.label}, ${stockHygiene.label}, ${stockArt.label}`);
}

async function upsertStock(
  label: string,
  description: string,
  category: StockCategory,
  userId: number
): Promise<{ id: number; label: string }> {
  const existing = await prisma.stock.findFirst({
    where: { label, userId },
    select: { id: true, label: true },
  });
  if (existing) return existing;

  return prisma.stock.create({
    data: { label, description, category, userId },
    select: { id: true, label: true },
  });
}

async function seedItemHistory(
  itemId: number,
  currentQuantity: number,
  minimumStock: number,
  profile: { avgConsumption: number; stdDev: number; weekendMultiplier: number },
  changedBy: string
): Promise<void> {
  const DAYS = 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS);

  let stock = currentQuantity + Math.ceil(profile.avgConsumption * DAYS * 0.8); // stock de départ simulé

  const entries: {
    itemId: number;
    oldQuantity: number;
    newQuantity: number;
    changeType: string;
    changedBy: string;
    changedAt: Date;
  }[] = [];

  for (let i = 0; i < DAYS; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const multiplier = isWeekend ? profile.weekendMultiplier : 1.0;

    const consumed = Math.round(
      gaussianRandom(profile.avgConsumption * multiplier, profile.stdDev * multiplier)
    );

    if (consumed > 0 && stock > 0) {
      const oldQty = stock;
      stock = Math.max(0, stock - consumed);
      entries.push({
        itemId,
        oldQuantity: oldQty,
        newQuantity: stock,
        changeType: 'CONSUMPTION',
        changedBy,
        changedAt: date,
      });
    }

    if (stock < minimumStock) {
      const oldQty = stock;
      stock = stock + Math.ceil(profile.avgConsumption * 30);
      entries.push({
        itemId,
        oldQuantity: oldQty,
        newQuantity: stock,
        changeType: 'RESTOCK',
        changedBy,
        changedAt: new Date(date.getTime() + 3600000),
      });
    }
  }

  await prisma.itemHistory.createMany({ data: entries });
}

async function upsertItem(
  label: string,
  description: string,
  quantity: number,
  minimumStock: number,
  stockId: number
): Promise<void> {
  const existing = await prisma.item.findFirst({
    where: { label, stockId },
  });
  if (!existing) {
    await prisma.item.create({
      data: { label, description, quantity, minimumStock, stockId },
    });
  }
}

main()
  .catch(e => {
    console.error('❌ Erreur pendant le seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
