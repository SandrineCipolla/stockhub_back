import { AISuggestion, IAIService, StockContext } from '@domain/ai/IAIService';
import { STOCK_SUGGESTIONS_SYSTEM_PROMPT } from '@domain/ai/prompts/stockSuggestions';
import { rootController } from '@utils/logger';

const logger = rootController.getChildCategory('OpenRouterAIService');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterChoice {
  message: OpenRouterMessage;
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[];
}

type RawSuggestion = {
  itemId: unknown;
  type: unknown;
  priority: unknown;
  title: unknown;
  description: unknown;
};

const VALID_TYPES: AISuggestion['type'][] = [
  'RESTOCK',
  'OVERSTOCK',
  'TREND_ALERT',
  'EXPIRY_ALERT',
  'OPTIMIZATION',
];
const VALID_PRIORITIES: AISuggestion['priority'][] = ['high', 'medium', 'low'];

function isValidSuggestion(raw: RawSuggestion): raw is RawSuggestion & {
  itemId: number;
  type: AISuggestion['type'];
  priority: AISuggestion['priority'];
  title: string;
  description: string;
} {
  return (
    typeof raw.itemId === 'number' &&
    typeof raw.type === 'string' &&
    (VALID_TYPES as string[]).includes(raw.type) &&
    typeof raw.priority === 'string' &&
    (VALID_PRIORITIES as string[]).includes(raw.priority) &&
    typeof raw.title === 'string' &&
    typeof raw.description === 'string'
  );
}

function buildDeterministicSuggestions(context: StockContext): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  for (const item of context.items) {
    if (item.daysUntilEmpty < 7) {
      suggestions.push({
        itemId: item.itemId,
        type: 'RESTOCK',
        priority: 'high',
        title: 'Stock critique — réassort urgent',
        description: `"${item.label}" sera épuisé dans moins de 7 jours. Réassort recommandé : ${item.recommendedRestock} unités.`,
        source: 'deterministic',
      });
    } else if (item.daysUntilEmpty < 14) {
      suggestions.push({
        itemId: item.itemId,
        type: 'RESTOCK',
        priority: 'medium',
        title: 'Stock faible — prévoir un réassort',
        description: `"${item.label}" sera épuisé dans moins de 14 jours. Réassort recommandé : ${item.recommendedRestock} unités.`,
        source: 'deterministic',
      });
    } else if (item.trend === 'INCREASING') {
      suggestions.push({
        itemId: item.itemId,
        type: 'OVERSTOCK',
        priority: 'medium',
        title: 'Tendance à la hausse détectée',
        description: `La consommation de "${item.label}" est en augmentation. Surveiller l'évolution et ajuster le stock minimum si nécessaire.`,
        source: 'deterministic',
      });
    }
  }

  return suggestions;
}

function parseLLMResponse(content: string, context: StockContext): AISuggestion[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    logger.warn('LLM response is not valid JSON — falling back to deterministic suggestions');
    return buildDeterministicSuggestions(context);
  }

  if (!Array.isArray(parsed)) {
    logger.warn('LLM response is not an array — falling back to deterministic suggestions');
    return buildDeterministicSuggestions(context);
  }

  const suggestions: AISuggestion[] = [];

  for (const item of parsed) {
    const raw = item as RawSuggestion;
    if (isValidSuggestion(raw)) {
      suggestions.push({
        itemId: raw.itemId,
        type: raw.type,
        priority: raw.priority,
        title: raw.title,
        description: raw.description,
        source: 'llm',
      });
    }
  }

  if (suggestions.length === 0) {
    logger.warn('LLM returned no valid suggestions — falling back to deterministic suggestions');
    return buildDeterministicSuggestions(context);
  }

  return suggestions;
}

export class OpenRouterAIService implements IAIService {
  async generateSuggestions(context: StockContext): Promise<AISuggestion[]> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      logger.info('OPENROUTER_API_KEY not set — using deterministic suggestions');
      return buildDeterministicSuggestions(context);
    }

    const model = process.env.AI_MODEL ?? 'mistralai/mistral-small-3.1-24b-instruct';
    const userMessage = JSON.stringify(context);

    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'stockhub',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: STOCK_SUGGESTIONS_SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(
          `OpenRouter request failed — status=${response.status} — body=${errorBody} — using deterministic suggestions`
        );
        return buildDeterministicSuggestions(context);
      }

      const data = (await response.json()) as OpenRouterResponse;
      const content = data.choices?.[0]?.message?.content ?? '';

      logger.info(`OpenRouter response received — model=${model}`);

      return parseLLMResponse(content, context);
    } catch (err) {
      logger.error(
        `OpenRouter request error — ${(err as Error).message} — using deterministic suggestions`
      );
      return buildDeterministicSuggestions(context);
    }
  }
}
