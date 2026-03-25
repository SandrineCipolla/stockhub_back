/**
 * Génère 90 jours d'historique de consommation réaliste pour 5 items types.
 * Utilisé comme contexte LLM dans les spikes Ollama et OpenRouter.
 *
 * Usage : npx ts-node -r tsconfig-paths/register scripts/generateSyntheticData.ts
 * Output : scripts/synthetic-data.json
 */

import * as fs from 'fs';
import * as path from 'path';

// --- Gaussian (Box-Muller) ---
function gaussianRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, mean + z * stdDev);
}

// --- Types ---
interface DayRecord {
  date: string;
  consumed: number;
  restocked: number;
  stockLevel: number;
}

interface ItemProfile {
  label: string;
  unit: string;
  avgDailyConsumption: number;
  stdDev: number;
  restockAmount: number;
  minimumStock: number;
  initialStock: number;
  weekendMultiplier: number;
}

interface ItemSummary {
  label: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  status: 'ok' | 'low' | 'critical' | 'out-of-stock' | 'overstocked';
  avgDailyConsumption: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  restockCount: number;
  lastRestockDaysAgo: number | null;
  estimatedDaysUntilStockout: number | null;
  weeklyPattern: { weekday: number; weekend: number };
  recentHistory: DayRecord[];
}

interface StockSummary {
  stockName: string;
  items: ItemSummary[];
}

interface SyntheticData {
  generatedAt: string;
  periodDays: number;
  stocks: StockSummary[];
}

// --- Profils d'items ---
const STOCKS: { stockName: string; items: ItemProfile[] }[] = [
  {
    stockName: 'Garde-manger',
    items: [
      {
        label: 'Farine',
        unit: 'g',
        avgDailyConsumption: 50,
        stdDev: 20,
        restockAmount: 1000,
        minimumStock: 200,
        initialStock: 800,
        weekendMultiplier: 1.6, // plus de cuisine le weekend
      },
      {
        label: 'Pâtes',
        unit: 'g',
        avgDailyConsumption: 60,
        stdDev: 25,
        restockAmount: 500,
        minimumStock: 100,
        initialStock: 400,
        weekendMultiplier: 1.3,
      },
      {
        label: 'Huile',
        unit: 'mL',
        avgDailyConsumption: 15,
        stdDev: 5,
        restockAmount: 500,
        minimumStock: 100,
        initialStock: 300,
        weekendMultiplier: 1.2,
      },
      {
        label: 'Café',
        unit: 'g',
        avgDailyConsumption: 20,
        stdDev: 4,
        restockAmount: 250,
        minimumStock: 50,
        initialStock: 220,
        weekendMultiplier: 1.0, // consommation stable
      },
      {
        label: 'Lait',
        unit: 'mL',
        avgDailyConsumption: 350,
        stdDev: 100,
        restockAmount: 2000,
        minimumStock: 500,
        initialStock: 1500,
        weekendMultiplier: 1.2,
      },
    ],
  },
  {
    stockName: 'Hygiène',
    items: [
      {
        label: 'Dentifrice',
        unit: 'g',
        avgDailyConsumption: 3,
        stdDev: 0.5,
        restockAmount: 75,
        minimumStock: 15,
        initialStock: 70,
        weekendMultiplier: 1.0,
      },
      {
        label: 'Savon',
        unit: 'mL',
        avgDailyConsumption: 10,
        stdDev: 3,
        restockAmount: 300,
        minimumStock: 50,
        initialStock: 250,
        weekendMultiplier: 1.1,
      },
      {
        label: 'Shampooing',
        unit: 'mL',
        avgDailyConsumption: 8,
        stdDev: 2,
        restockAmount: 400,
        minimumStock: 60,
        initialStock: 300,
        weekendMultiplier: 1.4, // douche plus fréquente le weekend
      },
    ],
  },
];

