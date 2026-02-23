import type { FieldConfig } from '../types';

export function buildExtractionPrompt(fields: FieldConfig[]): string {
  const schemaLines: string[] = ['{'];

  for (const field of fields) {
    if (field.type === 'scalar') {
      const typeHint = field.dataType === 'number' ? 'number' : 'string';
      const desc = field.description ? ` // ${field.description}` : '';
      schemaLines.push(`  "${field.id}": ${typeHint},${desc}`);
    } else if (field.type === 'array') {
      const desc = field.description ? ` // ${field.description}` : '';
      schemaLines.push(`  "${field.id}": [${desc}`);
      schemaLines.push('    {');
      for (const sub of field.subFields) {
        const typeHint = sub.dataType === 'number' ? 'number' : 'string';
        schemaLines.push(`      "${sub.id}": ${typeHint},`);
      }
      schemaLines.push('    }');
      schemaLines.push('  ],');
    }
  }

  schemaLines.push('}');
  const schemaBlock = schemaLines.join('\n');

  return `You are an invoice data extraction assistant. Analyze the provided invoice image(s) and extract the following information into a JSON object.

Respond ONLY with valid JSON. No explanations, no markdown code fences, no additional text.

Required JSON structure:
${schemaBlock}

Rules:
- If a field value is not found in the invoice, use null.
- For number fields, return numeric values without currency symbols.
- For date fields, use ISO 8601 format (YYYY-MM-DD).
- For array fields, include every row/line item visible in the invoice.
- If the invoice spans multiple pages, combine data from all pages into a single JSON object.`;
}
