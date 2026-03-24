import 'dotenv/config';

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'mistral';

const mockStocks = [
  {
    stockName: 'Garde-manger',
    items: [
      { label: 'Pâtes', quantity: 1, minimumStock: 5, status: 'critical' },
      { label: 'Riz', quantity: 0, minimumStock: 3, status: 'out-of-stock' },
      { label: 'Farine', quantity: 8, minimumStock: 2, status: 'overstocked' },
    ],
  },
  {
    stockName: 'Hygiène',
    items: [
      { label: 'Dentifrice', quantity: 0, minimumStock: 2, status: 'out-of-stock' },
      { label: 'Savon', quantity: 8, minimumStock: 2, status: 'overstocked' },
    ],
  },
];

async function main() {
  console.log(`Model: ${MODEL}`);
  console.log('Sending prompt to Ollama...\n');

  const start = Date.now();

  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      messages: [
        {
          role: 'user',
          content: `Tu es un assistant spécialisé en analyse de stocks.
Voici les stocks d'un foyer : ${JSON.stringify(mockStocks)}
Génère un profil consommateur JSON avec : profilType, pointsForts, axesAmelioration, produitsAReapprovisionner, recommandation.
Réponds uniquement avec du JSON valide, sans texte autour.`,
        },
      ],
    }),
  });

  const latency = Date.now() - start;

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { message: { content: string } };
  const content = data.message.content;

  console.log(`Latency: ${latency}ms`);
  console.log('\n--- Response ---');
  console.log(content);

  try {
    const parsed = JSON.parse(content) as unknown;
    console.log('\n--- Parsed JSON ---');
    console.log(JSON.stringify(parsed, null, 2));
  } catch {
    console.log('\n⚠️  Response is not valid JSON');
  }
}

main().catch(console.error);
