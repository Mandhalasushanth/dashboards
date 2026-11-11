/// <reference types="node" />
/**
 * Batch 5: one calendar for the whole app (BUG-UI-001) and keyboard-safe forms (BUG-UI-002).
 * Run with: node scripts/run-auth-lockout-tests.cjs src/tests/unit/calendarKeyboard.test.ts
 *
 * The calendar components are rendered to static markup with minimal React Native stand-ins, so
 * these tests check what the shared component hands to the platform picker and what it reports
 * back. They cannot show how the keyboard or the native calendar look on a device.
 */
import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Platform } from "react-native";

import { DatePickerDialog } from "../../shared/components/DatePickerDialog";
import { UniversalDatePicker, formatDateToString, parseStringToDate } from "../../shared/components/UniversalDatePicker";
import { formatDateDDMMYYYY, parseDDMMYYYY } from "../../shared/formatters/dateFormatter";
import { validateDobForRegistration } from "../../shared/validators/profileValidators";
import { computeScrollTarget, footerLift, keyboardOverlap } from "../../shared/utils/keyboardOverlap";

type DatePickerProps = {
  value: Date;
  mode: string;
  display: string;
  minimumDate?: Date;
  maximumDate?: Date;
  textColor?: string;
  onValueChange: (event: unknown, date?: Date) => void;
  onDismiss: () => void;
};
type TouchableProps = { onPress: () => void };
type TextProps = { children?: unknown };

interface Harness {
  renders: { touchables: TouchableProps[]; datePickers: DatePickerProps[]; modals: unknown[]; texts: TextProps[] };
  Keyboard: { dismissCalls: number };
}
const harness = (globalThis as unknown as { __authTest: Harness }).__authTest;
const setPlatform = (os: "android" | "ios" | "web") => {
  (Platform as { OS: string }).OS = os;
};

function render(element: React.ReactElement): string {
  harness.renders.touchables.length = 0;
  harness.renders.datePickers.length = 0;
  harness.renders.modals.length = 0;
  harness.renders.texts.length = 0;
  return renderToStaticMarkup(element);
}

const src = (relative: string) => fs.readFileSync(path.join(process.cwd(), "src", relative), "utf8");
const walk = (dir: string): string[] =>
  fs.readdirSync(path.join(process.cwd(), "src", dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    return entry.isDirectory() ? walk(rel) : [rel];
  });

beforeEach(() => setPlatform("ios"));

// ===============================================================================================
// BUG-UI-001: the shared calendar
// ===============================================================================================

const OPEN_ON = new Date(2000, 0, 1);
const MIN = new Date(1990, 0, 1);
const MAX = new Date(2010, 11, 31);

test("nothing renders while the calendar is closed", () => {
  for (const os of ["android", "ios"] as const) {
    setPlatform(os);
    const markup = render(
      React.createElement(DatePickerDialog, { visible: false, value: OPEN_ON, onConfirm: () => { }, onCancel: () => { } }),
    );
    assert.equal(markup, "", os);
    assert.equal(harness.renders.datePickers.length, 0, os);
  }
});

test("Android shows the platform Material date dialog with the caller's value and limits", () => {
  setPlatform("android");
  render(
    React.createElement(DatePickerDialog, {
      visible: true, value: OPEN_ON, minimumDate: MIN, maximumDate: MAX, onConfirm: () => { }, onCancel: () => { },
    }),
  );
  assert.equal(harness.renders.datePickers.length, 1);
  const picker = harness.renders.datePickers[0];
  assert.equal(picker.mode, "date");
  assert.equal(picker.display, "default", "default display is the Material calendar dialog");
  assert.equal(picker.value.getTime(), OPEN_ON.getTime());
  assert.equal(picker.minimumDate?.getTime(), MIN.getTime());
  assert.equal(picker.maximumDate?.getTime(), MAX.getTime());
});

test("Android: choosing a date confirms it; dismissing reports a cancel; an empty selection is ignored", () => {
  setPlatform("android");
  const confirmed: Date[] = [];
  let cancelled = 0;
  render(
    React.createElement(DatePickerDialog, {
      visible: true, value: OPEN_ON, onConfirm: (d: Date) => confirmed.push(d), onCancel: () => (cancelled += 1),
    }),
  );
  const picker = harness.renders.datePickers[0];
  picker.onValueChange({}, undefined);
  assert.equal(confirmed.length, 0);
  const chosen = new Date(2001, 4, 17);
  picker.onValueChange({}, chosen);
  assert.deepEqual(confirmed, [chosen]);
  picker.onDismiss();
  assert.equal(cancelled, 1);
});

