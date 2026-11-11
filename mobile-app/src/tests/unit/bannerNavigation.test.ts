/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const baseDir = process.cwd();
const read = (relative: string) => fs.readFileSync(path.join(baseDir, relative), "utf8");

interface BannerEntry {
  key: string;
  id: string;
  route: string;
  title: string;
  desc: string;
  cta: string;
}

function parseBanners(source: string): BannerEntry[] {
  const start = source.indexOf("export const APPLY_BANNERS");
  assert.ok(start !== -1, "export const APPLY_BANNERS must be present in home.tsx");
  const end = source.indexOf("] as const", start);
  assert.ok(end !== -1, "APPLY_BANNERS definition must end with '] as const'");
  const block = source.slice(start, end);

  const bannerRegex = /\{\s*key:\s*"([^"]+)",\s*id:\s*"([^"]+)",\s*route:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*desc:\s*"([^"]+)",\s*cta:\s*"([^"]+)"/g;
  const entries: BannerEntry[] = [];
  for (const match of block.matchAll(bannerRegex)) {
    entries.push({
      key: match[1],
      id: match[2],
      route: match[3],
      title: match[4],
      desc: match[5],
      cta: match[6],
    });
  }
  return entries;
}

function parseDashboardServices(source: string): Record<string, string | undefined> {
  const start = source.indexOf("export const DASHBOARD_SERVICES");
  const end = source.indexOf("];", start);
  const block = source.slice(start, end);

  return Object.fromEntries(
    [...block.matchAll(/id:\s*"([^"]+)"(?:,\s*label:\s*"[^"]+")?(?:,\s*image:\s*[^,}]+)?(?:,\s*route:\s*({[^}]+}|"[^"]+"))?/g)].map((m) => {
      let route: string | undefined;
      if (m[2]?.startsWith("{")) {
        route = m[2].match(/pathname:\s*"([^"]+)"/)?.[1];
      } else {
        route = m[2]?.replace(/^"|"$/g, "");
      }
      return [m[1], route];
    }),
  );
}

test("Banner Navigation — Every banner routes directly to its specific service/module screen", () => {
  const homeSource = read("src/app/(main)/home.tsx");
  const banners = parseBanners(homeSource);
  assert.equal(banners.length, 6, "Expected 6 promotional banners defined in home.tsx");

  const byKey = Object.fromEntries(banners.map((b) => [b.key, b]));

  // Test 1: GST banner
  assert.ok(byKey["b-gst"], "GST banner exists");
  assert.equal(byKey["b-gst"].route, "/service/gst", "GST banner routes directly to /service/gst");
  assert.notEqual(byKey["b-gst"].route, "/services", "GST banner must not route to generic /services");

  // Test 2: Incorporation / Company setup banner
  assert.ok(byKey["b-company"], "Company setup banner exists");
  assert.equal(
    byKey["b-company"].route,
    "/service/company-registration",
    "Company setup banner routes directly to /service/company-registration"
  );
  assert.notEqual(byKey["b-company"].route, "/services", "Company setup banner must not route to generic /services");

  // Test 3: ITR banner
  assert.ok(byKey["b-itr"], "ITR banner exists");
  assert.equal(byKey["b-itr"].route, "/service/itr", "ITR banner routes directly to /service/itr");
  assert.notEqual(byKey["b-itr"].route, "/services", "ITR banner must not route to generic /services");

  // Test 4: Loans banner
  assert.ok(byKey["b-loans"], "Loans banner exists");
  assert.equal(byKey["b-loans"].route, "/service/loans", "Loans banner routes directly to /service/loans");
  assert.notEqual(byKey["b-loans"].route, "/services", "Loans banner must not route to generic /services");

  // Insurance banner
  assert.ok(byKey["b-ins"], "Insurance banner exists");
  assert.equal(
    byKey["b-ins"].route,
    "/service/health-insurance",
    "Insurance banner routes directly to /service/health-insurance"
  );

  // Accounting banner
  assert.ok(byKey["b-acct"], "Accounting banner exists");
  assert.equal(
    byKey["b-acct"].route,
    "/service/accounting-bookkeeping",
    "Accounting banner routes directly to /service/accounting-bookkeeping"
  );

  // Verify NONE of the banners route to generic /services
  for (const banner of banners) {
    assert.notEqual(banner.route, "/services", `Banner ${banner.key} must not route to generic /services`);
    assert.ok(
      banner.route.startsWith("/service/"),
      `Banner ${banner.key} route '${banner.route}' must target a concrete service route under /service/`
    );
  }
});

