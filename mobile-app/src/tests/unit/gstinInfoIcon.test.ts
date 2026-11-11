/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const EXPECTED_GSTIN_TEXT =
  "Enter your valid 15-digit GST Identification Number. Ensure it matches your GST registration.";
const EXPECTED_TRADE_NAME_TEXT =
  "Enter your business's commonly known trade name. It may differ from your legal name.";
const EXPECTED_SAC_CODE_TEXT =
  "Select the appropriate SAC code for your business services. It classifies services under GST.";
const EXPECTED_NOTICE_NUMBER_TEXT =
  "Enter the reference number mentioned in your GST department notice. Verify it before submitting.";

// ─── TEST 1: Exact Field-Specific Tooltip Messages ──────────────────────────

test("Test 1: GstinInfoIcon defines the 4 exact required field-specific messages", () => {
  const compPath = path.resolve(
    __dirname,
    "../../modules/gst/components/common/GstinInfoIcon.tsx"
  );
  const content = fs.readFileSync(compPath, "utf-8");
  assert.ok(
    content.includes(EXPECTED_GSTIN_TEXT),
    "GSTIN tooltip text must strictly match the prompt specification"
  );
  assert.ok(
    content.includes(EXPECTED_TRADE_NAME_TEXT),
    "Trade Name tooltip text must strictly match the prompt specification"
  );
  assert.ok(
    content.includes(EXPECTED_SAC_CODE_TEXT),
    "SAC Code tooltip text must strictly match the prompt specification"
  );
  assert.ok(
    content.includes(EXPECTED_NOTICE_NUMBER_TEXT),
    "Notice Number tooltip text must strictly match the prompt specification"
  );
});

// ─── TEST 2: Component Architecture & Tooltip Mechanics ─────────────────────

test("Test 2: GstinInfoIcon field-relative anchored popover and timer cleanup", () => {
  const compPath = path.resolve(
    __dirname,
    "../../modules/gst/components/common/GstinInfoIcon.tsx"
  );
  const content = fs.readFileSync(compPath, "utf-8");

  // Check icon usage
  assert.match(
    content,
    /information-circle-outline/,
    "Must use blue outlined information icon (information-circle-outline)"
  );

  // Check auto-dismiss timer within 3-5 seconds (3000ms - 5000ms)
  assert.match(
    content,
    /AUTO_DISMISS_DELAY_MS\s*=\s*(3\d{3}|4\d{3}|5000)/,
    "Must automatically dismiss after 3-5 seconds"
  );

  // Check timer cleanup on unmount (avoiding memory leaks)
  assert.match(
    content,
    /clearTimeout/,
    "Must properly clean up timeout references"
  );

  // Field-relative anchored architecture (no screen-level Modal)
  assert.doesNotMatch(
    content,
    /<Modal/,
    "Must not use screen-level Modal, preferring field-relative anchored popover"
  );

  // Visual connection caret arrows (arrowUp / arrowDown)
  assert.match(
    content,
    /styles\.arrowUp/,
    "Must include upward caret arrow connecting tooltip to GSTIN field"
  );
  assert.match(
    content,
    /styles\.arrowDown/,
    "Must include downward caret arrow when positioned above GSTIN field"
  );

  // Transparent backdrop for dismiss on outside tap
  assert.match(
    content,
    /styles\.backdrop[\s\S]*?onPress=\{hideTooltip\}/,
    "Must dismiss when tapping outside backdrop"
  );

  // Close button
  assert.match(
    content,
    /accessibilityLabel=\{`Close \$\{tooltipTitle\}`\}/,
    "Must include close button with accessibility label"
  );
});

// ─── TEST 3: Common Index Exports ───────────────────────────────────────────

test("Test 3: GstinInfoIcon is exported from shared GST components", () => {
  const commonIndexPath = path.resolve(
    __dirname,
    "../../modules/gst/components/common/index.ts"
  );
  const commonContent = fs.readFileSync(commonIndexPath, "utf-8");
  assert.match(
    commonContent,
    /export \* from "\.\/GstinInfoIcon";/,
    "Must be exported from common components index"
  );
});

// ─── TEST 4: Global Integration in All 5 GSTIN Screens ─────────────────────

test("Test 4: GstinInfoIcon is integrated into GST Amendment Landing", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-amendment/components/GstAmendmentLanding/GstAmendmentLanding.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");
  assert.match(content, /<GstinInfoIcon/, "Must render GstinInfoIcon in GST Amendment");
  assert.match(
    content,
    /GSTIN to Amend[\s\S]*?<GstinInfoIcon/,
    "Must place GstinInfoIcon beside GSTIN to Amend label"
  );
});