test("iOS shows the spinner in a bottom sheet with Cancel, a title and Done", () => {
  setPlatform("ios");
  const markup = render(
    React.createElement(DatePickerDialog, {
      visible: true, value: OPEN_ON, title: "Date of Birth", minimumDate: MIN, maximumDate: MAX, onConfirm: () => { }, onCancel: () => { },
    }),
  );
  assert.equal(harness.renders.modals.length, 1);
  assert.ok(markup.includes("Cancel") && markup.includes("Done") && markup.includes("Date of Birth"));
  const picker = harness.renders.datePickers[0];
  assert.equal(picker.display, "spinner");
  assert.equal(picker.value.getTime(), OPEN_ON.getTime());
  assert.equal(picker.minimumDate?.getTime(), MIN.getTime());
  assert.equal(picker.maximumDate?.getTime(), MAX.getTime());
});

test("iOS falls back to a generic title and Done / Cancel report back", () => {
  setPlatform("ios");
  const confirmed: Date[] = [];
  let cancelled = 0;
  const markup = render(
    React.createElement(DatePickerDialog, {
      visible: true, value: OPEN_ON, onConfirm: (d: Date) => confirmed.push(d), onCancel: () => (cancelled += 1),
    }),
  );
  assert.ok(markup.includes("Select Date"));
  const [cancel, done] = harness.renders.touchables;
  cancel.onPress();
  assert.equal(cancelled, 1);
  done.onPress();
  assert.equal(confirmed.length, 1);
  assert.equal(confirmed[0].getTime(), OPEN_ON.getTime(), "Done without scrolling keeps the opening date");
});

test("the web build leaves date entry to the browser's own input", () => {
  setPlatform("web");
  const markup = render(
    React.createElement(DatePickerDialog, { visible: true, value: OPEN_ON, onConfirm: () => { }, onCancel: () => { } }),
  );
  assert.equal(markup, "");
});

test("UniversalDatePicker shows label, required marker, value, placeholder, error and helper text", () => {
  setPlatform("android");
  const filled = render(
    React.createElement(UniversalDatePicker, { label: "Date of Birth", required: true, value: "01-01-2000", onChange: () => { }, valueFormat: "DD-MM-YYYY" }),
  );
  assert.ok(filled.includes("Date of Birth") && filled.includes("*") && filled.includes("01-01-2000"));

  const empty = render(React.createElement(UniversalDatePicker, { value: "", onChange: () => { } }));
  assert.ok(empty.includes("Select Date"));
  const emptyNumeric = render(React.createElement(UniversalDatePicker, { value: "", onChange: () => { }, valueFormat: "DD-MM-YYYY" }));
  assert.ok(emptyNumeric.includes("DD-MM-YYYY"));

  const withError = render(React.createElement(UniversalDatePicker, { value: "", onChange: () => { }, error: "Required", helperText: "hint" }));
  assert.ok(withError.includes("Required") && !withError.includes("hint"), "an error replaces the helper text");
  const hidden = render(React.createElement(UniversalDatePicker, { value: "", onChange: () => { }, error: "Required", showErrorText: false }));
  assert.ok(!hidden.includes("Required"), "the parent can render the error itself");
  assert.equal(harness.renders.datePickers.length, 0, "the calendar is not opened until the field is tapped");
});

test("every date format in use still round-trips", () => {
  const d = new Date(2024, 2, 5);
  assert.equal(formatDateToString(d), "05 Mar 2024");
  assert.equal(parseStringToDate("05 Mar 2024").getTime(), d.getTime());
  assert.equal(formatDateDDMMYYYY(d), "05-03-2024");
  assert.equal(parseDDMMYYYY("05-03-2024")?.getTime(), d.getTime());
  assert.equal(parseStringToDate("05-03-2024").getTime(), d.getTime(), "the numeric format is also understood");
  assert.equal(parseDDMMYYYY("31-02-2024"), null, "impossible dates are rejected");
  assert.equal(parseDDMMYYYY("5-3-2024"), null);
  assert.equal(formatDateDDMMYYYY(new Date(2024, 11, 31)), "31-12-2024");
});

