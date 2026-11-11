/**
 * DEVELOPMENT ONLY. The demo backend has no file storage, so seeded documents get a generated preview
 * image that is clearly labelled as a sample. Files uploaded during the session are kept as in-memory
 * object URLs so "View" shows the real file. Loaded only through the dev-guarded demo store.
 */
const uploadedFiles = new Map<string, string>();

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);

/** A simple A4-proportioned page naming the document, the customer and who uploaded it. */
export function samplePreviewUrl(label: string, customer: string, uploadedBy: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="595" height="842" viewBox="0 0 595 842">
<rect width="595" height="842" fill="#FFFFFF"/>
<rect x="0" y="0" width="595" height="96" fill="#083B75"/>
<text x="40" y="58" font-family="Segoe UI, Arial" font-size="26" font-weight="700" fill="#FFFFFF">${escapeXml(label)}</text>
<text x="40" y="150" font-family="Segoe UI, Arial" font-size="16" fill="#64748B">Customer</text>
<text x="40" y="176" font-family="Segoe UI, Arial" font-size="20" font-weight="600" fill="#172033">${escapeXml(customer)}</text>
<text x="40" y="226" font-family="Segoe UI, Arial" font-size="16" fill="#64748B">Uploaded by</text>
<text x="40" y="252" font-family="Segoe UI, Arial" font-size="20" font-weight="600" fill="#172033">${escapeXml(uploadedBy)}</text>
<rect x="40" y="300" width="515" height="420" rx="8" fill="#F7F9FC" stroke="#E2E8F0"/>
<text x="297" y="500" text-anchor="middle" font-family="Segoe UI, Arial" font-size="18" fill="#94A3B8">Sample preview (demo data)</text>
<text x="297" y="528" text-anchor="middle" font-family="Segoe UI, Arial" font-size="14" fill="#94A3B8">The real file appears here once it is stored on the server</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function rememberUploadedFile(documentId: string, file: File): void {
  const previous = uploadedFiles.get(documentId);
  if (previous) URL.revokeObjectURL(previous);
  uploadedFiles.set(documentId, URL.createObjectURL(file));
}

/** File types the customer app uploads, recognised from the first bytes of the base64 text. */
const BASE64_TYPES: readonly (readonly [string, string, string])[] = [
  ['/9j/', 'image/jpeg', 'jpg'],
  ['iVBOR', 'image/png', 'png'],
  ['JVBER', 'application/pdf', 'pdf']
];

/** The file name extension for a backend file, so the document list shows what kind of file it is. */
export function base64Extension(base64: string): string {
  return BASE64_TYPES.find(([prefix]) => base64.startsWith(prefix))?.[2] ?? 'bin';
}

/** Backend files waiting to be opened; decoding megabytes of base64 for every list would slow every page. */
const pendingFiles = new Map<string, string>();

export function rememberBase64File(documentId: string, base64: string): void {
  if (uploadedFiles.has(documentId)) return;
  pendingFiles.set(documentId, base64);
}

/** The file's link, decoded the first time it is asked for (when the document is opened) and reused after. */
export function uploadedFileUrl(documentId: string): string | undefined {
  const ready = uploadedFiles.get(documentId);
  if (ready) return ready;
  const base64 = pendingFiles.get(documentId);
  if (!base64) return undefined;
  const type = BASE64_TYPES.find(([prefix]) => base64.startsWith(prefix))?.[1] ?? 'application/octet-stream';
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  uploadedFiles.set(documentId, url);
  pendingFiles.delete(documentId);
  return url;
}
