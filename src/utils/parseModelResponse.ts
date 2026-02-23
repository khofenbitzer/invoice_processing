import type { FieldConfig, ArrayRow } from '../types';

export function parseModelResponse(
  rawResponse: string,
  fieldConfigs: FieldConfig[]
): { scalarData: Record<string, string | number | null>; arrayData: Record<string, ArrayRow[]> } {
  let cleaned = rawResponse.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  // Try to extract a JSON object if the model added surrounding text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in model response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  const scalarData: Record<string, string | number | null> = {};
  const arrayData: Record<string, ArrayRow[]> = {};

  for (const field of fieldConfigs) {
    if (field.type === 'scalar') {
      scalarData[field.id] = parsed[field.id] ?? null;
    } else if (field.type === 'array') {
      const rawArray = parsed[field.id];
      if (Array.isArray(rawArray)) {
        arrayData[field.id] = rawArray.map((row: Record<string, unknown>) => {
          const cleanedRow: ArrayRow = {};
          for (const sub of field.subFields) {
            cleanedRow[sub.id] = (row[sub.id] as string | number | null) ?? null;
          }
          return cleanedRow;
        });
      } else {
        arrayData[field.id] = [];
      }
    }
  }

  return { scalarData, arrayData };
}
