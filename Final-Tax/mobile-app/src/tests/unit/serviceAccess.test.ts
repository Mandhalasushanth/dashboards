/// <reference types="node" />
/**
 * BUG-HOME-001: one profile-completion rule for every way into a service.
 * Run with: node scripts/run-auth-lockout-tests.cjs src/tests/unit/serviceAccess.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  PROFILE_EXEMPT_PATHS,
  decideServiceAccess,
  hrefPathname,
  isProfileComplete,
  isProfileGateExempt,
  serviceRouteNeedsProfile,
  type ProfileCompletionInput,
} from "../../shared/guards/serviceAccess";
import { SERVICES } from "../../data/services";
import { SERVICE_CATALOGUE } from "../../data/catalogue";

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), "utf8");

const SIGNED_IN_INCOMPLETE = { isLoggedIn: true, isProfileComplete: false };
const SIGNED_IN_COMPLETE = { isLoggedIn: true, isProfileComplete: true };
const SIGNED_OUT = { isLoggedIn: false, isProfileComplete: false };

// ===============================================================================================
// The completeness rule itself is unchanged
// ===============================================================================================

/** The rule exactly as it was written in useServiceAccessGuard before this batch (copied from HEAD). */
function previousRule(input: ProfileCompletionInput): boolean {
  const { customer, authenticatedUser } = input;
  const rawName = customer?.name || authenticatedUser?.name || "";
  const hasValidName = Boolean(
    rawName &&
      rawName.trim() !== "" &&
      rawName.toLowerCase() !== "valued client" &&
      rawName.toLowerCase() !== "client" &&
      rawName.toLowerCase() !== "valued",
  );
  const hasCustomerId = Boolean(
    (customer?.customerId && customer.customerId.trim() !== "") ||
      (authenticatedUser?.customerId && authenticatedUser.customerId.trim() !== ""),
  );
  const hasPanOrAadhaar = Boolean(
    (customer?.pan && customer.pan.trim() !== "") ||
      (customer?.aadhaar && customer.aadhaar.trim() !== "") ||
      (authenticatedUser?.pan && authenticatedUser.pan.trim() !== "") ||
      (authenticatedUser?.aadhaar && authenticatedUser.aadhaar.trim() !== ""),
  );
  return Boolean(
    (hasValidName &&
      (input.profileCompleted ||
        customer?.profileCompleted ||
        authenticatedUser?.registrationCompleted ||
        input.isExistingUser ||
        input.customerExists)) ||
      (hasValidName && hasCustomerId) ||
      (hasValidName && hasPanOrAadhaar),
  );
}