test("Home Service Cards — Existing DASHBOARD_SERVICES navigation remains unchanged", () => {
  const homeSource = read("src/app/(main)/home.tsx");
  const byId = parseDashboardServices(homeSource);
  const banners = Object.fromEntries(parseBanners(homeSource).map((b) => [b.key, b.route]));

  // Test 5: Home -> GST service card
  assert.equal(byId["gst"], "/service/gst", "GST card navigates to /service/gst unchanged");

  // Test 6: Home -> Other service cards
  assert.equal(byId["incorporation"], "/service/company-registration", "Incorporation card navigates to /service/company-registration");
  assert.equal(byId["itr"], "/service/itr", "ITR card navigates to /service/itr");
  assert.equal(byId["loans"], "/service/loans", "Loans card navigates to /service/loans");

  // Banner routes match corresponding service card routes
  assert.equal(byId["gst"], banners["b-gst"], "GST banner route matches GST card route");
  assert.equal(byId["incorporation"], banners["b-company"], "Company banner route matches Incorporation card route");
  assert.equal(byId["itr"], banners["b-itr"], "ITR banner route matches ITR card route");
  assert.equal(byId["loans"], banners["b-loans"], "Loans banner route matches Loans card route");
});

test("Home Screen Code Inspection — Banner carousel handler directly calls accessService", () => {
  const homeSource = read("src/app/(main)/home.tsx");

  // Test 7: Verify generic Finsolz Services screen is no longer reached through Home banner CTAs
  assert.equal(
    homeSource.includes("onSelect={handleExploreCategory}"),
    false,
    "ApplyBannerCarousel must not use handleExploreCategory"
  );
  assert.ok(
    homeSource.includes("onSelect={handleBannerSelect}"),
    "ApplyBannerCarousel must use handleBannerSelect"
  );
  assert.ok(
    homeSource.includes("accessService(banner.route)"),
    "handleBannerSelect must forward banner.route to accessService"
  );
});

test("Carousel Component Inspection — Passes banner object with route to onSelect handler", () => {
  const carouselSource = read("src/components/screens/home/ApplyBannerCarousel.tsx");
  assert.ok(
    carouselSource.includes("onSelect: (banner: ApplyBanner) => void"),
    "ApplyBannerCarousel onSelect prop expects (banner: ApplyBanner) => void"
  );
  assert.ok(
    carouselSource.includes("onPress={() => onSelect(banner)}"),
    "ApplyBannerCarousel onPress calls onSelect with banner object"
  );
  assert.ok(
    carouselSource.includes("route: Href"),
    "ApplyBanner interface declares route: Href"
  );
});

test("Permanent Deletion — Generic Finsolz Services screen and styles are permanently deleted", () => {
  assert.equal(
    fs.existsSync(path.join(baseDir, "src/app/services.tsx")),
    false,
    "src/app/services.tsx must not exist"
  );
  assert.equal(
    fs.existsSync(path.join(baseDir, "src/styles/app/services.styles.ts")),
    false,
    "src/styles/app/services.styles.ts must not exist"
  );
});

test("Zero Orphan References — No production screen or navigation handler routes to /services", () => {
  const productionFiles = [
    "src/app/(main)/home.tsx",
    "src/modules/applications/screens/ActiveApplications/ActiveApplicationsScreen.tsx",
    "src/modules/payments/screens/PaymentOverviewScreen.tsx",
    "src/shared/guards/serviceAccess.ts",
  ];

  for (const file of productionFiles) {
    const content = read(file);
    assert.equal(
      content.includes('"/services"'),
      false,
      `${file} must not contain any reference to "/services"`
    );
  }
});
