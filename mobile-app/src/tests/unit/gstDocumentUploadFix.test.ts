import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("GST Document Upload Flow & Base URL Synchronization", () => {
  const rootDir = path.resolve(__dirname, "../../..");

  const readComponent = (relPath: string) => {
    const fullPath = path.join(rootDir, relPath);
    assert.ok(fs.existsSync(fullPath), `Target file must exist: ${relPath}`);
    return fs.readFileSync(fullPath, "utf-8");
  };

  it("gstUploadHelper exports resolveAsyncApiBaseUrl, normalizeDocumentUri and resolveDocumentMimeType", () => {
    const helper = readComponent("src/modules/gst/services/gstUploadHelper.ts");
    assert.ok(helper.includes("export function normalizeDocumentUri"), "Must export normalizeDocumentUri");
    assert.ok(helper.includes("export function resolveDocumentMimeType"), "Must export resolveDocumentMimeType");
    assert.ok(helper.includes("export async function resolveAsyncApiBaseUrl"), "Must export resolveAsyncApiBaseUrl");
    assert.ok(helper.includes("apiClient.ensureBaseUrlLoaded"), "Must ensure apiClient base URL is loaded");
  });

  it("gstApi uses async base URL resolution, URI normalization, and dynamic MIME types", () => {
    const api = readComponent("src/modules/gst/services/gstApi.ts");
    assert.ok(api.includes("resolveAsyncApiBaseUrl"), "gstApi must import and use resolveAsyncApiBaseUrl");
    assert.ok(api.includes("normalizeDocumentUri"), "gstApi must normalize file URIs");
    assert.ok(api.includes("resolveDocumentMimeType"), "gstApi must resolve MIME type dynamically");
    assert.ok(api.includes("/api/v1/gst/documents/${cleanGstId}/register"), "Must upload to correct endpoint format");
  });

  it("gstFilingApi uses async base URL resolution, URI normalization, and dynamic MIME types", () => {
    const filingApi = readComponent("src/modules/gst/services/gstFilingApi.ts");
    assert.ok(filingApi.includes("resolveAsyncApiBaseUrl"), "gstFilingApi must import and use resolveAsyncApiBaseUrl");
    assert.ok(filingApi.includes("normalizeDocumentUri"), "gstFilingApi must normalize file URIs");
    assert.ok(filingApi.includes("resolveDocumentMimeType"), "gstFilingApi must resolve MIME type dynamically");
    assert.ok(filingApi.includes("/api/v1/gst/filing/documents/${cleanFilingId}/upload"), "Must upload to correct endpoint format");
  });

  it("apiConfig and eas.json use unified SERVER_IP and port 8086", () => {
    const config = readComponent("src/core/api/apiConfig.ts");
    assert.ok(config.includes('SERVER_PORT = 8086'), "Must use port 8086");
    assert.ok(config.includes('STORAGE_KEY_SERVER_URL'), "Must support persistent storage key");
  });

  it("gstold counterparts stay perfectly synced", () => {
    const oldApi = readComponent("src/modules/gstold/services/gstApi.ts");
    assert.ok(oldApi.includes("resolveAsyncApiBaseUrl"), "gstold gstApi must use resolveAsyncApiBaseUrl");

    const oldFilingApi = readComponent("src/modules/gstold/services/gstFilingApi.ts");
    assert.ok(oldFilingApi.includes("resolveAsyncApiBaseUrl"), "gstold gstFilingApi must use resolveAsyncApiBaseUrl");

    const oldHelper = readComponent("src/modules/gstold/services/gstUploadHelper.ts");
    assert.ok(oldHelper.includes("resolveAsyncApiBaseUrl"), "gstold gstUploadHelper must use resolveAsyncApiBaseUrl");
  });
});
