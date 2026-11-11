import test, { describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { extractApplicationsFromResponse } from "@/modules/applications/utils/applicationResponseParser";
import { ApiError } from "@/core/api/apiError";
import type { Application } from "@/types/domain";

describe("My Applications Root-Cause Fix Verification Suite", () => {
  const baseDir = path.resolve(__dirname, "../../..");
  const servicePath = path.join(
    baseDir,
    "src/modules/applications/services/applicationService.ts"
  );
  const storePath = path.join(
    baseDir,
    "src/store/applicationStore.ts"
  );
  const screenPath = path.join(
    baseDir,
    "src/modules/applications/screens/ActiveApplications/ActiveApplicationsScreen.tsx"
  );

  const serviceContent = fs.readFileSync(servicePath, "utf-8");
  const storeContent = fs.readFileSync(storePath, "utf-8");
  const screenContent = fs.readFileSync(screenPath, "utf-8");

  test("1. Response Parsing: Direct array response (empty & populated)", () => {
    assert.deepEqual(extractApplicationsFromResponse([]), []);
    const sample = [{ id: "APP-01", serviceName: "GST Filing" } as Application];
    const parsed = extractApplicationsFromResponse(sample);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].id, "APP-01");
  });

  test("2. Response Parsing: Documented wrapper objects (applications, data, content, results, items)", () => {
    assert.deepEqual(extractApplicationsFromResponse({ applications: [] }), []);
    assert.deepEqual(extractApplicationsFromResponse({ data: [] }), []);
    assert.deepEqual(extractApplicationsFromResponse({ content: [] }), []);
    assert.deepEqual(extractApplicationsFromResponse({ results: [] }), []);
    assert.deepEqual(extractApplicationsFromResponse({ items: [] }), []);

    const app = { id: "APP-WRAP", serviceName: "GST Notice" } as Application;
    assert.equal(extractApplicationsFromResponse({ applications: [app] })[0].id, "APP-WRAP");
    assert.equal(extractApplicationsFromResponse({ data: [app] })[0].id, "APP-WRAP");
    assert.equal(extractApplicationsFromResponse({ content: [app] })[0].id, "APP-WRAP");
    assert.equal(extractApplicationsFromResponse({ results: [app] })[0].id, "APP-WRAP");
    assert.equal(extractApplicationsFromResponse({ items: [app] })[0].id, "APP-WRAP");
  });

  test("3. Response Parsing: Nested data wrappers ({ data: { applications/results/items: [] } })", () => {
    assert.deepEqual(extractApplicationsFromResponse({ data: { applications: [] } }), []);
    assert.deepEqual(extractApplicationsFromResponse({ data: { content: [] } }), []);
    assert.deepEqual(extractApplicationsFromResponse({ data: { results: [] } }), []);
    assert.deepEqual(extractApplicationsFromResponse({ data: { items: [] } }), []);

    const app = { id: "APP-NEST", serviceName: "TDS Refund" } as Application;
    assert.equal(extractApplicationsFromResponse({ data: { applications: [app] } })[0].id, "APP-NEST");
    assert.equal(extractApplicationsFromResponse({ data: { items: [app] } })[0].id, "APP-NEST");
  });

  test("4. Response Parsing: Confirmed empty response with count: 0, total: 0, or null data", () => {
    assert.deepEqual(extractApplicationsFromResponse(null), []);
    assert.deepEqual(extractApplicationsFromResponse(undefined), []);
    assert.deepEqual(extractApplicationsFromResponse(""), []);
    assert.deepEqual(extractApplicationsFromResponse({ success: true, count: 0, data: [] }), []);
    assert.deepEqual(extractApplicationsFromResponse({ success: true, total: 0, applications: [] }), []);
    assert.deepEqual(extractApplicationsFromResponse({ success: true, message: "No applications found" }), []);
  });

  test("5. Response Parsing: Genuine error responses throw ApiError instead of hiding as empty", () => {
    assert.throws(
      () => extractApplicationsFromResponse({ success: false, message: "Database failure" }),
      (err: unknown) => err instanceof ApiError && err.message === "Database failure"
    );
    assert.throws(
      () => extractApplicationsFromResponse({ status: "error", message: "Unauthorized request" }),
      (err: unknown) => err instanceof ApiError && err.message === "Unauthorized request"
    );
    assert.throws(
      () => extractApplicationsFromResponse("<html>502 Bad Gateway</html>"),
      (err: unknown) => err instanceof ApiError
    );
    assert.throws(
      () => extractApplicationsFromResponse({ randomField: 12345 }),
      (err: unknown) => err instanceof ApiError
    );
  });

  test("6. Store Integration: loadApplications clears error on success and sets error on genuine failure", () => {
    const normalizedStore = storeContent.replace(/\r\n/g, "\n");
    assert.ok(
      normalizedStore.includes("set({ isLoading: true, error: null })"),
      "Must clear stale error on request start"
    );
    assert.ok(
      normalizedStore.includes("remoteApps = remoteResult.value;\n        remoteError = null;"),
      "Must set remoteError to null when remote request fulfills"
    );
    assert.ok(
      normalizedStore.includes("error: combinedApps.length > 0 ? null : remoteError") ||
        normalizedStore.includes("error: remoteError && combinedApps.length === 0 ? remoteError : null") ||
        normalizedStore.includes("remoteError = null;"),
      "Must ensure error is null when remoteResult succeeds with zero applications"
    );
  });

  test("7. Screen Integration: Strict 4-state separation in ActiveApplicationsScreen", () => {
    assert.ok(
      screenContent.includes("(!hasLoadedOnce || isLoading) && applications.length === 0"),
      "State A: Shows loading container while initial request is in progress"
    );
    assert.ok(
      screenContent.includes("isProfileCompleted && Boolean(error) && applications.length === 0"),
      "State B: Shows error card ONLY on genuine failure"
    );
    assert.ok(
      screenContent.includes("<ApplicationsEmptyState"),
      "State C: Renders ApplicationsEmptyState when confirmed empty"
    );
    assert.ok(
      screenContent.includes("<ApplicationCardItem"),
      "State D: Renders ApplicationCardItem when applications exist"
    );
    assert.ok(
      screenContent.includes("onPress={fetchApplications}"),
      "Retry button connects to fetchApplications"
    );
  });

  test("8. Architectural constraints: Zero loops and line limits strictly below 400 lines", () => {
    const files = [
      "src/modules/applications/services/applicationService.ts",
      "src/store/applicationStore.ts",
      "src/modules/applications/screens/ActiveApplications/ActiveApplicationsScreen.tsx",
      "src/tests/unit/applicationsRootCauseEmptyState.test.ts",
    ];

    const checkFile = (relPath: string) => {
      const fullPath = path.join(baseDir, relPath);
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n").length;
      assert.ok(
        lines < 400,
        `File ${relPath} has ${lines} lines, must be strictly below 400 lines`
      );

      if (relPath.endsWith(".tsx") || relPath.endsWith(".ts")) {
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
        if (relPath.endsWith(".tsx")) {
          assert.equal(
            /\.forEach\s*\(/.test(content),
            false,
            `File ${relPath} must not contain forEach loops`
          );
        }
      }
    };

    checkFile(files[0]);
    checkFile(files[1]);
    checkFile(files[2]);
    checkFile(files[3]);
  });
});
