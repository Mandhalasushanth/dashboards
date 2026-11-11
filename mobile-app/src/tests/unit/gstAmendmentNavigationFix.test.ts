import { test } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

test("GstAmendmentScreen: onTrack navigates to My Applications like GST Compliance", () => {
  const filePath = path.resolve(
    process.cwd(),
    "src/modules/gst/gst-amendment/screens/GstAmendmentScreen/GstAmendmentScreen.tsx"
  );
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    content.includes('workflow.router.replace("/(main)/applications")'),
    "onTrack must use router.replace to navigate to /(main)/applications"
  );

  assert.ok(
    !content.includes("workflow.router.replace(`/application/${workflow.submissionResult.appId}`);"),
    "onTrack must not navigate directly to Application Details"
  );

  assert.ok(
    !content.includes("workflow.router.push(`/application/${workflow.submissionResult.appId}`);"),
    "onTrack must not use router.push"
  );
});

test("GstAmendmentScreen: onOpenApplications uses router.replace to open My Applications", () => {
  const filePath = path.resolve(
    process.cwd(),
    "src/modules/gst/gst-amendment/screens/GstAmendmentScreen/GstAmendmentScreen.tsx"
  );
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    content.includes('onOpenApplications={() => workflow.router.replace("/(main)/applications")}'),
    "onOpenApplications must use router.replace"
  );
});

test("GstAmendmentScreen: Android hardware back interceptor handles SUCCESS step by routing to My Applications", () => {
  const filePath = path.resolve(
    process.cwd(),
    "src/modules/gst/gst-amendment/screens/GstAmendmentScreen/GstAmendmentScreen.tsx"
  );
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    content.includes('if (workflow.currentStep === "SUCCESS") {\n        workflow.router.replace("/(main)/applications");\n        return true;\n      }'),
    "BackHandler in GstAmendmentScreen must handle SUCCESS by routing to /(main)/applications"
  );
});

test("gstold GstAmendmentScreen: maintains identical navigation behavior to /(main)/applications", () => {
  const filePath = path.resolve(
    process.cwd(),
    "src/modules/gstold/gst-amendment/screens/GstAmendmentScreen/GstAmendmentScreen.tsx"
  );
  if (!fs.existsSync(filePath)) {
    return; // gstold directory has been cleanly removed/migrated
  }
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(
    content.includes('workflow.router.replace("/(main)/applications")'),
    "gstold onTrack must use router.replace to navigate to /(main)/applications"
  );

  assert.ok(
    !content.includes("workflow.router.replace(`/application/${workflow.submissionResult.appId}`);"),
    "gstold onTrack must not navigate directly to Application Details"
  );

  assert.ok(
    content.replace(/\r\n/g, "\n").includes('if (workflow.currentStep === "SUCCESS") {\n        workflow.router.replace("/(main)/applications");\n        return true;\n      }'),
    "gstold BackHandler must handle SUCCESS by routing to /(main)/applications"
  );
});

test("ApplicationDetailScreen: back navigation contract routes to My Applications when stack cannot go back or is replaced", () => {
  const filePath = path.resolve(
    process.cwd(),
    "src/app/application/[id].tsx"
  );
  const content = fs.readFileSync(filePath, "utf8");

  // Verify router.replace to /(main)/applications on back fallback
  assert.ok(
    content.includes('router.replace("/(main)/applications" as any)'),
    "ApplicationDetailScreen must route to /(main)/applications on fallback"
  );

  // Verify Overview tab is selected by default
  assert.ok(
    content.includes('const [activeTab, setActiveTab] = useState<DetailTab>("OVERVIEW");'),
    "ApplicationDetailScreen must set activeTab to OVERVIEW by default"
  );
});
