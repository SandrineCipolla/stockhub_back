import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

// Charger le fichier OpenAPI YAML
// Toujours pointer vers le fichier source dans docs/ (pas dans dist/)
// En dev: process.cwd() = project root
// En prod (webpack): process.cwd() = project root aussi
const openApiYamlPath = join(process.cwd(), 'docs/openapi.yaml');
const openApiYaml = readFileSync(openApiYamlPath, 'utf8');

// Exporter la spec parsée (pour Swagger UI)
export const swaggerSpec = yaml.load(openApiYaml) as Record<string, unknown>;

// Exporter le contenu YAML brut (pour l'endpoint /api-docs.yaml)
export const openApiYamlContent = openApiYaml;
