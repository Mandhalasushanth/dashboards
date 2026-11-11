/**
 * Runs the auth lockout / rate-limit tests with Node's built-in test runner.
 *
 *   node scripts/run-auth-lockout-tests.cjs
 *
 * No extra dependencies: TypeScript is transpiled on the fly with the project's own compiler, the
 * "@/" path alias is resolved by hand, and only native modules (react-native, expo-*, async
 * storage) plus a few side-effect services are replaced. The real authService, authApi,
 * passcodeService, secureStorage and apiClient run against a scripted fetch.
 */
const Module = require("module");
const path = require("path");
const fs = require("fs");

const root = path.resolve(path.dirname(process.argv[1]), "..");
const SRC = path.join(root, "src");
const ts = require(path.join(root, "node_modules", "typescript"));

global.__DEV__ = false;
process.env.EXPO_PUBLIC_API_URL = "http://backend.test";

// ---- TypeScript on the fly -------------------------------------------------------------------
for (const ext of [".ts", ".tsx"]) {
  require.extensions[ext] = (module, filename) => {
    const out = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      fileName: filename,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
      },
    });
    module._compile(out.outputText, filename);
  };
}

for (const ext of [".png", ".jpg", ".jpeg", ".gif", ".webp"]) {
  require.extensions[ext] = (module, filename) => {
    module.exports = { uri: filename };
  };
}

// ---- "@/" alias -----------------------------------------------------------------------------
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) {
    return originalResolve.call(this, path.join(SRC, request.slice(2)), ...rest);
  }
  return originalResolve.call(this, request, ...rest);
};

// ---- Native module fakes (shared storage survives a simulated app restart) -------------------
const secureStore = new Map();
const asyncStore = new Map();

// Minimal React Native components so real components can be rendered to static markup (react-dom/server)
// in tests. Every host component records its props in `renders` so a test can read callbacks and flags.
const React = require("react");
const renders = { touchables: [], datePickers: [], modals: [], texts: [] };
const host = (name, bucket) => {
  const Component = (props) => {
    if (bucket) renders[bucket].push(props);
    return React.createElement("div", { "data-rn": name }, props.children);
  };
  Component.displayName = name;
  return Component;
};
const Keyboard = {
  dismissCalls: 0,
  dismiss() {
    Keyboard.dismissCalls += 1;
  },
  addListener: () => ({ remove() {} }),
};

const nativeFakes = {
  "react-native": {
    Platform: { OS: "ios", select: (o) => o.ios ?? o.default },
    AppState: { addEventListener: () => ({ remove() {} }) },
    View: host("View"),
    Text: host("Text", "texts"),
    TextInput: host("TextInput"),
    Modal: host("Modal", "modals"),
    TouchableOpacity: host("TouchableOpacity", "touchables"),
    StyleSheet: { create: (s) => s, flatten: (s) => s },
    Keyboard,
  },
  "@react-native-community/datetimepicker": host("DateTimePicker", "datePickers"),
  "@expo/vector-icons/Ionicons": host("Ionicons"),
  "expo-secure-store": {
    getItemAsync: async (k) => (secureStore.has(k) ? secureStore.get(k) : null),
    setItemAsync: async (k, v) => void secureStore.set(k, String(v)),
    deleteItemAsync: async (k) => void secureStore.delete(k),
  },
  "@react-native-async-storage/async-storage": {
    getItem: async (k) => (asyncStore.has(k) ? asyncStore.get(k) : null),
    setItem: async (k, v) => void asyncStore.set(k, String(v)),
    removeItem: async (k) => void asyncStore.delete(k),
    multiGet: async (keys) => keys.map((k) => [k, asyncStore.get(k) ?? null]),
    getAllKeys: async () => [...asyncStore.keys()],
  },
  "expo-constants": { expoConfig: { extra: {} }, appOwnership: "standalone" },
  "expo-local-authentication": {
    AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
    hasHardwareAsync: async () => true,
    isEnrolledAsync: async () => true,
    supportedAuthenticationTypesAsync: async () => [1],
    authenticateAsync: async () => ({ success: true }),
  },
  "expo-modules-core": { requireNativeModule: () => ({}), requireOptionalNativeModule: () => null, Platform: { OS: "ios" } },
};

