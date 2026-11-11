import type { Href } from "expo-router";

/**
 * The one definition of which service destinations need a completed profile.
 *
 * Hub destinations are open to any signed-in user: the GST, ITR and Loans hub screens. A hub only lists
 * services; every service you can start from it is a leaf route and does need a complete profile, as does
 * every other `/service/*` route (company registration, insurance, project finance, ...).
 * This is the rule the Home screens already applied to the GST / ITR / Loans tiles; it is
 * written down here so every entry point shares it.
 */
export const PROFILE_EXEMPT_PATHS: readonly string[] = ["/service/gst", "/service/itr", "/service/loans"];

/** Pathname of an expo-router href (string or `{ pathname, params }`), without query, hash or trailing slash. */
export function hrefPathname(href: Href | string): string {
  const raw = typeof href === "string" ? href : String(href.pathname ?? "");
  const path = raw.split(/[?#]/)[0];
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/** True for destinations that never require a completed profile. */
export function isProfileGateExempt(href: Href | string): boolean {
  return PROFILE_EXEMPT_PATHS.includes(hrefPathname(href));
}

/** True when a screen at this pathname is a service screen that needs a completed profile. */
export function serviceRouteNeedsProfile(pathname: string): boolean {
  const path = hrefPathname(pathname);
  return path.startsWith("/service/") && !isProfileGateExempt(path);
}

export type ServiceAccessDecision = "allow" | "login" | "complete-profile";

/** What to do when the user tries to open `href`: let them in, send them to log in, or ask for the profile. */
export function decideServiceAccess(
  href: Href | string,
  state: { isLoggedIn: boolean; isProfileComplete: boolean },
): ServiceAccessDecision {
  if (isProfileGateExempt(href)) return "allow";
  if (!state.isLoggedIn) return "login";
  return state.isProfileComplete ? "allow" : "complete-profile";
}

// ---- profile completion ----------------------------------------------------------------------------

interface ProfileIdentity {
  name?: string | null;
  customerId?: string | null;
  pan?: string | null;
  aadhaar?: string | null;
}

export interface ProfileCompletionInput {
  /** Auth-store flags. */
  profileCompleted: boolean;
  isExistingUser: boolean;
  customerExists: boolean;
  customer: (ProfileIdentity & { profileCompleted?: boolean }) | null;
  authenticatedUser: (ProfileIdentity & { registrationCompleted?: boolean }) | null;
}

const PLACEHOLDER_NAMES = ["valued client", "client", "valued"];

const filled = (value?: string | null): boolean => Boolean(value && value.trim() !== "");

/**
 * Whether the signed-in user has a real profile: a real (non-placeholder) name together with any
 * proof of a stored customer record: a completed-profile flag, a customer id, or PAN / Aadhaar.
 */
export function isProfileComplete(input: ProfileCompletionInput): boolean {
  const { customer, authenticatedUser } = input;

  const rawName = customer?.name || authenticatedUser?.name || "";
  const hasValidName = filled(rawName) && !PLACEHOLDER_NAMES.includes(rawName.toLowerCase());
  if (!hasValidName) return false;

  const hasCustomerId = filled(customer?.customerId) || filled(authenticatedUser?.customerId);
  const hasPanOrAadhaar =
    filled(customer?.pan) || filled(customer?.aadhaar) || filled(authenticatedUser?.pan) || filled(authenticatedUser?.aadhaar);
  const flaggedComplete = Boolean(
    input.profileCompleted ||
      customer?.profileCompleted ||
      authenticatedUser?.registrationCompleted ||
      input.isExistingUser ||
      input.customerExists,
  );

  return flaggedComplete || hasCustomerId || hasPanOrAadhaar;
}