test("the extracted completeness rule gives the same answer as the original for every combination", () => {
  const names: (string | undefined)[] = [undefined, "", "   ", "Valued Client", "CLIENT", "valued", "Asha Rao", "Priya"];
  const flag = [false, true];
  const text: (string | undefined)[] = [undefined, "", "  ", "X1"];
  let checked = 0;
  for (const customerName of names) {
    for (const userName of [undefined, "Asha Rao"]) {
      for (const profileCompleted of flag) {
        for (const customerProfileCompleted of flag) {
          for (const registrationCompleted of flag) {
            for (const isExistingUser of flag) {
              for (const customerExists of flag) {
                for (const customerId of text) {
                  for (const pan of text) {
                    for (const userAadhaar of text) {
                      const input: ProfileCompletionInput = {
                        profileCompleted,
                        isExistingUser,
                        customerExists,
                        customer: { name: customerName, profileCompleted: customerProfileCompleted, customerId, pan },
                        authenticatedUser: { name: userName, registrationCompleted, aadhaar: userAadhaar },
                      };
                      assert.equal(isProfileComplete(input), previousRule(input), JSON.stringify(input));
                      checked++;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  assert.equal(checked, 8 * 2 * 32 * 64);
});

test("completeness basics: a real name plus a stored-customer signal is complete; placeholders and anonymous are not", () => {
  const base = { profileCompleted: false, isExistingUser: false, customerExists: false, customer: null, authenticatedUser: null };
  assert.equal(isProfileComplete(base), false);
  assert.equal(isProfileComplete({ ...base, customer: { name: "Asha" } }), false, "a name alone proves nothing");
  assert.equal(isProfileComplete({ ...base, profileCompleted: true, customer: { name: "Asha" } }), true);
  assert.equal(isProfileComplete({ ...base, customer: { name: "Asha", customerId: "CUST-1" } }), true);
  assert.equal(isProfileComplete({ ...base, authenticatedUser: { name: "Asha", pan: "ABCPE1234F" } }), true);
  assert.equal(isProfileComplete({ ...base, profileCompleted: true, customer: { name: "Valued Client" } }), false);
  assert.equal(isProfileComplete({ ...base, profileCompleted: true }), false, "flags without a name");
  assert.equal(isProfileComplete({ ...base, customerExists: true, authenticatedUser: { name: "Asha" } }), true);
});

// ===============================================================================================
// Which destinations are exempt
// ===============================================================================================

test("hrefPathname reads strings and objects and ignores query, hash and a trailing slash", () => {
  assert.equal(hrefPathname("/service/loans"), "/service/loans");
  assert.equal(hrefPathname("/service/loans/"), "/service/loans");
  assert.equal(hrefPathname("/service/loans?selectedCategory=BUSINESS"), "/service/loans");
  assert.equal(hrefPathname("/service/gst#top"), "/service/gst");
  assert.equal(hrefPathname({ pathname: "/service/loans", params: { selectedCategory: "BUSINESS" } }), "/service/loans");
  assert.equal(hrefPathname("/"), "/");
});

test("the exempt destinations are exactly the three hubs", () => {
  assert.deepEqual([...PROFILE_EXEMPT_PATHS].sort(), ["/service/gst", "/service/itr", "/service/loans"]);
});

// ===============================================================================================
// Each service entry point
// ===============================================================================================

const decisions: { name: string; href: string | { pathname: string; params: Record<string, string> }; incomplete: string; complete: string }[] = [
  { name: "GST hub", href: "/service/gst", incomplete: "allow", complete: "allow" },
  { name: "ITR hub", href: "/service/itr", incomplete: "allow", complete: "allow" },
  { name: "Loans hub", href: "/service/loans", incomplete: "allow", complete: "allow" },
  { name: "Projects tile (loans hub, project-finance)", href: { pathname: "/service/loans", params: { category: "project-finance" } }, incomplete: "allow", complete: "allow" },
  { name: "Incorporation", href: "/service/company-registration", incomplete: "complete-profile", complete: "allow" },
  { name: "GST registration (inside GST)", href: "/service/gst-registration", incomplete: "complete-profile", complete: "allow" },
  { name: "GST filing", href: "/service/gst-filing", incomplete: "complete-profile", complete: "allow" },
  { name: "ITR filing (inside ITR)", href: "/service/itr-filing", incomplete: "complete-profile", complete: "allow" },
  { name: "TDS refund", href: "/service/tds-refund", incomplete: "complete-profile", complete: "allow" },
  { name: "Personal loan", href: "/service/personal-loan", incomplete: "complete-profile", complete: "allow" },
  { name: "Business loan", href: "/service/business-loan", incomplete: "complete-profile", complete: "allow" },
  { name: "Health insurance (service)", href: "/service/health-insurance", incomplete: "complete-profile", complete: "allow" },
  { name: "Accounting & bookkeeping", href: "/service/accounting-bookkeeping", incomplete: "complete-profile", complete: "allow" },
];

test("every entry point resolves to one decision, whichever screen it is opened from", () => {
  for (const d of decisions) {
    assert.equal(decideServiceAccess(d.href as string, SIGNED_IN_INCOMPLETE), d.incomplete, `${d.name} (incomplete profile)`);
    assert.equal(decideServiceAccess(d.href as string, SIGNED_IN_COMPLETE), d.complete, `${d.name} (complete profile)`);
  }
});

test("a signed-out user is sent to log in for services but may still reach the open destinations", () => {
  assert.equal(decideServiceAccess("/service/company-registration", SIGNED_OUT), "login");
  assert.equal(decideServiceAccess("/service/gst-registration", SIGNED_OUT), "login");
  assert.equal(decideServiceAccess("/service/gst", SIGNED_OUT), "allow");
});

test("a complete profile is never blocked", () => {
  for (const d of decisions) {
    assert.equal(decideServiceAccess(d.href as string, SIGNED_IN_COMPLETE), "allow", d.name);
  }
});

test("every service in the catalogue data is gated unless it is a hub", () => {
  assert.ok(SERVICES.length > 5);
  for (const service of SERVICES) {
    const route = `/service/${service.id}`;
    assert.equal(
      decideServiceAccess(route, SIGNED_IN_INCOMPLETE),
      isProfileGateExempt(route) ? "allow" : "complete-profile",
      route,
    );
    assert.equal(isProfileGateExempt(route), ["gst", "itr", "loans"].includes(service.id), route);
  }
});

test("every More Services row either opens a gated service or the category hub", () => {
  const hubMap: Record<string, string> = {
    GST: "/service/gst",
    ITR: "/service/itr",
    LOANS: "/service/loans",
    INSURANCE: "/service/health-insurance",
    BUSINESS: "/service/company-registration",
  };
  const rows = SERVICE_CATALOGUE.flatMap((section) => section.items.map((item) => ({ section: section.id, item })));
  assert.ok(rows.length > 10);
  for (const { section, item } of rows) {
    const href = item.serviceId ? `/service/${item.serviceId}` : hubMap[section];
    const decision = decideServiceAccess(href as string, SIGNED_IN_INCOMPLETE);
    assert.equal(decision, item.serviceId || ["INSURANCE", "BUSINESS"].includes(section) ? "complete-profile" : "allow", item.label);
  }
});

// ===============================================================================================
// Direct navigation (deep links, notifications, drafts, back stack)
// ===============================================================================================

test("every service route file is protected on direct navigation except the three hubs", () => {
  const files = fs
    .readdirSync(path.join(process.cwd(), "src/app/service"))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.replace(/\.tsx$/, ""));
  assert.ok(files.length > 40);
  const open = files.filter((f) => !serviceRouteNeedsProfile(`/service/${f}`)).sort();
  assert.deepEqual(open, ["gst", "itr", "loans"]);
  for (const f of files.filter((name) => !open.includes(name))) {
    assert.equal(decideServiceAccess(`/service/${f}`, SIGNED_IN_INCOMPLETE), "complete-profile", f);
    assert.equal(decideServiceAccess(`/service/${f}`, SIGNED_OUT), "login", f);
    assert.equal(decideServiceAccess(`/service/${f}`, SIGNED_IN_COMPLETE), "allow", f);
  }
});

test("a service route added later is protected by default", () => {
  assert.equal(serviceRouteNeedsProfile("/service/some-new-service"), true);
  assert.equal(serviceRouteNeedsProfile("/service/[id]"), true);
  assert.equal(serviceRouteNeedsProfile("/service/gst-registration/"), true);
});

test("screens outside /service/ are not touched by the route guard", () => {
  for (const p of ["/", "/(main)/home", "/settings", "/application/123", "/payment/9", "/notifications", "/(auth)/login", "/service"]) {
    assert.equal(serviceRouteNeedsProfile(p), false, p);
  }
});

// ===============================================================================================
// The wiring: one rule, used everywhere
// ===============================================================================================

test("Home screen sends every tile through accessService instead of keeping its own exemption lists", () => {
  for (const file of ["src/app/(main)/home.tsx"]) {
    const source = read(file);
    assert.equal(/tile\.route === "\/service\//.test(source), false, `${file} must not hard-code exemptions`);
    assert.equal(source.includes('tile.route === "/services"'), false, file);
    assert.ok(source.includes("if (tile.route) accessService(tile.route);"), file);
  }
});

test("the live Home dashboard tiles resolve consistently", () => {
  const source = read("src/app/(main)/home.tsx");
  const block = source.slice(source.indexOf("export const DASHBOARD_SERVICES"), source.indexOf("];", source.indexOf("export const DASHBOARD_SERVICES")));
  const byId: Record<string, string | undefined> = Object.fromEntries(
    [...block.matchAll(/\{ id: "(\w+)"[^\n]*?\}(?:,|\n)/g)].map((m) => {
      const line = m[0];
      const route = /route: "([^"]+)"/.exec(line)?.[1] ?? /pathname: "([^"]+)"/.exec(line)?.[1];
      return [m[1], route];
    }),
  );
  assert.equal(Object.keys(byId).length, 7);
  const routeOf = (id: string): string | undefined => byId[id]; // deepEqual below narrows byId to its literal
  assert.deepEqual(byId, {
    incorporation: "/service/company-registration",
    gst: "/service/gst",
    itr: "/service/itr",
    projects: "/service/loans",
    loans: "/service/loans",
    insurance: "/service/health-insurance",
    business: "/service/accounting-bookkeeping",
  });
  const expected: Record<string, string> = {
    incorporation: "complete-profile",
    gst: "allow",
    itr: "allow",
    projects: "allow",
    loans: "allow",
    insurance: "complete-profile",
    business: "complete-profile",
  };
  for (const [id, decision] of Object.entries(expected)) {
    assert.equal(decideServiceAccess(routeOf(id) as string, SIGNED_IN_INCOMPLETE), decision, id);
  }
});

test("the hubs and the guard hooks all use the shared decision", () => {
  const hook = read("src/shared/hooks/useServiceAccessGuard.ts");
  assert.ok(hook.includes("decideServiceAccess"));
  assert.ok(hook.includes("isProfileComplete({"));
  assert.equal(hook.match(/rawName/g), null, "the completeness rule is no longer copied into the hook");
  for (const file of [
    "src/modules/gst/screens/GstScreen/GstScreen.tsx",
    "src/modules/itr/screens/ItrScreen/ItrScreen.tsx",
  ]) {
    assert.ok(read(file).includes("accessService("), `${file} still opens services through accessService`);
  }
});

test("the root layout mounts the route guard once, next to the profile prompt", () => {
  const layout = read("src/app/_layout.tsx");
  assert.equal((layout.match(/<ServiceRouteGuard \/>/g) || []).length, 1);
  assert.ok(layout.indexOf("<ServiceRouteGuard />") < layout.indexOf("<CompleteProfileModal />"));
  const guard = read("src/shared/components/ServiceRouteGuard/ServiceRouteGuard.tsx");
  assert.ok(guard.includes("useServiceProtection(pathname, serviceRouteNeedsProfile(pathname))"));
});