const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (Object.prototype.hasOwnProperty.call(nativeFakes, id)) {
    const api = nativeFakes[id];
    // A fake that is a function is a component module: its default export is the component itself.
    if (typeof api === "function") return { default: api, __esModule: true };
    return { ...api, default: api, __esModule: true };
  }
  return originalRequire.apply(this, arguments);
};

// ---- Side-effect services replaced by resolved path -----------------------------------------
const logs = [];
const record = (level) => (...args) => void logs.push(`${level} ${args.map((a) => JSON.stringify(a)).join(" ")}`);
const noopLogger = { debug: record("debug"), info: record("info"), warn: record("warn"), error: record("error") };
const tokens = { access: null, refresh: null };
const userStore = new Map();
const calls = { sessionCleared: false, session: null };

const JwtUtilsStub = {
  decodePayload(token) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  },
  isStructureAndExpiryValid(token, bufferSeconds = 30) {
    if (!token || token.trim().length === 0) return false;
    const payload = this.decodePayload(token);
    if (!payload || typeof payload.exp !== "number") return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowSeconds + bufferSeconds;
  },
};

const stubs = {
  "core/logging/logger": { logger: noopLogger, default: noopLogger },
  "core/authentication/tokenManager": {
    tokenManager: {
      getAccessToken: async () => tokens.access,
      getRefreshToken: async () => tokens.refresh,
      setAccessToken: async (t) => void (tokens.access = t),
      setRefreshToken: async (t) => void (tokens.refresh = t),
      clearTokens: async () => void (tokens.access = tokens.refresh = null),
      hasValidToken: async () => {
        if (!tokens.access) return false;
        return JwtUtilsStub.isStructureAndExpiryValid(tokens.access);
      },
    },
    JwtUtils: JwtUtilsStub,
  },
  "core/authentication/tokenRefreshManager": {
    tokenRefreshManager: {
      attemptRefresh: async () => {
        if (!tokens.refresh) return false;
        try {
          const res = await globalThis.fetch("http://backend.test/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: tokens.refresh }),
          });
          if (!res.ok) return false;
          const data = JSON.parse(await res.text());
          if (data.accessToken && data.refreshToken) {
            tokens.access = data.accessToken;
            tokens.refresh = data.refreshToken;
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
      onSessionExpired: () => {},
    },
  },
  "modules/authentication/services/authStorage": {
    authStorage: {
      getUserByMobile: (m) => userStore.get(m) ?? null,
      getUser: () => {
        const s = calls.session;
        return s?.activeMobile ? (userStore.get(s.activeMobile) ?? null) : null;
      },
      saveUser: (u) => void userStore.set(u.mobileNumber, u),
      saveSession(s) {
        calls.sessionCleared = false;
        calls.session = s;
      },
      clearSession() {
        calls.sessionCleared = true;
        calls.session = null;
      },
      getSession: () => calls.session ?? ({ isLoggedIn: false, activeMobile: null }),
    },
  },
  "utils/pushNotificationService": { registerForPushNotificationsAsync: async () => null },
};

function installStubs() {
  for (const [rel, exports] of Object.entries(stubs)) {
    const file = require.resolve(path.join(SRC, rel));
    require.cache[file] = { id: file, filename: file, loaded: true, exports, children: [], paths: [] };
  }
}

/** Drops every cached app module (not the stubs' state) so the next require is a "fresh app launch". */
function freshLaunch() {
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(SRC)) delete require.cache[key];
  }
  installStubs();
}

// Exposed to the test file, which runs in the same process.
global.__authTest = { secureStore, asyncStore, tokens, userStore, calls, logs, renders, Keyboard, freshLaunch, SRC };
installStubs();

// Optional first argument selects a test file; the default is the lockout suite.
const testFile = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(SRC, "tests", "unit", "authLockout.test.ts");
require(testFile);
