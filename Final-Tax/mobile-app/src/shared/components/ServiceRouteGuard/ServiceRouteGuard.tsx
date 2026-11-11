import { usePathname } from "expo-router";
import { serviceRouteNeedsProfile } from "@/shared/guards/serviceAccess";
import { useServiceProtection } from "@/shared/hooks/useServiceAccessGuard";

/**
 * Mounted once in the root layout. Whatever opened a `/service/*` screen (a tile, a deep link, a
 * notification, a saved draft), a user without the access the screen needs is redirected: to log
 * in, or to the Complete Profile prompt. Hub screens and the catalogue stay open (see serviceAccess).
 */
export function ServiceRouteGuard() {
  const pathname = usePathname();
  useServiceProtection(pathname, serviceRouteNeedsProfile(pathname));
  return null;
}

export default ServiceRouteGuard;
