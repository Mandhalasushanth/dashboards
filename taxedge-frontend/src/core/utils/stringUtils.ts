/** Words that stay upper-case when humanizing constants. */
const ACRONYMS: ReadonlySet<string> = new Set(['ca', 'gst', 'itr', 'kyc', 'emi']);

function formatWord(word: string, index: number): string {
  if (ACRONYMS.has(word)) {
    return word.toUpperCase();
  }
  return index === 0 ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : word;
}

/** "CA_OPERATIONS_VIEW" -> "CA operations view" */
export function humanizeConstant(value: string): string {
  return value.toLowerCase().split('_').filter(Boolean).map(formatWord).join(' ');
}

/** "Priya Sharma" -> "PS"; falls back to the first two characters of a single word. */
export function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}
