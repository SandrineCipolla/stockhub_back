import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openrouter/free';

interface SyntheticData {
  generatedAt: string;
  periodDays: number;
  stocks: unknown[];
}

function loadSyntheticData(): SyntheticData {
  const dataPath = path.join(__dirname, 'synthetic-data.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error('synthetic-data.json not found. Run generateSyntheticData.ts first.');
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as SyntheticData;
}

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in .env');
  }

  const syntheticData = loadSyntheticData();
  console.info(`Model: ${MODEL}`);
  console.info(
    `Data: ${syntheticData.periodDays}-day history generated on ${syntheticData.generatedAt}`
  );
  console.info('Sending prompt to OpenRouter...\n');

  const start = Date.now();

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: `Tu es un assistant spécialisé en analyse de stocks domestiques.
Voici l'historique de consommation sur ${syntheticData.periodDays} jours d'un foyer : ${JSON.stringify(syntheticData.stocks)}
Analyse les tendances de consommation et génère un profil consommateur JSON avec :
- profilType : type de foyer déduit
- pointsForts : habitudes positives observées
- axesAmelioration : problèmes identifiés (gaspillage, ruptures fréquentes...)
- produitsAReapprovisionner : items urgents avec nombre de jours avant rupture estimé
- recommandation : conseil personnalisé basé sur les patterns observés
Réponds uniquement avec du JSON valide, sans texte autour.`,
        },
      ],
    }),
  });

  const latency = Date.now() - start;

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error: ${response.status} ${response.statusText} — ${errorText}`);
  }

  const data = (await response.json()) as { choices: [{ message: { content: string } }] };
  const content = data.choices[0].message.content;

  console.info(`Latency: ${latency}ms`);
  console.info('\n--- Response ---');
  console.info(content);

  try {
    const parsed = JSON.parse(content) as unknown;
    console.info('\n--- Parsed JSON ---');
    console.info(JSON.stringify(parsed, null, 2));
  } catch {
    console.info('\n⚠️  Response is not valid JSON');
  }
}

main().catch(console.error);