// --- Génération de l'historique ---
function generateHistory(
  profile: ItemProfile,
  days: number
): { history: DayRecord[]; currentStock: number } {
  const history: DayRecord[] = [];
  let stock = profile.initialStock;

  // Démarre 90 jours avant aujourd'hui (2026-03-25)
  const startDate = new Date('2025-12-25');

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const multiplier = isWeekend ? profile.weekendMultiplier : 1.0;

    const consumed = Math.round(
      gaussianRandom(profile.avgDailyConsumption * multiplier, profile.stdDev * multiplier)
    );

    let restocked = 0;
    if (stock - consumed < profile.minimumStock) {
      restocked = profile.restockAmount;
    }

    stock = Math.max(0, stock - consumed + restocked);

    history.push({
      date: date.toISOString().split('T')[0],
      consumed,
      restocked,
      stockLevel: stock,
    });
  }

  return { history, currentStock: stock };
}

// --- Calcul du trend (compare première moitié vs seconde moitié) ---
function computeTrend(history: DayRecord[]): 'increasing' | 'decreasing' | 'stable' {
  const mid = Math.floor(history.length / 2);
  const firstHalf = history.slice(0, mid);
  const secondHalf = history.slice(mid);

  const avgFirst = firstHalf.reduce((s, d) => s + d.consumed, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, d) => s + d.consumed, 0) / secondHalf.length;

  const delta = ((avgSecond - avgFirst) / avgFirst) * 100;

  if (delta > 10) return 'increasing';
  if (delta < -10) return 'decreasing';
  return 'stable';
}

// --- Statut du stock ---
function computeStatus(
  current: number,
  minimum: number
): 'ok' | 'low' | 'critical' | 'out-of-stock' | 'overstocked' {
  if (current === 0) return 'out-of-stock';
  if (current < minimum * 0.5) return 'critical';
  if (current < minimum) return 'low';
  if (current > minimum * 4) return 'overstocked';
  return 'ok';
}

// --- Main ---
function main(): void {
  const DAYS = 90;
  const RECENT_DAYS = 14;

  const result: SyntheticData = {
    generatedAt: new Date().toISOString().split('T')[0],
    periodDays: DAYS,
    stocks: STOCKS.map(stock => ({
      stockName: stock.stockName,
      items: stock.items.map(profile => {
        const { history, currentStock } = generateHistory(profile, DAYS);

        const weekdayRecords = history.filter(d => {
          const day = new Date(d.date).getDay();
          return day !== 0 && day !== 6;
        });
        const weekendRecords = history.filter(d => {
          const day = new Date(d.date).getDay();
          return day === 0 || day === 6;
        });

        const avgWeekday = Math.round(
          weekdayRecords.reduce((s, d) => s + d.consumed, 0) / weekdayRecords.length
        );
        const avgWeekend = Math.round(
          weekendRecords.reduce((s, d) => s + d.consumed, 0) / weekendRecords.length
        );

        const restockEvents = history.filter(d => d.restocked > 0);
        const lastRestock = restockEvents[restockEvents.length - 1];
        const lastRestockDaysAgo = lastRestock
          ? Math.floor(
              (new Date().getTime() - new Date(lastRestock.date).getTime()) / (1000 * 60 * 60 * 24)
            )
          : null;

        const avgDaily = Math.round(history.reduce((s, d) => s + d.consumed, 0) / history.length);

        const estimatedDaysUntilStockout =
          avgDaily > 0 ? Math.floor(currentStock / avgDaily) : null;

        return {
          label: profile.label,
          unit: profile.unit,
          currentStock,
          minimumStock: profile.minimumStock,
          status: computeStatus(currentStock, profile.minimumStock),
          avgDailyConsumption: avgDaily,
          trend: computeTrend(history),
          restockCount: restockEvents.length,
          lastRestockDaysAgo,
          estimatedDaysUntilStockout,
          weeklyPattern: { weekday: avgWeekday, weekend: avgWeekend },
          recentHistory: history.slice(-RECENT_DAYS),
        };
      }),
    })),
  };

  const outputPath = path.join(__dirname, 'synthetic-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  console.info(
    `Generated ${DAYS}-day history for ${result.stocks.flatMap(s => s.items).length} items`
  );
  console.info(`Output: ${outputPath}\n`);

  result.stocks.forEach(stock => {
    console.info(`${stock.stockName}:`);
    stock.items.forEach(item => {
      console.info(
        `  ${item.label.padEnd(12)} | stock: ${String(item.currentStock).padStart(5)} ${item.unit.padEnd(3)} | status: ${item.status.padEnd(12)} | trend: ${item.trend} | ~${item.estimatedDaysUntilStockout ?? '∞'}j avant rupture`
      );
    });
  });
}

main();
