/**
 * Derives a clean display name from an email address or username.
 * Cuts the email domain and formats the username prefix.
 * e.g. "admin@gmail.com" -> "Admin"
 * e.g. "john.doe@gmail.com" -> "John Doe"
 * e.g. "sushanth@taxedge.com" -> "Sushanth"
 */
export function deriveDisplayNameFromUsername(username: string): string {
  if (!username) {
    return '';
  }
  const prefix = username.includes('@') ? username.split('@')[0] : username;
  if (!prefix) {
    return username;
  }
  const words = prefix
    .split(/[._-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  return words.length > 0 ? words.join(' ') : prefix;
}
