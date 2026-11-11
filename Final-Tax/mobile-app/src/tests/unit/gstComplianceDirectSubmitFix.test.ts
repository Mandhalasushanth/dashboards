import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("GST Compliance Direct Submission & Button Text Fix", () => {
  const rootDir = path.resolve(__dirname, "../../..");

  const readComponent = (relPath: string) => {
    const fullPath = path.join(rootDir, relPath);
    assert.ok(fs.existsSync(fullPath), `Target file must exist: ${relPath}`);
    return fs.readFileSync(fullPath, "utf-8");
  };

  it("GstComplianceScreen does not render ComplianceConfirmModal", () => {
    const screen = readComponent("src/modules/gst/gst-compliance/screens/GstComplianceScreen/GstComplianceScreen.tsx");
    assert.ok(!screen.includes("<ComplianceConfirmModal"), "Screen must not render ComplianceConfirmModal");
    assert.ok(!screen.includes("import { ComplianceConfirmModal }"), "Screen must not import ComplianceConfirmModal");

    const oldScreen = readComponent("src/modules/gstold/gst-compliance/screens/GstComplianceScreen/GstComplianceScreen.tsx");
    assert.ok(!oldScreen.includes("<ComplianceConfirmModal"), "gstold Screen must not render ComplianceConfirmModal");
  });

  it("useComplianceForm directly triggers handleConfirmSubmit without opening modal", () => {
    const hook = readComponent("src/modules/gst/gst-compliance/hooks/useComplianceForm.ts");
    assert.ok(hook.includes("void handleConfirmSubmit();"), "useComplianceForm must call handleConfirmSubmit directly");
    assert.ok(!hook.includes("setShowConfirmModal(true);"), "useComplianceForm must not open confirm modal");

    const oldHook = readComponent("src/modules/gstold/gst-compliance/hooks/useComplianceForm.ts");
    assert.ok(oldHook.includes("void handleConfirmSubmit();"), "gstold useComplianceForm must call handleConfirmSubmit directly");
    assert.ok(!oldHook.includes("setShowConfirmModal(true);"), "gstold useComplianceForm must not open confirm modal");
  });

  it("getButtonText returns exactly 'Submit' on review step", () => {
    const hook = readComponent("src/modules/gst/gst-compliance/hooks/useComplianceForm.ts");
    assert.ok(hook.includes('return "Submit";'), "getButtonText must return exactly 'Submit'");
    assert.ok(!hook.includes('return "Submit Compliance Request";'), "getButtonText must not return 'Submit Compliance Request'");

    const oldHook = readComponent("src/modules/gstold/gst-compliance/hooks/useComplianceForm.ts");
    assert.ok(oldHook.includes('return "Submit";'), "gstold getButtonText must return exactly 'Submit'");
    assert.ok(!oldHook.includes('return "Submit Compliance Request";'), "gstold getButtonText must not return 'Submit Compliance Request'");
  });
});
