import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

// TODO: remplacer mockStocks par un appel repo quand les données DB seront disponibles
const mockStocks = [
  {
    stockName: 'Garde-manger',
    category: 'alimentation',
    items: [
      { label: 'Pâtes', quantity: 1, minimumStock: 5, status: 'critical' },
      { label: 'Riz', quantity: 0, minimumStock: 3, status: 'out-of-stock' },
      { label: 'Farine', quantity: 8, minimumStock: 2, status: 'overstocked' },
    ],
  },
  {
    stockName: 'Hygiène',
    category: 'hygiene',
    items: [
      { label: 'Dentifrice', quantity: 0, minimumStock: 2, status: 'out-of-stock' },
      { label: 'Savon', quantity: 8, minimumStock: 2, status: 'overstocked' },
    ],
  },
];

export interface ConsumerProfile {
  profilType: string;
  pointsForts: string[];
  axesAmelioration: string[];
  produitsAReapprovisionner: string[];
  recommandation: string;
}

export class IAAnalysisService {
  async generateConsumerProfile(): Promise<ConsumerProfile> {
    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tu es un assistant spécialisé en analyse de comportement de consommation.
  Voici les stocks d'un foyer : ${JSON.stringify(mockStocks)}
  Génère un profil consommateur JSON avec : profilType, pointsForts, axesAmelioration, produitsAReapprovisionner, recommandation.`,
      config: { responseMimeType: 'application/json' },
    });

    return JSON.parse(response.text ?? '{}') as ConsumerProfile;
  }
}
