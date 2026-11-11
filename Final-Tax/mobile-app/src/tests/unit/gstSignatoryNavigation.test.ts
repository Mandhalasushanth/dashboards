/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { GstValidators } from "../../modules/gst/utils/gstValidators";
import {
  getFirstErrorField,
  getFirstErrorSection,
  getFirstErrorScrollOffset,
  isTextFormField,
  GST_ALL_FIELD_ORDER,
  type GstFieldName,
} from "../../modules/gst/gst-registration/utils/gstDraftLifecycle";

// ===============================================================================================
// Finsolz GST Registration — Authorised Signatory Keyboard & Validation Navigation Tests
// Bug 1: Signatory Email keyboard avoidance and scroll visibility
// Bug 2: Aadhaar consent error message and targeted positioning
// Bug 3: Required-field targeted validation navigation in canonical visual order
// ===============================================================================================

const srcPath = (...segments: string[]): string =>
  path.join(__dirname, "..", "..", ...segments);

const readSrc = (...segments: string[]): string =>
  fs.readFileSync(srcPath(...segments), "utf-8");

test("BUG 1: GstRegistrationScreen uses KeyboardAwareScrollView with extraScrollHeight and no conflicting wrapper", () => {
  const screenContent = readSrc(
    "modules",
    "gst",
    "gst-registration",
    "screens",
    "GstRegistrationScreen",
    "GstRegistrationScreen.tsx"
  );

  // Must import and use KeyboardAwareScrollView
  assert.ok(
    screenContent.includes("KeyboardAwareScrollView"),
    "Screen must import and render KeyboardAwareScrollView"
  );
  assert.ok(
    screenContent.includes("extraScrollHeight={64}") ||
      screenContent.includes("extraScrollHeight"),
    "Screen must configure extraScrollHeight to leave clearance for input and error message"
  );

  // Must NOT wrap the scroll view in an iOS-only KeyboardAvoidingView
  assert.equal(
    screenContent.includes("<KeyboardAvoidingView"),
    false,
    "Screen must not have a conflicting KeyboardAvoidingView around KeyboardAwareScrollView"
  );

  // Must wire focusedField and onFieldLayout to GstBusinessStep
  assert.ok(
    screenContent.includes("focusedField={focusedField}"),
    "Screen must pass focusedField to GstBusinessStep"
  );
  assert.ok(
    screenContent.includes("onFieldLayout={handleFieldLayout}"),
    "Screen must pass handleFieldLayout to GstBusinessStep"
  );
});

test("BUG 1: GstBusinessStep and GstFormElements wire inputRef and field layouts for signatory inputs", () => {
  const elementsContent = readSrc(
    "modules",
    "gst",
    "gst-registration",
    "components",
    "GstBusinessStep",
    "GstFormElements.tsx"
  );
  const stepContent = readSrc(
    "modules",
    "gst",
    "gst-registration",
    "components",
    "GstBusinessStep",
    "GstBusinessStep.tsx"
  );

  // Input component in GstFormElements must support inputRef
  assert.ok(
    elementsContent.includes("inputRef?: (node: TextInput | null) => void"),
    "InputProps must support inputRef callback"
  );
  assert.ok(
    elementsContent.includes("ref={inputRef}"),
    "TextInput in Input must be assigned ref={inputRef}"
  );

  // GstBusinessStep must register input refs and handle layout for signatoryEmail
  assert.ok(
    stepContent.includes("signatoryEmail"),
    "GstBusinessStep must reference signatoryEmail"
  );
  assert.ok(
    stepContent.includes("inputRefs.current"),
    "GstBusinessStep must maintain inputRefs for programmatic focus"
  );
  assert.ok(
    stepContent.includes("onFieldLayout?.(\"signatoryEmail\""),
    "GstBusinessStep must report layout for signatoryEmail"
  );
});