test("Test 5: GstinInfoIcon is integrated into GST Filing (Returns) Period Step", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");
  assert.match(content, /<GstinInfoIcon/, "Must render GstinInfoIcon in GST Filing");
  assert.match(
    content,
    /GSTIN \(15-Character\)[\s\S]*?<GstinInfoIcon/,
    "Must place GstinInfoIcon beside GSTIN (15-Character) label"
  );
});

test("Test 6: GstinInfoIcon is integrated into GST Cancellation Screen", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-cancellation/screens/GstCancellationScreen/GstCancellationScreen.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");
  assert.match(content, /<GstinInfoIcon/, "Must render GstinInfoIcon in GST Cancellation");
  assert.match(
    content,
    /GSTIN to Cancel[\s\S]*?<GstinInfoIcon/,
    "Must place GstinInfoIcon beside GSTIN to Cancel label"
  );
});

test("Test 7: GstinInfoIcon is integrated into GST Certificate Screen", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-certificate/screens/GstCertificateScreen/GstCertificateScreen.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");
  assert.match(content, /<GstinInfoIcon/, "Must render GstinInfoIcon in GST Certificate");
  assert.match(
    content,
    /GSTIN Number[\s\S]*?<GstinInfoIcon/,
    "Must place GstinInfoIcon beside GSTIN Number label"
  );
});

test("Test 8: GstinInfoIcon is integrated into GST Compliance Screen", () => {
  const filePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-compliance/screens/GstComplianceScreen/GstComplianceScreen.tsx"
  );
  const content = fs.readFileSync(filePath, "utf-8");
  assert.match(
    content,
    /labelRightElement=\{<GstinInfoIcon/,
    "Must pass GstinInfoIcon to FloatingLabelInput in GST Compliance"
  );
});

// ─── TEST 9: Non-GSTIN Fields Unaffected ─────────────────────────────────────

test("Test 9: GstinInfoIcon is NOT added to non-GSTIN fields (FY, Request Type)", () => {
  const compliancePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-compliance/screens/GstComplianceScreen/GstComplianceScreen.tsx"
  );
  const content = fs.readFileSync(compliancePath, "utf-8");
  const fyBlock = content.slice(
    content.indexOf("Financial Year Selector"),
    content.indexOf("Request Type Selector")
  );
  assert.doesNotMatch(fyBlock, /<GstinInfoIcon/, "Financial Year block must not have GstinInfoIcon");

  const reqTypeBlock = content.slice(
    content.indexOf("Request Type Selector"),
    content.indexOf("Dynamic Sections by Request Type")
  );
  assert.doesNotMatch(reqTypeBlock, /<GstinInfoIcon/, "Request Type block must not have GstinInfoIcon");
});

// ─── TEST 10: Standardized Layout: Label -> Red * -> Info Icon -> Right Counter ────

test("Test 10: Standardized GSTIN layout across modules (Label -> Red * -> ⓘ -> Counter)", () => {
  // 1. GST Amendment Landing
  const amendmentContent = fs.readFileSync(
    path.resolve(__dirname, "../../modules/gst/gst-amendment/components/GstAmendmentLanding/GstAmendmentLanding.tsx"),
    "utf-8"
  );
  assert.match(
    amendmentContent,
    /GSTIN to Amend[\s\S]*?styles\.star[\s\S]*?<GstinInfoIcon[\s\S]*?gstinCounter/,
    "GST Amendment: Label -> Red Star -> GstinInfoIcon -> Right Counter"
  );

  // 2. GST Filing Period Step
  const filingContent = fs.readFileSync(
    path.resolve(__dirname, "../../modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep.tsx"),
    "utf-8"
  );
  assert.match(
    filingContent,
    /GSTIN \(15-Character\)[\s\S]*?styles\.star[\s\S]*?<GstinInfoIcon/,
    "GST Filing: Label -> Red Star -> GstinInfoIcon"
  );

  // 3. GST Cancellation Screen
  const cancelContent = fs.readFileSync(
    path.resolve(__dirname, "../../modules/gst/gst-cancellation/screens/GstCancellationScreen/GstCancellationScreen.tsx"),
    "utf-8"
  );
  assert.match(
    cancelContent,
    /GSTIN to Cancel[\s\S]*?styles\.star[\s\S]*?<GstinInfoIcon/,
    "GST Cancellation: Label -> Red Star -> GstinInfoIcon"
  );

  // 4. GST Certificate Screen
  const certContent = fs.readFileSync(
    path.resolve(__dirname, "../../modules/gst/gst-certificate/screens/GstCertificateScreen/GstCertificateScreen.tsx"),
    "utf-8"
  );
  assert.match(
    certContent,
    /GSTIN Number[\s\S]*?st\.star[\s\S]*?<GstinInfoIcon/,
    "GST Certificate: Label -> Red Star -> GstinInfoIcon in labelWithIcon"
  );

  // 5. GST Compliance Screen (FloatingLabelInput)
  const complianceInputContent = fs.readFileSync(
    path.resolve(__dirname, "../../modules/gst/gst-compliance/components/FloatingLabelInput/FloatingLabelInput.tsx"),
    "utf-8"
  );
  assert.match(
    complianceInputContent,
    /currentLabelText[\s\S]*?styles\.star[\s\S]*?labelRightElement/,
    "FloatingLabelInput: Label -> Red Star -> labelRightElement (GstinInfoIcon)"
  );
});