test("date-of-birth rules are unchanged by the calendar migration", () => {
  const now = new Date(2026, 5, 15);
  assert.equal(validateDobForRegistration("15-06-2008", 18, now), "");
  assert.equal(validateDobForRegistration("16-06-2008", 18, now), "You must be at least 18 years old to create an account");
  assert.equal(validateDobForRegistration("16-06-2026", 18, now), "Date of birth cannot be in the future");
  assert.equal(validateDobForRegistration("31-04-1990", 18, now), "Enter a valid date of birth (DD-MM-YYYY)");
});

test("the platform date picker is imported in exactly one place", () => {
  const importers = walk("")
    .filter((f) => /\.(ts|tsx)$/.test(f) && !f.startsWith("tests/"))
    .filter((f) => /from\s+["']@react-native-community\/datetimepicker["']/.test(src(f)));
  assert.deepEqual(importers, ["shared/components/DatePickerDialog/DatePickerDialog.tsx"]);
});

test("the old competing calendar implementations are gone", () => {
  assert.equal(fs.existsSync(path.join(process.cwd(), "src/modules/gst/components/common/GstDatePickerModal.tsx")), false);
  assert.equal(fs.existsSync(path.join(process.cwd(), "src/modules/gst/components/common/GstDatePickerModal.styles.ts")), false);
  const everything = walk("").filter((f) => /\.(ts|tsx)$/.test(f) && !f.startsWith("tests/")).map(src).join("\n");
  assert.equal(everything.includes("GstDatePickerModal"), false);
  assert.equal(everything.includes("tempIosDate"), false);
});

test("every date field that opens a calendar goes through the shared dialog and keeps its own format and limits", () => {
  const consumers: Record<string, string[]> = {
    "shared/components/UniversalDatePicker/UniversalDatePicker.tsx": ["<DatePickerDialog", "minimumDate={effectiveMinDate}", "maximumDate={maximumDate}", "formatOutput(selectedDate)"],
    "modules/itr/taxNotice/components/common/TaxNoticeDatePickerInput/TaxNoticeDatePickerInput.tsx": ["<DatePickerDialog", "minimumDate={minimumDate}", "maximumDate={maximumDate}", "onChange(formatDateToString(dateToSave))"],
    "modules/gst/gst-cancellation/screens/GstCancellationScreen/GstCancellationScreen.tsx": ["<DatePickerDialog", "formatDateDDMMYYYY(date)", "parseDDMMYYYY(flow.form.cancellationDate)", "flow.clearError(\"cancellationDate\")"],
  };
  for (const [file, needles] of Object.entries(consumers)) {
    const source = src(file);
    for (const needle of needles) assert.ok(source.includes(needle), `${file} should contain ${needle}`);
    assert.equal(/<DateTimePicker\b/.test(source), false, `${file} must not render the platform picker itself`);
  }
});

test("existing date wrappers and their consumers are still wired", () => {
  assert.ok(src("modules/gst/gst-compliance/components/NativeDatePickerInput/NativeDatePickerInput.tsx").includes("UniversalDatePicker"));
  assert.ok(src("modules/gst/gst-registration/components/GstBusinessStep/GstBusinessStep.tsx").includes("<UniversalDatePicker"));
  assert.ok(src("modules/authentication/screens/Register/RegisterScreen.tsx").includes("<UniversalDatePicker"));
  assert.ok(src("modules/itr/taxNotice/screens/NoticeSummaryScreen/NoticeSummaryScreen.tsx").includes("parseStringToDate"));
});

// ===============================================================================================
// BUG-UI-002: keyboard geometry
// ===============================================================================================

test("keyboardOverlap is how far the keyboard reaches into a view", () => {
  assert.equal(keyboardOverlap(800, 500), 300);
  assert.equal(keyboardOverlap(500, 500), 0);
  assert.equal(keyboardOverlap(400, 500), 0, "a view above the keyboard has no overlap");
  assert.equal(keyboardOverlap(800.4, 500), 300);
});

test("a focused input hidden by the keyboard is scrolled into view", () => {
  // Visible area 400, input at 700..750 in content, scrolled to 0: it is far below the fold.
  const target = computeScrollTarget({ inputY: 700, inputHeight: 50, currentOffset: 0, visibleHeight: 400, extraScrollHeight: 48 });
  assert.equal(target, 700 + 50 + 48 - 400);
});

test("an input that is already visible is left alone, and tiny moves are skipped", () => {
  assert.equal(computeScrollTarget({ inputY: 100, inputHeight: 50, currentOffset: 0, visibleHeight: 400, extraScrollHeight: 48 }), null);
  assert.equal(computeScrollTarget({ inputY: 300, inputHeight: 50, currentOffset: 0, visibleHeight: 400, extraScrollHeight: 48 }), null);
  assert.equal(computeScrollTarget({ inputY: 300, inputHeight: 50, currentOffset: 0, visibleHeight: 398.5, extraScrollHeight: 48 }), null, "less than 1dp of movement");
});

test("room is kept below the input for its validation message", () => {
  const withoutRoom = computeScrollTarget({ inputY: 360, inputHeight: 40, currentOffset: 0, visibleHeight: 400, extraScrollHeight: 0 });
  const withRoom = computeScrollTarget({ inputY: 360, inputHeight: 40, currentOffset: 0, visibleHeight: 400, extraScrollHeight: 48 });
  assert.equal(withoutRoom, null, "flush with the keyboard needs no scroll");
  assert.equal(withRoom, 360 + 40 + 48 - 400, "but the message below it must also fit");
});

test("the last field of a long form can be scrolled above the keyboard", () => {
  // Content ends at 1200; the scroll view adds bottom padding equal to the keyboard overlap, so the offset can exceed it.
  const target = computeScrollTarget({ inputY: 1150, inputHeight: 50, currentOffset: 600, visibleHeight: 350, extraScrollHeight: 48 });
  assert.equal(target, 1150 + 50 + 48 - 350);
});

test("a tall multiline input keeps its top visible and an input above the viewport is brought back", () => {
  assert.equal(computeScrollTarget({ inputY: 500, inputHeight: 380, currentOffset: 0, visibleHeight: 400, extraScrollHeight: 48 }), 500 - 16);
  assert.equal(computeScrollTarget({ inputY: 100, inputHeight: 50, currentOffset: 300, visibleHeight: 400, extraScrollHeight: 48 }), 100 - 16);
  assert.equal(computeScrollTarget({ inputY: 5, inputHeight: 50, currentOffset: 300, visibleHeight: 400, extraScrollHeight: 48 }), 0, "never scrolls above the start");
});

test("a bottom bar is lifted by exactly what the keyboard covers, without compounding", () => {
  assert.equal(footerLift(800, 500), 300);
  // measured again after the 300 lift: it now sits at 500, and the natural position adds the lift back
  assert.equal(footerLift(500 + 300, 500), 300);
  assert.equal(footerLift(780, 800), 0, "a bar the keyboard does not reach stays put");
  // a parent KeyboardAvoidingView already moved it above the keyboard: nothing is added on top
  assert.equal(footerLift(500, 500), 0);
});

// ===============================================================================================
// BUG-UI-002: what is wired where
// ===============================================================================================

const SCROLLER = "<KeyboardAwareScrollView";
const FOOTER = "<KeyboardStickyFooter";

const SCREENS_WITH_KEYBOARD_AWARE_SCROLLER = [
  "modules/authentication/screens/Register/RegisterScreen.tsx",
  "modules/company-registration/screens/CompanyRegistrationScreen/CompanyRegistrationScreen.tsx",
  "modules/gst/gst-cancellation/screens/GstCancellationScreen/GstCancellationScreen.tsx",
  "modules/gst/gst-certificate/screens/GstCertificateScreen/GstCertificateScreen.tsx",
  "modules/gst/gst-amendment/components/GstCoreAmendmentEdit/GstCoreAmendmentEdit.tsx",
  "modules/gst/gst-amendment/components/GstNonCoreAmendmentEdit/GstNonCoreAmendmentEdit.tsx",
  "modules/gst/gst-amendment/components/GstAmendmentLanding/GstAmendmentLanding.tsx",
  "modules/itr/revisedItr/screens/FindOriginalReturnScreen/FindOriginalReturnScreen.tsx",
  "modules/itr/revisedItr/screens/RevisionReasonScreen/RevisionReasonScreen.tsx",
  "modules/itr/taxNotice/screens/NoticeDocumentsScreen/NoticeDocumentsScreen.tsx",
  "modules/itr/taxNotice/screens/UploadNoticeScreen/UploadNoticeScreen.tsx",
  "app/service/[id].tsx",
  "components/screens/profile/PersonalDetailsModal.tsx",
  "modules/itr/components/BankSelectorModal/BankSelectorModal.tsx",
];

const SCREENS_WITH_FIXED_BOTTOM_BAR = [
  "modules/company-registration/screens/CompanyRegistrationScreen/CompanyRegistrationScreen.tsx",
  "modules/gst/gst-amendment/components/GstCoreAmendmentEdit/GstCoreAmendmentEdit.tsx",
  "modules/gst/gst-amendment/components/GstNonCoreAmendmentEdit/GstNonCoreAmendmentEdit.tsx",
  "modules/itr/revisedItr/screens/FindOriginalReturnScreen/FindOriginalReturnScreen.tsx",
  "modules/itr/revisedItr/screens/RevisionReasonScreen/RevisionReasonScreen.tsx",
  "modules/itr/taxNotice/screens/NoticeDocumentsScreen/NoticeDocumentsScreen.tsx",
  "modules/itr/taxNotice/screens/UploadNoticeScreen/UploadNoticeScreen.tsx",
];

test("form screens and modals use the one keyboard-aware scroller", () => {
  for (const file of SCREENS_WITH_KEYBOARD_AWARE_SCROLLER) {
    const source = src(file);
    assert.ok(source.includes(SCROLLER), `${file} should use KeyboardAwareScrollView`);
    assert.ok(source.includes("KeyboardAwareFormLayout"), `${file} should import it from the shared module`);
    assert.equal(source.includes("automaticallyAdjustKeyboardInsets"), false, `${file}: no second, iOS-only adjustment`);
  }
});

test("no migrated form still renders a plain vertical ScrollView around its inputs", () => {
  for (const file of SCREENS_WITH_KEYBOARD_AWARE_SCROLLER) {
    const plain = (src(file).match(/(^|[^\w.])<ScrollView\b/g) || []).length;
    // One input-free scroller each remains: the certificate "ready" state and the service details page.
    const allowed = file.endsWith("GstCertificateScreen.tsx") || file.endsWith("[id].tsx") ? 1 : 0;
    assert.equal(plain, allowed, file);
  }
});

test("fixed bottom action bars rise above the keyboard", () => {
  for (const file of SCREENS_WITH_KEYBOARD_AWARE_SCROLLER.filter((f) => SCREENS_WITH_FIXED_BOTTOM_BAR.includes(f))) {
    const source = src(file);
    assert.ok(source.includes(FOOTER), `${file} should wrap its bottom bar in KeyboardStickyFooter`);
    assert.equal((source.match(/<KeyboardStickyFooter/g) || []).length, (source.match(/<\/KeyboardStickyFooter>/g) || []).length, file);
  }
});

test("Create Account has a single keyboard mechanism", () => {
  const screen = src("modules/authentication/screens/Register/RegisterScreen.tsx");
  const hook = src("components/screens/create-profile/useCreateProfile.ts");
  assert.equal(screen.includes("KeyboardAvoidingView"), false, "no KeyboardAvoidingView on top of the scroller");
  assert.equal(hook.includes("Keyboard.addListener"), false, "no parallel keyboard listeners");
  assert.equal(hook.includes("keyboardHeight"), false);
  assert.equal(hook.includes("handleFieldFocus"), false);
  assert.ok(hook.includes("setFieldOffset"), "scrolling to the first invalid field on submit is kept");
  assert.ok(screen.includes("scrollRef") && screen.includes("setFieldOffset"));
});

test("the shared scroller measures the keyboard once it has settled, so a parent that also moves the view adds no second gap", () => {
  const source = src("shared/components/KeyboardAwareFormLayout.tsx");
  assert.ok(source.includes("refreshKeyboardInset"));
  assert.ok(/refreshKeyboardInset\(\);\s*scrollToFocusedInput\(\);/.test(source));
  assert.ok(source.includes("computeScrollTarget") && source.includes("keyboardOverlap"));
});

test("screens that already handled the keyboard are left as they were", () => {
  for (const file of [
    "modules/gst/gst-filing/screens/GstFilingScreen/GstFilingScreen.tsx",
    "modules/authentication/screens/AuthenticationScreen.tsx",
  ]) {
    const source = src(file);
    assert.ok(/KeyboardAvoidingView|KeyboardAwareScrollView/.test(source), file);
  }
});