test("BUG 2: Aadhaar consent returns the exact canonical validation message", () => {
  const emptyErr = GstValidators.validateBusinessField("aadhaarConsent", "");
  assert.equal(
    emptyErr,
    "Please provide Aadhaar consent to continue.",
    "Unchecked/empty consent must return canonical error message"
  );

  const falseErr = GstValidators.validateBusinessField("aadhaarConsent", "false");
  assert.equal(
    falseErr,
    "Please provide Aadhaar consent to continue.",
    "Explicit 'false' consent must return canonical error message"
  );

  const validErr = GstValidators.validateBusinessField("aadhaarConsent", "true");
  assert.equal(validErr, "", "Consent 'true' must be valid (empty error)");
});

test("BUG 2: getFirstErrorSection and getFirstErrorScrollOffset target Aadhaar consent accurately", () => {
  const errors = { aadhaarConsent: "Please provide Aadhaar consent to continue." };

  const section = getFirstErrorSection(errors);
  assert.equal(section, "consent", "Aadhaar consent error must map to 'consent' section");

  // Measured position available
  const measuredOffset = getFirstErrorScrollOffset(errors, {
    consent: 1350,
    signatory: 900,
    bank: 400,
  });
  assert.equal(measuredOffset, 1350, "Must scroll to measured consent position");

  // Fallback position when unmeasured
  const fallbackOffset = getFirstErrorScrollOffset(errors, {});
  assert.ok(
    fallbackOffset >= 1200,
    "Fallback consent scroll offset must be >= 1200, never 0"
  );
});

test("BUG 2: GstBusinessStep wires onLayout and accessibility label to Aadhaar consent checkbox card", () => {
  const stepContent = readSrc(
    "modules",
    "gst",
    "gst-registration",
    "components",
    "GstBusinessStep",
    "GstBusinessStep.tsx"
  );

  assert.ok(
    stepContent.includes("onFieldLayout?.(\"aadhaarConsent\""),
    "Aadhaar consent container must report its layout offset"
  );
  assert.ok(
    stepContent.includes("accessibilityLabel=\"Aadhaar authentication consent\""),
    "Aadhaar consent container must have accessible label"
  );
});

test("BUG 2: useGstRegistrationFlow clears Aadhaar consent error immediately on change", () => {
  const flowContent = readSrc(
    "modules",
    "gst",
    "gst-registration",
    "hooks",
    "useGstRegistrationFlow.ts"
  );

  assert.ok(
    flowContent.includes("key === \"aadhaarConsent\""),
    "useGstRegistrationFlow must detect when aadhaarConsent is checked"
  );
  assert.ok(
    flowContent.includes("delete nextErrors.aadhaarConsent"),
    "useGstRegistrationFlow must immediately delete aadhaarConsent from errors"
  );
});

test("BUG 3: GST_ALL_FIELD_ORDER establishes canonical visual order of Authorised Signatory fields", () => {
  const signatoryFields: readonly GstFieldName[] = [
    "signatoryName",
    "signatoryPan",
    "signatoryDob",
    "signatoryDesignation",
    "signatoryMobile",
    "signatoryEmail",
    "aadhaarConsent",
  ];

  signatoryFields.forEach((field) => {
    assert.ok(
      GST_ALL_FIELD_ORDER.includes(field),
      `Field ${field} must be present in GST_ALL_FIELD_ORDER`
    );
  });

  const indexes = signatoryFields.map((f) => GST_ALL_FIELD_ORDER.indexOf(f));
  indexes.forEach((idx, i) => {
    if (i > 0) {
      assert.ok(
        idx > indexes[i - 1],
        `Field ${signatoryFields[i]} (idx ${idx}) must appear after ${signatoryFields[i - 1]} (idx ${indexes[i - 1]})`
      );
    }
  });
});

