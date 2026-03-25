import 'dotenv/config';

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set in .env');

  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const data = (await response.json()) as {
    data: { id: string; name: string; pricing: { prompt: string } }[];
  };

  const freeModels = data.data.filter(m => m.pricing.prompt === '0');
  console.info(`Free models (${freeModels.length}):\n`);
  freeModels.forEach(m => console.info(`  ${m.id}  —  ${m.name}`));
}

main().catch(console.error);
