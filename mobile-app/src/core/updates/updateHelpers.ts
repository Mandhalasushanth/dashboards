/**
 * Route prefixes where active user input, payments, or file uploads happen.
 * We strictly avoid prompting or restarting during these workflows.
 */
export const BUSY_ROUTE_PREFIXES = [
  "/service/",
  "/payment/",
  "/application/",
  "/chat/",
  "/(auth)/",
] as const;

/**
 * Returns true if the user is currently on an active form or transaction screen
 * where showing an update banner or reloading would disrupt unsaved work.
 */
export function isRouteBusy(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return BUSY_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

