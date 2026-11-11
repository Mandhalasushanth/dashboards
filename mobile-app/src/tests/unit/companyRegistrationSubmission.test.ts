import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import type { CompanyRegistrationDraft } from "../../modules/company-registration/types/registration.types";

(globalThis as any).__DEV__ = true;

const require = createRequire(import.meta.url);
const Module = require("module");
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id: string, ...args: any[]) {
  if (id === "react-native") {
    return {
      Platform: { OS: "android", select: (obj: any) => obj.android || obj.default },
      AppState: { addEventListener: () => ({ remove: () => { } }) },
      Alert: { alert: () => { } },
      StyleSheet: { create: (s: any) => s },
    };
  }
  if (id === "expo-modules-core") {
    const api = {
      EventEmitter: class {
        addListener() { return { remove: () => { } }; }
        removeListener() { }
      },
      NativeModulesProxy: {},
      requireNativeModule: () => ({}),
      requireOptionalNativeModule: () => null,
      Platform: { OS: "android" },
    };
    return { ...api, default: api, __esModule: true };
  }
  if (id === "expo-constants") {
    return {
      default: { expoConfig: { hostUri: "192.168.88.30:8086" }, executionEnvironment: "bare" },
      expoConfig: { hostUri: "192.168.88.30:8086" },
      ExecutionEnvironment: { Bare: "bare", Standalone: "standalone", StoreClient: "storeClient" },
      __esModule: true,
    };
  }
  if (id === "@react-native-async-storage/async-storage") {
    const store = new Map();
    const api = {
      getItem: async (k: string) => store.get(k) || null,
      setItem: async (k: string, v: string) => store.set(k, String(v)),
      removeItem: async (k: string) => store.delete(k),
      clear: async () => store.clear(),
      getAllKeys: async () => Array.from(store.keys()),
    };
    return { ...api, default: api, __esModule: true };
  }
  return originalRequire.apply(this, [id, ...args]);
};

let companyRegistrationApi: typeof import("../../modules/company-registration/services/companyRegistrationApi").companyRegistrationApi;
let apiClient: typeof import("../../core/api/apiClient").apiClient;
let getInitialDraft: typeof import("../../modules/company-registration/store/initialDraft").getInitialDraft;

test.before(async () => {
  const apiMod = await import("../../modules/company-registration/services/companyRegistrationApi");
  companyRegistrationApi = apiMod.companyRegistrationApi;
  const clientMod = await import("../../core/api/apiClient");
  apiClient = clientMod.apiClient;
  const draftMod = await import("../../modules/company-registration/store/initialDraft");
  getInitialDraft = draftMod.getInitialDraft;
});

test("companyRegistrationApi.submitApplication sends POST to /company-registration/apply with mapped payload", async () => {
  let capturedPath = "";
  let capturedBody: any = null;
  let capturedOptions: any = null;

  const originalPost = apiClient.post;
  apiClient.post = (async <T>(path: string, body?: unknown, options?: any): Promise<T> => {
    capturedPath = path;
    capturedBody = body;
    capturedOptions = options;
    return {
      applicationId: 42,
      applicationNumber: "CR2026000042",
      status: "SUBMITTED",
      submittedAt: "2026-10-16T10:00:00",
    } as T;
  }) as any;

  try {
    const draft: CompanyRegistrationDraft = {
      ...getInitialDraft(),
      company: {
        ...getInitialDraft().company,
        companyType: "Private Limited",
        proposedName1: "Test Corp",
      },
      documents: [
        { id: "doc-pan", name: "PAN", category: "KYC", required: true, status: "Uploaded" },
        { id: "doc-aadhaar", name: "Aadhaar", category: "KYC", required: true, status: "Uploaded" },
        { id: "doc-address", name: "Office Proof", category: "Office", required: true, status: "Uploaded" },
        { id: "doc-utility", name: "Utility Bill", category: "Office", required: true, status: "Uploaded" },
        { id: "doc-custom", name: "Custom", category: "Other", required: false, status: "Pending" },
      ],
      opcNominee: {
        name: "Nominee Person",
        pan: "ABCDE1234F",
        aadhaar: "123456789012",
        email: "nominee@test.com",
        phone: "9876543210",
        relationship: "Spouse",
      },
    };

    const res = await companyRegistrationApi.submitApplication(draft);

    assert.equal(capturedPath, "/company-registration/apply", "Expected route is /company-registration/apply");
    assert.equal(capturedBody.status, "Submitted", "Payload status must be Submitted");
    assert.equal(capturedOptions?.timeoutMs, 15000, "Timeout should be 15000ms");

    // Verify document ID mapping to backend enum constants
    assert.equal(capturedBody.documents.length, 4, "Unsupported doc-custom should be filtered out");
    const docIds = capturedBody.documents.map((d: any) => d.id);
    assert.deepEqual(docIds, ["DIRECTOR_PAN", "DIRECTOR_ID_PROOF", "REGISTERED_OFFICE_PROOF", "OFFICE_UTILITY_BILL"]);

    // For non-OPC company, opcNominee must be undefined
    assert.equal(capturedBody.opcNominee, undefined, "opcNominee must be omitted for Private Limited");

    // Verify response
    assert.equal(res.applicationId, 42);
    assert.equal(res.applicationNumber, "CR2026000042");
    assert.equal(res.status, "SUBMITTED");
  } finally {
    apiClient.post = originalPost;
  }
});

test("companyRegistrationApi.submitApplication includes opcNominee when company is OPC", async () => {
  let capturedBody: any = null;

  const originalPost = apiClient.post;
  apiClient.post = (async <T>(_path: string, body?: unknown): Promise<T> => {
    capturedBody = body;
    return {
      applicationId: 99,
      applicationNumber: "CR2026000099",
      status: "SUBMITTED",
    } as T;
  }) as any;

  try {
    const draft: CompanyRegistrationDraft = {
      ...getInitialDraft(),
      company: {
        ...getInitialDraft().company,
        companyType: "One Person Company (OPC)",
      },
      opcNominee: {
        name: "Nominee Person",
        pan: "ABCDE1234F",
        aadhaar: "123456789012",
        email: "nominee@test.com",
        phone: "9876543210",
        relationship: "Spouse",
      },
    };

    await companyRegistrationApi.submitApplication(draft);

    assert.ok(capturedBody.opcNominee, "opcNominee must be included for OPC");
    assert.equal(capturedBody.opcNominee.name, "Nominee Person");
    assert.equal(capturedBody.status, "Submitted");
  } finally {
    apiClient.post = originalPost;
  }
});

test("companyRegistrationApi.submitApplication propagates server failure without masking", async () => {
  const originalPost = apiClient.post;
  apiClient.post = (async (): Promise<never> => {
    throw new Error("No static resource company-registration/apply.");
  }) as any;

  try {
    const draft = getInitialDraft();
    await assert.rejects(
      async () => {
        await companyRegistrationApi.submitApplication(draft);
      },
      {
        message: "No static resource company-registration/apply.",
      }
    );
  } finally {
    apiClient.post = originalPost;
  }
});
