import { useCallback } from 'react';
import type { FieldConfig, ApiConfig } from '../types';
import type { Action } from './useInvoiceStore';
import { pdfToImages, computeFileHash } from '../services/pdfService';
import { buildExtractionPrompt } from '../services/promptBuilder';
import { extractInvoiceData } from '../services/visionApiService';
import { parseModelResponse } from '../utils/parseModelResponse';

export function usePdfProcessor(
  fieldConfigs: FieldConfig[],
  apiConfig: ApiConfig,
  dispatch: React.Dispatch<Action>
) {
  const processFile = useCallback(
    async (file: File) => {
      const buffer = await file.arrayBuffer();
      const fileHash = await computeFileHash(buffer);
      const id = crypto.randomUUID();

      dispatch({
        type: 'START_PROCESSING',
        payload: { id, fileName: file.name, fileHash, pageCount: 0 },
      });

      try {
        const images = await pdfToImages(buffer, 2.0);

        // Update page count now that we know it
        dispatch({
          type: 'START_PROCESSING',
          payload: { id, fileName: file.name, fileHash, pageCount: images.length },
        });

        const prompt = buildExtractionPrompt(fieldConfigs);
        const rawResponse = await extractInvoiceData(images, prompt, apiConfig);
        const { scalarData, arrayData } = parseModelResponse(rawResponse, fieldConfigs);

        dispatch({
          type: 'COMPLETE_PROCESSING',
          payload: { id, scalarData, arrayData, rawResponse },
        });
      } catch (error) {
        dispatch({
          type: 'PROCESSING_ERROR',
          payload: { id, errorMessage: (error as Error).message },
        });
      }
    },
    [fieldConfigs, apiConfig, dispatch]
  );

  return { processFile };
}
