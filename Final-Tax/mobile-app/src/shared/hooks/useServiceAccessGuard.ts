import { useCallback, useEffect } from "react";
import { useRouter, type Href } from "expo-router";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { decideServiceAccess, hrefPathname, isProfileComplete } from "@/shared/guards/serviceAccess";

/** Login state and profile completeness for the signed-in user, read from the auth store. */
function useAccessState() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const profileCompleted = useAuthStore((s) => s.profileCompleted);
  const isExistingUser = useAuthStore((s) => s.isExistingUser);
  const customerExists = useAuthStore((s) => s.customerExists);
  const customer = useAuthStore((s) => s.customer);
  const authenticatedUser = useAuthStore((s) => s.authenticatedUser);
  const openCompleteProfileModal = useAuthStore((s) => s.openCompleteProfileModal);

  const profileComplete = isProfileComplete({
    profileCompleted,
    isExistingUser,
    customerExists,
    customer,
    authenticatedUser,
  });

  return { isLoggedIn, isProfileComplete: profileComplete, openCompleteProfileModal };
}

/**
 * Navigation entry for services. `accessService(route)` is the single place that applies the
 * profile rule (see shared/guards/serviceAccess): browse / hub destinations open directly; any
 * other service needs a signed-in user with a complete profile, otherwise the user is sent to log
 * in or shown the Complete Profile prompt (which returns here afterwards).
 */
export function useServiceAccessGuard() {
  const router = useRouter();
  const { isLoggedIn, isProfileComplete: profileComplete, openCompleteProfileModal } = useAccessState();

  const accessService = useCallback(
    async (targetRoute: Href, params?: Record<string, string | number>): Promise<boolean> => {
      const decision = decideServiceAccess(targetRoute, { isLoggedIn, isProfileComplete: profileComplete });

      if (decision === "login") {
        router.push("/(auth)/login");
        return false;
      }

      if (decision === "complete-profile") {
        const routeToSave = typeof targetRoute === "string" ? targetRoute : targetRoute?.pathname || "/service/gst";
        openCompleteProfileModal(routeToSave);
        return false;
      }

      if (params) {
        router.push({ pathname: targetRoute, params } as Href);
      } else {
        router.push(targetRoute);
      }
      return true;
    },
    [isLoggedIn, profileComplete, openCompleteProfileModal, router]
  );

  return {
    accessService,
    isLoggedIn,
    profileCompleted: profileComplete,
  };
}

/**
 * Screen-level protection for a service screen that was opened directly (deep link, notification,
 * saved draft, back stack) rather than through `accessService`. When the user is not allowed in it
 * sends them to log in, or shows the Complete Profile prompt and leaves the screen.
 *
 * `route` is the screen's own path; `enabled` lets one caller (the root ServiceRouteGuard) switch
 * the check off for screens that are not service routes.
 */
export function useServiceProtection(route: Href | string, enabled = true) {
  const router = useRouter();
  const { isLoggedIn, isProfileComplete: profileComplete, openCompleteProfileModal } = useAccessState();
  const decision = enabled ? decideServiceAccess(route, { isLoggedIn, isProfileComplete: profileComplete }) : "allow";
  const path = hrefPathname(route);

  useEffect(() => {
    if (decision === "login") {
      router.replace("/(auth)/login");
    } else if (decision === "complete-profile") {
      openCompleteProfileModal(path);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(main)/home");
      }
    }
  }, [decision, path, openCompleteProfileModal, router]);

  return {
    isAuthorized: decision === "allow",
  };
}

export default useServiceAccessGuard;
