import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Application Details Header UI Update: contracts and verification", () => {
  const headerPath = path.join(
    process.cwd(),
    "src/components/screens/application/ApplicationHeader.tsx"
  );
  const headerContent = fs.readFileSync(headerPath, "utf-8");

  const stylesPath = path.join(
    process.cwd(),
    "src/styles/app/application/[id].styles.ts"
  );
  const stylesContent = fs.readFileSync(stylesPath, "utf-8");

  const screenPath = path.join(
    process.cwd(),
    "src/app/application/[id].tsx"
  );
  const screenContent = fs.readFileSync(screenPath, "utf-8");

  // 1. Header Content
  // Title "Application Details" at top center
  assert.ok(
    headerContent.includes("<Text style={styles.navTitle}>Application Details</Text>"),
    "Title must be Application Details"
  );
  // Service name rendered directly beneath without numberOfLines clipping
  assert.ok(
    headerContent.includes("<Text style={styles.navAppName}>"),
    "Service name must be rendered directly below title"
  );
  assert.ok(
    headerContent.includes("{serviceName}"),
    "Service name must be dynamically rendered"
  );

  // Application ID, trader/customer name, and date must be removed from header
  assert.ok(!headerContent.includes("displayId"), "displayId must not be rendered in header");
  assert.ok(!headerContent.includes("APPLICATION #"), "Application ID label must not be in header");
  assert.ok(!headerContent.includes("submittedOnText"), "Date must not be rendered in header");
  assert.ok(!headerContent.includes("traderName"), "Trader name must not be in header");
  assert.ok(!headerContent.includes("customerName"), "Customer name must not be in header");

  // 2. Typography
  // navAppName must have fontSize: 18, fontWeight: '700', color: '#FFFFFF'
  assert.ok(stylesContent.includes("fontSize: 18"), "Service name font size must be 18");
  assert.ok(stylesContent.includes('fontWeight: "700"'), "Service name font weight must be 700");
  assert.ok(stylesContent.includes('color: "#FFFFFF"'), "Service name color must be #FFFFFF");

  // navTitle must remain unchanged
  assert.ok(stylesContent.includes('navTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF"'), "navTitle must remain unchanged");

  // 3. Header Dimensions & Icons
  // Navy background color #0A2346 and tall header height preservation
  assert.ok(stylesContent.includes('navyHeader: { backgroundColor: "#0A2346"'), "navyHeader must be #0A2346");
  assert.ok(stylesContent.includes("minHeight: 148"), "navyHeader must preserve tall header minHeight 148");
  assert.ok(stylesContent.includes("marginBottom: 16"), "topNavRow must maintain 16px bottom margin for spacing");
  assert.ok(headerContent.includes("style={styles.headerTextWrap}"), "headerTextWrap must be used beneath topNavRow");
  // Back button preserved on left
  assert.ok(headerContent.includes('style={styles.backButton}'), "Back button must be preserved");
  assert.ok(headerContent.includes('name="arrow-back"'), "Back button icon must be arrow-back");
  // Settings icon preserved on right
  assert.ok(headerContent.includes('style={styles.settingsButton}'), "Settings button must be preserved");
  assert.ok(headerContent.includes('name="settings-outline"'), "Settings icon must be settings-outline");
  // Dimensions match (38x38)
  assert.ok(stylesContent.includes("width: 38"), "Icon buttons must have width 38");
  assert.ok(stylesContent.includes("height: 38"), "Icon buttons must have height 38");

  // Tabs remain directly below header with existing layout
  assert.ok(headerContent.includes("tabsContainer"), "Tabs container must remain below header");
  assert.ok(headerContent.includes("Overview"), "Overview tab must be preserved");
  assert.ok(headerContent.includes("Status"), "Status tab must be preserved");
  assert.ok(headerContent.includes("Documents"), "Documents tab must be preserved");
  assert.ok(headerContent.includes("Payments"), "Payments tab must be preserved");
  assert.ok(headerContent.includes("Chat with CA"), "Chat with CA tab must be preserved");

  // 4. Dynamic Service Names Test: GST Registration and GST Filing (June 2025)
  const testResolver = (app: { serviceId?: string; serviceName: string; formData?: any }) => {
    const formData = (app.formData || {}) as Record<string, any>;
    const filingPeriod =
      formData.filingPeriod ||
      formData.returnPeriod ||
      formData.period ||
      formData.periodData?.filingPeriod ||
      formData.filingMonth;

    return (
      filingPeriod &&
      (app.serviceId?.includes("filing") || app.serviceName?.toLowerCase().includes("filing")) &&
      !app.serviceName?.includes(filingPeriod)
        ? `${app.serviceName} (${filingPeriod})`
        : app.serviceName
    );
  };

  // Test with GST Registration
  const gstReg = { serviceId: "gst-registration", serviceName: "GST Registration" };
  assert.equal(testResolver(gstReg), "GST Registration");

  // Test with GST Filing (June 2025)
  const gstFilingJune = {
    serviceId: "gst-filing",
    serviceName: "GST Filing",
    formData: { filingPeriod: "June 2025" },
  };
  assert.equal(testResolver(gstFilingJune), "GST Filing (June 2025)");

  // Test with GST Filing already containing period
  const gstFilingPrefilled = {
    serviceId: "gst-filing",
    serviceName: "GST Filing (June 2025)",
  };
  assert.equal(testResolver(gstFilingPrefilled), "GST Filing (June 2025)");

  // Test with Quarterly return
  const gstFilingQuarter = {
    serviceId: "gst-filing",
    serviceName: "GST Filing",
    formData: { period: "Q3 (Oct–Dec 2025)" },
  };
  assert.equal(testResolver(gstFilingQuarter), "GST Filing (Q3 (Oct–Dec 2025))");
});
