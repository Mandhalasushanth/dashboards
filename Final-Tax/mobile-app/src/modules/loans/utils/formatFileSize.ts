/** "512 B", "2.0 KB", "2.5 MB": a short human-readable file size. */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return mb % 1 === 0 ? `${mb.toFixed(0)} MB` : `${mb.toFixed(1)} MB`;
}
