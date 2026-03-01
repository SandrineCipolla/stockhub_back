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
 */

import { PrismaClient, StockCategory, StockRole, FamilyRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
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
