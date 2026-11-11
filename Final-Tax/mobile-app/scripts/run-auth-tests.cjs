global.__DEV__ = true;

const Module = require('module');
const originalRequire = Module.prototype.require;

// Mock storage instances
const asyncStore = new Map();
const secStore = new Map();

Module.prototype.require = function (id) {
  if (id === 'react-native') {
    return {
      Platform: { OS: 'ios', select: (obj) => obj.ios || obj.default },
      AppState: { addEventListener: () => ({ remove: () => {} }) },
      Alert: { alert: () => {} },
      StyleSheet: { create: (s) => s },
      NativeModules: {},
      NativeEventEmitter: class {
        addListener() { return { remove: () => {} }; }
        removeListeners() {}
      },
    };
  }
  if (id === 'expo-modules-core') {
    const api = {
      EventEmitter: class {
        addListener() { return { remove: () => {} }; }
        removeListener() {}
      },
      NativeModulesProxy: {},
      requireNativeModule: () => ({}),
      requireOptionalNativeModule: () => null,
      Platform: { OS: 'ios' },
    };
    return {
      ...api,
      default: api,
      __esModule: true,
    };
  }
  if (id === '@react-native-async-storage/async-storage') {
    const api = {
      getItem: async (k) => asyncStore.get(k) || null,
      setItem: async (k, v) => asyncStore.set(k, String(v)),
      removeItem: async (k) => asyncStore.delete(k),
      clear: async () => asyncStore.clear(),
      getAllKeys: async () => Array.from(asyncStore.keys()),
    };
    return {
      ...api,
      default: api,
      __esModule: true,
      __store: asyncStore,
    };
  }
  if (id === 'expo-secure-store') {
    const api = {
      getItemAsync: async (k) => secStore.get(k) || null,
      setItemAsync: async (k, v) => secStore.set(k, String(v)),
      deleteItemAsync: async (k) => secStore.delete(k),
    };
    return {
      ...api,
      default: api,
      __esModule: true,
      __secStore: secStore,
    };
  }
  if (id === 'expo-local-authentication') {
    const api = {
      AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
      hasHardwareAsync: async () => true,
      isEnrolledAsync: async () => true,
      supportedAuthenticationTypesAsync: async () => [2], // FACIAL_RECOGNITION
      authenticateAsync: async (opts) => ({ success: true }),
    };
    return {
      ...api,
      default: api,
      __esModule: true,
    };
  }
  if (id === 'expo-constants') {
    const ExecutionEnvironment = { Bare: 'bare', Standalone: 'standalone', StoreClient: 'storeClient' };
    const api = {
      expoConfig: { extra: {} },
      appOwnership: 'standalone',
      executionEnvironment: ExecutionEnvironment.Standalone,
      ExecutionEnvironment,
    };
    return {
      ...api,
      ExecutionEnvironment,
      default: api,
      __esModule: true,
    };
  }
  if (id === 'expo-device') {
    const api = { isDevice: true };
    return {
      ...api,
      default: api,
      __esModule: true,
    };
  }
  if (id === 'expo-router') {
    const api = {
      useRouter: () => ({ replace: () => {}, push: () => {}, back: () => {} }),
    };
    return {
      ...api,
      default: api,
      __esModule: true,
    };
  }
  return originalRequire.apply(this, arguments);
};

async function main() {
  try {
    const { runAllAuthIntegrationTests } = require('../src/tests/integration/auth_flow.test.ts');
    const result = await runAllAuthIntegrationTests();
    if (result.failed > 0) {
      console.error("Tests failed: " + result.failed + "/" + result.total);
      process.exitCode = 1;
    } else {
      console.log("All " + result.passed + " test scenarios passed successfully!");
      process.exitCode = 0;
    }
  } catch (err) {
    console.error('Fatal error running tests:', err);
    process.exitCode = 1;
  }
}

main();
