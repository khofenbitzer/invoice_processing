import type { PdfPageImage, ApiConfig } from '../types';

export async function extractInvoiceData(
  images: PdfPageImage[],
  prompt: string,
  config: ApiConfig
): Promise<string> {
  const content: Array<
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }
  > = [{ type: 'text', text: prompt }];

  for (const img of images) {
    content.push({
      type: 'image_url',
      image_url: { url: img.base64 },
    });
  }

  const targetUrl = `${config.baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-LLM-Target-URL': targetUrl,
  };
  if (config.apiKey) {
    headers['X-LLM-API-Key'] = config.apiKey;
  }

  const response = await fetch('/llm-proxy', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'Respond only in raw JSON. No extra text or explanations.',
        },
        {
          role: 'user',
          content,
        },
      ],
      // max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