test("BUG 3: getFirstErrorField returns the first invalid field in visual order", () => {
  // Mobile before Email
  assert.equal(
    getFirstErrorField({
      signatoryEmail: "Invalid email",
      signatoryMobile: "Invalid mobile",
    }),
    "signatoryMobile"
  );

  // Name before PAN
  assert.equal(
    getFirstErrorField({
      signatoryPan: "Invalid PAN",
      signatoryName: "Name is required",
    }),
    "signatoryName"
  );

  // DOB before Designation
  assert.equal(
    getFirstErrorField({
      signatoryDesignation: "Designation required",
      signatoryDob: "Date of birth required",
    }),
    "signatoryDob"
  );

  // Designation before Consent
  assert.equal(
    getFirstErrorField({
      aadhaarConsent: "Please provide Aadhaar consent to continue.",
      signatoryDesignation: "Designation required",
    }),
    "signatoryDesignation"
  );

  // Consent alone
  assert.equal(
    getFirstErrorField({
      aadhaarConsent: "Please provide Aadhaar consent to continue.",
    }),
    "aadhaarConsent"
  );
});

test("BUG 3: isTextFormField differentiates text inputs from non-text controls", () => {
  // Text inputs that can receive keyboard focus
  const textFields = [
    "signatoryName",
    "signatoryPan",
    "signatoryDesignation",
    "signatoryMobile",
    "signatoryEmail",
    "legalName",
    "businessAddress",
    "bankAccountNumber",
  ];
  textFields.forEach((field) => {
    assert.equal(
      isTextFormField(field),
      true,
      `${field} should be identified as a text form field`
    );
  });

  // Non-text controls that must NOT open the keyboard
  const nonTextFields = [
    "signatoryDob",
    "aadhaarConsent",
    "businessType",
    "state",
    "compositionScheme",
  ];
  nonTextFields.forEach((field) => {
    assert.equal(
      isTextFormField(field),
      false,
      `${field} should NOT be identified as a text form field`
    );
  });
});

test("BUG 3: getFirstErrorScrollOffset scrolls to the specific invalid field position", () => {
  const positions = {
    signatoryName: 800,
    signatoryPan: 870,
    signatoryDob: 940,
    signatoryDesignation: 1010,
    signatoryMobile: 1080,
    signatoryEmail: 1150,
    aadhaarConsent: 1250,
  };

  // Single invalid field
  assert.equal(
    getFirstErrorScrollOffset({ signatoryEmail: "Email is required" }, positions),
    1150
  );
  assert.equal(
    getFirstErrorScrollOffset({ signatoryMobile: "Mobile is required" }, positions),
    1080
  );
  assert.equal(
    getFirstErrorScrollOffset(
      { aadhaarConsent: "Please provide Aadhaar consent to continue." },
      positions
    ),
    1250
  );

  // Multiple invalid fields: scrolls to the first one in form order
  assert.equal(
    getFirstErrorScrollOffset(
      {
        signatoryEmail: "Email required",
        signatoryName: "Name required",
        aadhaarConsent: "Consent required",
      },
      positions
    ),
    800,
    "Must scroll to the first invalid field (signatoryName)"
  );
});

test("BUG 3: Flow validation sets focusedField and scrolls to target without resetting to top", () => {
  const flowContent = readSrc(
    "modules",
    "gst",
    "gst-registration",
    "hooks",
    "useGstRegistrationFlow.ts"
  );

  // validateBusinessDetails must set focusedField
  assert.ok(
    flowContent.includes("setFocusedField(firstField)"),
    "validateBusinessDetails must set the focusedField state"
  );

  // validateBusinessDetails must scroll to target offset
  assert.ok(
    flowContent.includes("getFirstErrorScrollOffset(errs, positionsMap)"),
    "validateBusinessDetails must compute targeted scroll offset"
  );
  assert.ok(
    flowContent.includes("scrollTo({ y: Math.max(0, targetY - 15)"),
    "validateBusinessDetails must scroll to target offset with safety margin"
  );

  // handleContinue must NOT have an unconditional scrollTo({ y: 0 }) after step handlers
  assert.equal(
    flowContent.includes("if (handler) await handler();\n      scrollViewRef.current?.scrollTo({ y: 0"),
    false,
    "handleContinue must not unconditionally reset scroll position on validation error"
  );
});
