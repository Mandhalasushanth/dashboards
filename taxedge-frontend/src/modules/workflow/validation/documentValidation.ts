/** Upload rules enforced before a file leaves the browser; the server re-checks type, size and content. */
export const DOCUMENT_UPLOAD_RULES = Object.freeze({
  maxBytes: 10 * 1024 * 1024,
  extensions: Object.freeze(['pdf', 'jpg', 'jpeg', 'png', 'xlsx', 'xls', 'csv']),
  accept: '.pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv'
});

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : '';
}

export function validateDocumentFile(file: Pick<File, 'name' | 'size'> | null): string | null {
  if (!file) {
    return 'Choose a file to upload.';
  }
  if (!DOCUMENT_UPLOAD_RULES.extensions.includes(extensionOf(file.name))) {
    return `Allowed file types: ${DOCUMENT_UPLOAD_RULES.extensions.join(', ').toUpperCase()}.`;
  }
  if (file.size <= 0) {
    return 'The selected file is empty.';
  }
  return file.size > DOCUMENT_UPLOAD_RULES.maxBytes
    ? `Files must be ${Math.round(DOCUMENT_UPLOAD_RULES.maxBytes / (1024 * 1024))} MB or smaller.`
    : null;
}
