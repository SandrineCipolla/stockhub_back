import { OpenRouterAIService } from '@infrastructure/ai/OpenRouterAIService';
import { AISuggestion, StockContext } from '@domain/ai/IAIService';

const makeContext = (overrides: Partial<StockContext['items'][0]> = {}): StockContext => ({
  items: [
    {
      itemId: 1,
      label: 'Item test',
      quantity: 5,
      minimumStock: 10,
      daysUntilEmpty: 3,
      trend: 'STABLE',
      avgDailyConsumption: 1.5,
      recommendedRestock: 55,
      ...overrides,
    },
  ],
});

const makeLLMResponse = (suggestions: Omit<AISuggestion, 'source'>[]): Response => {
  const body = JSON.stringify({
    choices: [
      {
        message: {
          role: 'assistant',
          content: JSON.stringify(suggestions),
        },
      },
    ],
  });

  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

describe('OpenRouterAIService', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generateSuggestions() — nominal (LLM)', () => {
    it('returns LLM suggestions with source="llm" when API key is set and fetch succeeds', async () => {
      process.env.OPENROUTER_API_KEY = 'test-key';
      process.env.AI_MODEL = 'mistralai/mistral-small-3.1';

      const llmSuggestions: Omit<AISuggestion, 'source'>[] = [
        {
          itemId: 1,
          type: 'RESTOCK',
          priority: 'high',
          title: 'Critical stock',
          description: 'Item will run out soon',
        },
      ];

      jest.spyOn(global, 'fetch').mockResolvedValueOnce(makeLLMResponse(llmSuggestions));

      const service = new OpenRouterAIService();
      const context = makeContext();
      const result = await service.generateSuggestions(context);

      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('llm');
      expect(result[0].type).toBe('RESTOCK');
      expect(result[0].priority).toBe('high');
      expect(result[0].itemId).toBe(1);
    });

    it('calls fetch with correct headers and model', async () => {
      process.env.OPENROUTER_API_KEY = 'my-secret-key';
      process.env.AI_MODEL = 'mistralai/mistral-small-3.1';

      const llmSuggestions: Omit<AISuggestion, 'source'>[] = [
        {
          itemId: 1,
          type: 'OPTIMIZATION',
          priority: 'low',
          title: 'Low usage',
          description: 'Item is barely used',
        },
      ];

      const fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(makeLLMResponse(llmSuggestions));

      const service = new OpenRouterAIService();
      await service.generateSuggestions(makeContext());

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');

      const headers = options.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer my-secret-key');
      expect(headers['HTTP-Referer']).toBe('stockhub');

      const body = JSON.parse(options.body as string) as { model: string };
      expect(body.model).toBe('mistralai/mistral-small-3.1');
    });
  });

  describe('generateSuggestions() — fallback: no API key', () => {
    it('returns deterministic suggestions with source="deterministic" when OPENROUTER_API_KEY is absent', async () => {
      delete process.env.OPENROUTER_API_KEY;

      const fetchSpy = jest.spyOn(global, 'fetch');

      const service = new OpenRouterAIService();
      const context = makeContext({ daysUntilEmpty: 3 });
      const result = await service.generateSuggestions(context);

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
      result.forEach(s => expect(s.source).toBe('deterministic'));
    });

    it('generates RESTOCK high when daysUntilEmpty < 7', async () => {
      delete process.env.OPENROUTER_API_KEY;

      const service = new OpenRouterAIService();
      const context = makeContext({ daysUntilEmpty: 3 });
      const result = await service.generateSuggestions(context);

      const restock = result.find(s => s.type === 'RESTOCK');
      expect(restock).toBeDefined();
      expect(restock?.priority).toBe('high');
      expect(restock?.source).toBe('deterministic');
    });

    it('generates RESTOCK medium when daysUntilEmpty is between 7 and 14', async () => {
      delete process.env.OPENROUTER_API_KEY;

      const service = new OpenRouterAIService();
      const context = makeContext({ daysUntilEmpty: 10 });
      const result = await service.generateSuggestions(context);

      const restock = result.find(s => s.type === 'RESTOCK');
      expect(restock).toBeDefined();
      expect(restock?.priority).toBe('medium');
      expect(restock?.source).toBe('deterministic');
    });

    it('generates OVERSTOCK medium when trend is INCREASING and daysUntilEmpty >= 14', async () => {
      delete process.env.OPENROUTER_API_KEY;

      const service = new OpenRouterAIService();
      const context = makeContext({ daysUntilEmpty: 60, trend: 'INCREASING' });
      const result = await service.generateSuggestions(context);

      const overstock = result.find(s => s.type === 'OVERSTOCK');
      expect(overstock).toBeDefined();
      expect(overstock?.priority).toBe('medium');
      expect(overstock?.source).toBe('deterministic');
    });
  });

  describe('generateSuggestions() — fallback: network error', () => {
    it('returns deterministic suggestions with source="deterministic" when fetch throws', async () => {
      process.env.OPENROUTER_API_KEY = 'test-key';

      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network timeout'));

      const service = new OpenRouterAIService();
      const context = makeContext({ daysUntilEmpty: 3 });
      const result = await service.generateSuggestions(context);

      expect(result.length).toBeGreaterThan(0);
      result.forEach(s => expect(s.source).toBe('deterministic'));
    });

    it('returns deterministic suggestions when fetch returns a non-OK status', async () => {
      process.env.OPENROUTER_API_KEY = 'test-key';

      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));

      const service = new OpenRouterAIService();
      const context = makeContext({ daysUntilEmpty: 3 });
      const result = await service.generateSuggestions(context);

      expect(result.length).toBeGreaterThan(0);
      result.forEach(s => expect(s.source).toBe('deterministic'));
    });

    it('returns deterministic suggestions when LLM response is not valid JSON', async () => {
      process.env.OPENROUTER_API_KEY = 'test-key';

      const badResponse = new Response(
        JSON.stringify({
          choices: [{ message: { role: 'assistant', content: 'not-json-at-all' } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

      jest.spyOn(global, 'fetch').mockResolvedValueOnce(badResponse);

      const service = new OpenRouterAIService();
      const context = makeContext({ daysUntilEmpty: 3 });
      const result = await service.generateSuggestions(context);

      expect(result.length).toBeGreaterThan(0);
      result.forEach(s => expect(s.source).toBe('deterministic'));
    });
  });
});
