import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

// Charger le fichier OpenAPI YAML
const openApiYamlPath = join(__dirname, '../../docs/openapi.yaml');
const openApiYaml = readFileSync(openApiYamlPath, 'utf8');

// Exporter la spec parsée (pour Swagger UI)
export const swaggerSpec = yaml.load(openApiYaml) as Record<string, unknown>;

// Exporter le contenu YAML brut (pour l'endpoint /api-docs.yaml)
export const openApiYamlContent = openApiYaml;
