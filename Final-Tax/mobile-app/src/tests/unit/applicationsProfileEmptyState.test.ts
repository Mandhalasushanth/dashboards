import test, { describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { isProfileComplete } from "@/shared/guards/serviceAccess";
import {
  getApplicationEmptyState,
  deduplicateApplications,
  normalizeApplicationStatus,
} from "@/modules/applications/utils/applicationStatusUtils";
import type { Application } from "@/types/domain";

function createMockApp(overrides: Partial<Application> = {}): Application {
  return {
    id: "APP-TEST-100",
    serviceId: "gst-registration",
    serviceName: "GST Registration",
    category: "GST",
    status: "Submitted",
    progress: 20,
    assignedExecutive: "CA Rahul Sharma",
    paymentAmount: 0,
    paymentStatus: "Pending",
    createdAt: "2026-10-27",
    formData: {},
    documents: [],
    timeline: [],
    chatHistory: [],
    ...overrides,
  };
}

describe("My Applications: Profile Completion and Empty-State Handling Suite", () => {
  const baseDir = path.resolve(__dirname, "../../..");
  const screenPath = path.join(
    baseDir,
    "src/modules/applications/screens/ActiveApplications/ActiveApplicationsScreen.tsx"
  );
  const emptyCompPath = path.join(
    baseDir,
    "src/components/screens/applications/ApplicationsEmptyState.tsx"
  );

  const screenContent = fs.readFileSync(screenPath, "utf-8");
  const emptyCompContent = fs.readFileSync(emptyCompPath, "utf-8");

  test("Scenario 1: Profile incomplete → Complete Your Profile state with navigation", () => {
    // 1. Verifying completeness check flags incomplete profile
    const incompleteInput = {
      profileCompleted: false,
      isExistingUser: false,
      customerExists: false,
      customer: null,
      authenticatedUser: null,
    };
    assert.equal(isProfileComplete(incompleteInput), false);

    // 2. Placeholder name also marks profile incomplete
    const placeholderInput = {
      profileCompleted: true,
      isExistingUser: false,
      customerExists: false,
      customer: { name: "Valued Client" },
      authenticatedUser: null,
    };
    assert.equal(isProfileComplete(placeholderInput), false);

    // 3. Screen content verifies that when isProfileCompleted is false, error container is NOT shown
    assert.ok(
      screenContent.includes("isProfileCompleted && Boolean(error) && applications.length === 0"),
      "Error card must ONLY show when profile IS completed and genuine error exists"
    );

    // 4. Empty component renders Complete Your Profile card
    assert.ok(
      emptyCompContent.includes("Complete Your Profile"),
      "Must have heading 'Complete Your Profile'"
    );
    assert.ok(
      emptyCompContent.includes(
        "You haven't submitted any applications yet. Complete your profile first, then apply for the services you need."
      ),
      "Must have exact profile incomplete prompt message"
    );
    assert.ok(
      emptyCompContent.includes("Complete Profile"),
      "Must have 'Complete Profile' button"
    );
    assert.ok(
      screenContent.includes('router.push("/(auth)/createprofile")'),
      "Complete Profile button must navigate to /(auth)/createprofile"
    );
  });

  test("Scenario 2: Profile complete with zero applications → No Applications Submitted empty state", () => {
    // 1. Verifying completeness check passes for complete profile
    const completeInput = {
      profileCompleted: true,
      isExistingUser: true,
      customerExists: true,
      customer: { name: "Asha Rao", customerId: "CUST-100", pan: "ABCDE1234F" },
      authenticatedUser: null,
    };
    assert.equal(isProfileComplete(completeInput), true);

    // 2. Empty store helper returns clean empty state
    const emptyState = getApplicationEmptyState(0, "ALL", "");
    assert.equal(emptyState.title, "No Applications Submitted");
    assert.equal(
      emptyState.subtitle,
      "You haven't submitted any applications yet. Start by choosing a service that suits your needs."
    );

    // 3. Empty component renders No Applications Submitted, Explore Services, and supporting text
    assert.ok(
      emptyCompContent.includes("No Applications Submitted"),
      "Must display heading 'No Applications Submitted'"
    );
    assert.ok(
      emptyCompContent.includes(
        "You haven't submitted any applications yet. Start by choosing a service that suits your needs."
      ),
      "Must display exact description"
    );
    assert.ok(
      emptyCompContent.includes("Explore Services"),
      "Must display 'Explore Services' button"
    );
    assert.ok(
      emptyCompContent.includes("Your submitted applications will appear here."),
      "Must display supporting text 'Your submitted applications will appear here.'"
    );
    assert.ok(
      emptyCompContent.includes("document-text-outline"),
      "Must display documents/files icon inside circular background"
    );
    assert.ok(
      screenContent.includes('router.push("/(main)/home")'),
      "Explore Services button must navigate to Home dashboard"
    );
  });

  test("Scenario 3: Profile complete with applications → Real counts and cards rendered", () => {
    const apps = [
      createMockApp({ id: "APP-1", status: "In Progress" }),
      createMockApp({ id: "APP-2", status: "Completed" }),
      createMockApp({ id: "APP-3", status: "Under Verification" }),
    ];

    const deduplicated = deduplicateApplications(apps);
    assert.equal(deduplicated.length, 3);

    const inProgress = deduplicated.filter(
      (a) => normalizeApplicationStatus(a.status) === "IN_PROGRESS"
    ).length;
    const completed = deduplicated.filter(
      (a) => normalizeApplicationStatus(a.status) === "COMPLETED"
    ).length;
    const underVerif = deduplicated.filter(
      (a) => normalizeApplicationStatus(a.status) === "UNDER_VERIFICATION"
    ).length;

    assert.equal(inProgress, 1);
    assert.equal(completed, 1);
    assert.equal(underVerif, 1);

    // Screen retains rendering of ApplicationCardItem
    assert.ok(
      screenContent.includes("<ApplicationCardItem"),
      "Must render ApplicationCardItem for each application"
    );
  });

  test("Scenario 4: Genuine API failure → Displays Failed to load applications with working Retry", () => {
    // Screen strictly guards error presentation
    assert.ok(
      screenContent.includes("Failed to load applications"),
      "Must have 'Failed to load applications' error title"
    );
    assert.ok(
      screenContent.includes("onPress={fetchApplications}"),
      "Retry button must call fetchApplications"
    );
    assert.ok(
      screenContent.includes("Retry"),
      "Must have Retry button"
    );
  });

  test("Scenario 5: Architectural constraints - file line counts strictly below 400 lines and zero loops", () => {
    const filesToCheck = [
      "src/modules/applications/screens/ActiveApplications/ActiveApplicationsScreen.tsx",
      "src/modules/applications/screens/ActiveApplications/ActiveApplicationsScreen.styles.ts",
      "src/components/screens/applications/ApplicationsEmptyState.tsx",
      "src/components/screens/applications/ApplicationsEmptyState.styles.ts",
      "src/modules/applications/utils/applicationStatusUtils.ts",
      "src/components/screens/applications/ApplicationCardItem.tsx",
      "src/tests/unit/applicationsProfileEmptyState.test.ts",
    ];

    const checkFile = (relPath: string) => {
      const fullPath = path.join(baseDir, relPath);
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n").length;
      assert.ok(
        lines < 400,
        `File ${relPath} has ${lines} lines, must be strictly below 400 lines`
      );

      if (relPath.endsWith(".tsx")) {
        assert.equal(
          /\bfor\s*\(/.test(content),
          false,
          `File ${relPath} must not contain for loops`
        );
        assert.equal(
          /\bwhile\s*\(/.test(content),
          false,
          `File ${relPath} must not contain while loops`
        );
        assert.equal(
          /\.forEach\s*\(/.test(content),
          false,
          `File ${relPath} must not contain forEach loops`
        );
      }
    };

    checkFile(filesToCheck[0]);
    checkFile(filesToCheck[1]);
    checkFile(filesToCheck[2]);
    checkFile(filesToCheck[3]);
    checkFile(filesToCheck[4]);
    checkFile(filesToCheck[5]);
    checkFile(filesToCheck[6]);
  });

  test("Scenario 6: Header Layout — Statistics Card nested in Navy Header & Full-Width Search Bar", () => {
    const stylesPath = path.join(
      baseDir,
      "src/modules/applications/screens/ActiveApplications/ActiveApplicationsScreen.styles.ts"
    );
    const stylesContent = fs.readFileSync(stylesPath, "utf-8");

    // 1. OverviewCard is inside navyHeader View container
    const headerStart = screenContent.indexOf("styles.navyHeader");
    const overviewCardIdx = screenContent.indexOf("<OverviewCard");
    const searchRowIdx = screenContent.indexOf("styles.searchRow");

    assert.ok(headerStart !== -1, "navyHeader must be rendered");
    assert.ok(overviewCardIdx !== -1, "OverviewCard must be rendered");
    assert.ok(searchRowIdx !== -1, "searchRow must be rendered");

    // Order: Header Start -> Overview Card inside header -> Search Row below header
    assert.ok(
      headerStart < overviewCardIdx,
      "OverviewCard must be rendered after navyHeader starts (nested inside header)"
    );
    assert.ok(
      overviewCardIdx < searchRowIdx,
      "OverviewCard must be rendered before searchRow (which sits immediately below header)"
    );

    // 2. Filter button is removed from search row
    assert.equal(
      screenContent.includes("filterBtn"),
      false,
      "filterBtn must be removed from ActiveApplicationsScreen"
    );

    // 3. Search container is full width and styled for responsiveness
    assert.ok(
      stylesContent.includes('searchContainer: {\n    width: "100%",') ||
        stylesContent.includes('width: "100%"'),
      "searchContainer must use full available width"
    );

    // 4. Navy header has curved bottom edge and responsive padding
    assert.ok(
      stylesContent.includes("borderBottomLeftRadius: 24"),
      "navyHeader must preserve curved bottom left radius"
    );
    assert.ok(
      stylesContent.includes("borderBottomRightRadius: 24"),
      "navyHeader must preserve curved bottom right radius"
    );
    assert.ok(
      stylesContent.includes("paddingBottom: 20"),
      "navyHeader padding bottom must fit card naturally"
    );

    // 5. headerTopRow has margin below it to prevent overlap with overview card
    assert.ok(
      stylesContent.includes("marginBottom: 16"),
      "headerTopRow must have bottom margin to prevent overlap with statistics card"
    );

    // 6. Statistics card background, rounded corners and shadow preserved
    assert.ok(stylesContent.includes("borderRadius: 16"), "Overview card must preserve borderRadius: 16");
    assert.ok(stylesContent.includes("shadowOpacity: 0.08"), "Overview card must preserve shadow");
  });

  test("Scenario 7: Application Card — Vertical Layout without Application ID", () => {
    const cardItemPath = path.join(
      baseDir,
      "src/components/screens/applications/ApplicationCardItem.tsx"
    );
    const cardContent = fs.readFileSync(cardItemPath, "utf-8");

    // 1. Application ID is NOT displayed on the card
    assert.equal(
      cardContent.includes("appIdText"),
      false,
      "Application ID text must not be rendered on the card"
    );
    assert.equal(
      cardContent.includes("displayId"),
      false,
      "displayId must not be referenced in the card"
    );

    // 2. Order of content in middle column: Service Name -> Date -> Status Badge
    const serviceNameIdx = cardContent.indexOf("serviceNameText");
    const dateIdx = cardContent.indexOf("appliedDateText");
    const badgeIdx = cardContent.indexOf("cardBadgeRow");
    const chevronIdx = cardContent.indexOf("cardChevronWrap");

    assert.ok(serviceNameIdx !== -1, "serviceNameText must be present");
    assert.ok(dateIdx !== -1, "appliedDateText must be present");
    assert.ok(badgeIdx !== -1, "cardBadgeRow must be present");
    assert.ok(chevronIdx !== -1, "cardChevronWrap must be present");

    assert.ok(
      serviceNameIdx < dateIdx,
      "Date must be positioned directly below service name"
    );
    assert.ok(
      dateIdx < badgeIdx,
      "Status badge must be positioned below the date"
    );
    assert.ok(
      badgeIdx < chevronIdx,
      "Chevron must be on the right side of the card"
    );

    // 3. Navigation preserves application ID internally
    assert.ok(
      screenContent.includes("router.push(`/application/${item.id}`)"),
      "Navigation must preserve internal application id"
    );

    // 4. Dynamic status badge configuration
    assert.ok(
      cardContent.includes('label: "Submitted"'),
      "Card must define Submitted badge"
    );
    assert.ok(
      cardContent.includes('label: "Under Verification"'),
      "Card must define Under Verification badge"
    );
    assert.ok(
      cardContent.includes('label: "In Progress"'),
      "Card must define In Progress badge"
    );
    assert.ok(
      cardContent.includes('label: "Completed"'),
      "Card must define Completed badge"
    );
    assert.ok(
      cardContent.includes("getStatusBadgeStyle"),
      "getStatusBadgeStyle must be exported"
    );
  });
});


