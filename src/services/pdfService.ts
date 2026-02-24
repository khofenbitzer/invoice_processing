import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PdfPageImage } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

export async function pdfToImages(
  fileBuffer: ArrayBuffer,
  scale = 2.0
): Promise<PdfPageImage[]> {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise;
  const images: PdfPageImage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d')!;

    await page.render({ canvas, canvasContext: context, viewport }).promise;

    images.push({
      pageNumber: i,
      base64: canvas.toDataURL('image/png'),
      width: viewport.width,
      height: viewport.height,
    });

    page.cleanup();
  }

  return images;
}

export async function computeFileHash(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