// ─── TEST 11: Trade Name & SAC Code in GST Registration ─────────────────────

test("Test 11: Trade Name and SAC Code integration in GST Registration", () => {
  const businessStepPath = path.resolve(
    __dirname,
    "../../modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep.tsx"
  );
  const content = fs.readFileSync(businessStepPath, "utf-8");

  // Trade Name uses GstinInfoIcon with fieldType="tradeName"
  assert.match(
    content,
    /businessName[\s\S]*?Trade Name[\s\S]*?fieldType="tradeName"/,
    "Trade Name field must integrate GstinInfoIcon with fieldType='tradeName'"
  );

  // SAC Code uses GstinInfoIcon with fieldType="sacCode" in Principal Business Details
  assert.match(
    content,
    /hsnCode[\s\S]*?HSN \/ SAC Code[\s\S]*?fieldType="sacCode"/,
    "Primary HSN/SAC field must integrate GstinInfoIcon with fieldType='sacCode'"
  );
});

// ─── TEST 12: Notice Number in GST Compliance ───────────────────────────────

test("Test 12: Notice Number integration in GST Compliance", () => {
  const requestTypeSectionPath = path.resolve(
    __dirname,
    "../../modules/gst/gst-compliance/components/RequestTypeSection/RequestTypeSection.tsx"
  );
  const content = fs.readFileSync(requestTypeSectionPath, "utf-8");

  // Notice Number uses GstinInfoIcon with fieldType="noticeNumber"
  assert.match(
    content,
    /label="Notice Number"[\s\S]*?fieldType="noticeNumber"/,
    "Notice Number field must integrate GstinInfoIcon with fieldType='noticeNumber'"
  );
});

// ─── TEST 13: Strictly Exclude GST Services ─────────────────────────────────

test("Test 13: Strictly exclude GST Services screen from info icons", () => {
  const gstScreenPath = path.resolve(
    __dirname,
    "../../modules/gst/screens/GstScreen/GstScreen.tsx"
  );
  const content = fs.readFileSync(gstScreenPath, "utf-8");

  assert.doesNotMatch(
    content,
    /GstinInfoIcon|GstInfoIcon/,
    "GST Services landing screen must not have GST info icon"
  );
});

// ─── TEST 14: GST Compliance GSTIN and Notice Number Info Icon Positioning ───

test("Test 14: GSTIN and Notice Number info icons positioned beside label above input box in GST Compliance", () => {
  // 1. FloatingLabelInput component architecture
  const floatingInputPath = path.resolve(
    __dirname,
    "../../modules/gst/gst-compliance/components/FloatingLabelInput/FloatingLabelInput.tsx"
  );
  const floatingInputContent = fs.readFileSync(floatingInputPath, "utf-8");

  assert.match(
    floatingInputContent,
    /labelAbove\?: boolean;/,
    "FloatingLabelInput must support labelAbove prop"
  );
  assert.match(
    floatingInputContent,
    /labelAbove[\s\S]*?styles\.labelRow[\s\S]*?styles\.star[\s\S]*?labelRightElement[\s\S]*?styles\.inputContainer/,
    "labelRow with star and labelRightElement must be placed above styles.inputContainer"
  );

  // 2. GST Compliance Screen (GSTIN)
  const compliancePath = path.resolve(
    __dirname,
    "../../modules/gst/gst-compliance/screens/GstComplianceScreen/GstComplianceScreen.tsx"
  );
  const complianceContent = fs.readFileSync(compliancePath, "utf-8");

  assert.match(
    complianceContent,
    /label="GSTIN"[\s\S]*?labelAbove[\s\S]*?labelRightElement=\{<GstinInfoIcon size=\{16\} \/>\}/,
    "GSTIN field must configure labelAbove with GstinInfoIcon size 16 beside label"
  );

  // 3. RequestTypeSection (Notice Number)
  const reqSectionPath = path.resolve(
    __dirname,
    "../../modules/gst/gst-compliance/components/RequestTypeSection/RequestTypeSection.tsx"
  );
  const reqSectionContent = fs.readFileSync(reqSectionPath, "utf-8");

  assert.match(
    reqSectionContent,
    /label="Notice Number"[\s\S]*?labelAbove[\s\S]*?labelRightElement=\{<GstinInfoIcon fieldType="noticeNumber" size=\{16\} \/>\}/,
    "Notice Number field must configure labelAbove with GstinInfoIcon size 16 beside label"
  );
});

