import { useCallback, useRef, useState } from 'react';

interface PdfUploaderProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

/**
 * Infer MIME type from filename extension.
 * Outlook often drops files with an empty file.type.
 */
function inferPdfFromName(file: File): boolean {
  if (file.type === 'application/pdf') return true;
  if (file.type === '' || file.type === 'application/octet-stream') {
    return file.name.toLowerCase().endsWith('.pdf');
  }
  return false;
}

/**
 * Extract files from a drop event, handling both dataTransfer.files
 * and dataTransfer.items (fallback for Outlook and other apps that
 * don't populate .files directly).
 */
function extractFilesFromDrop(e: React.DragEvent): File[] {
  const files: File[] = [];

  // Primary: dataTransfer.files
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      files.push(e.dataTransfer.files[i]);
    }
  }

  // Fallback: dataTransfer.items (some apps like Outlook populate items but not files)
  if (files.length === 0 && e.dataTransfer.items) {
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      const item = e.dataTransfer.items[i];
      if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
  }

  return files;
}

export function PdfUploader({ onFileSelected, isProcessing }: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (inferPdfFromName(file)) {
        setDropError(null);
        onFileSelected(file);
      } else {
        setDropError(`"${file.name}" is not a PDF file.`);
      }
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = extractFilesFromDrop(e);

      if (files.length === 0) {
        // No files received — likely New Outlook on Mac + Chrome/Firefox
        setDropError(
          'No file data received. If dragging from Outlook, please save the attachment to your desktop first, then drag it here from Finder.'
        );
        return;
      }

      // Process all PDFs that were dropped
      let foundPdf = false;
      for (const file of files) {
        if (inferPdfFromName(file)) {
          foundPdf = true;
          onFileSelected(file);
        }
      }

      if (!foundPdf) {
        setDropError(
          `No PDF files found in the drop. Received: ${files.map((f) => f.name).join(', ')}`
        );
      } else {
        setDropError(null);
      }
    },
    [onFileSelected]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (fileList) {
        for (let i = 0; i < fileList.length; i++) {
          handleFile(fileList[i]);
        }
      }
      // Reset input so same file can be re-uploaded
      e.target.value = '';
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Check if the drag source provides files
    const hasFiles = e.dataTransfer.types.includes('Files');
    setIsDragOver(true);
    if (!hasFiles) {
      setDropError(
        'This drag source may not provide file data. Try saving the file to your desktop first.'
      );
    } else {
      setDropError(null);
    }
  }, []);

  return (
    <div
      className={`pdf-uploader ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={() => {
        setIsDragOver(false);
        setDropError(null);
      }}
      onDrop={handleDrop}
      onClick={() => !isProcessing && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <div className="upload-icon">&#128196;</div>
      <p className="upload-text">
        {isProcessing
          ? 'Processing...'
          : 'Drop invoice PDF(s) here or click to browse'}
      </p>
      <p className="upload-hint">Supports PDF files. Drag from Finder for best results.</p>
      {dropError && <p className="upload-error">{dropError}</p>}
    </div>
  );
}
