import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { isRouteBusy } from "../../core/updates/updateHelpers";

describe("OTA Updates Architecture & Safety Tests", () => {
  describe("1. Busy Route Detection (isRouteBusy)", () => {
    it("flags active filing routes as busy", () => {
      assert.equal(isRouteBusy("/service/itr-filing"), true);
      assert.equal(isRouteBusy("/service/itr-documents"), true);
      assert.equal(isRouteBusy("/service/gst-registration"), true);
      assert.equal(isRouteBusy("/service/tds-form"), true);
      assert.equal(isRouteBusy("/service/loans"), true);
    });

    it("flags active payment routes as busy", () => {
      assert.equal(isRouteBusy("/payment/pay_123"), true);
      assert.equal(isRouteBusy("/payment/status"), true);
    });

    it("flags application and chat support routes as busy", () => {
      assert.equal(isRouteBusy("/application/app_456"), true);
      assert.equal(isRouteBusy("/chat/support"), true);
      assert.equal(isRouteBusy("/chat/chat_789"), true);
    });

    it("flags authentication routes as busy", () => {
      assert.equal(isRouteBusy("/(auth)/login"), true);
      assert.equal(isRouteBusy("/(auth)/passcode"), true);
    });

    it("allows non-intrusive banner on safe/idle screens", () => {
      assert.equal(isRouteBusy("/(main)"), false);
      assert.equal(isRouteBusy("/(main)/home"), false);
      assert.equal(isRouteBusy("/(main)/services"), false);
      assert.equal(isRouteBusy("/(main)/filings"), false);
      assert.equal(isRouteBusy("/(main)/profile"), false);
      assert.equal(isRouteBusy("/settings"), false);
      assert.equal(isRouteBusy("/notifications"), false);
      assert.equal(isRouteBusy("/"), false);
      assert.equal(isRouteBusy(null), false);
      assert.equal(isRouteBusy(undefined), false);
    });
  });

  describe("2. Expo & EAS Update Configuration Integrity", () => {
    const appJsonPath = path.resolve(__dirname, "../../../app.json");
    const easJsonPath = path.resolve(__dirname, "../../../eas.json");
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
    const easJson = JSON.parse(fs.readFileSync(easJsonPath, "utf-8"));

    const EXPECTED_PROJECT_ID = "903596d2-48e5-4d35-ae72-3f34cba67b4a";

    it("configures app.json with valid updates and runtimeVersion", () => {
      assert.equal(appJson.expo.slug, "finsolz");
      assert.equal(appJson.expo.name, "Finsolz");
      assert.equal(appJson.expo.extra.eas.projectId, EXPECTED_PROJECT_ID);

      assert.ok(appJson.expo.updates, "updates block must be present");
      assert.equal(
        appJson.expo.updates.url,
        `https://u.expo.dev/${EXPECTED_PROJECT_ID}`
      );
      assert.equal(appJson.expo.updates.checkAutomatically, "NEVER");
      assert.equal(appJson.expo.updates.enabled, true);

      assert.deepEqual(appJson.expo.runtimeVersion, { policy: "appVersion" });
      assert.ok(
        appJson.expo.plugins.includes("expo-updates"),
        "plugins must include expo-updates"
      );
    });

    it("configures eas.json with distinct channels and build profiles", () => {
      const builds = easJson.build;
      assert.ok(builds, "eas.json must have build profiles");

      // Staging channel
      assert.ok(builds.staging, "staging profile must exist");
      assert.equal(builds.staging.channel, "staging");
      assert.equal(builds.staging.distribution, "internal");
      assert.equal(builds.staging.android?.buildType, "apk");

      // Production APK channel
      assert.ok(builds["production-apk"], "production-apk profile must exist");
      assert.equal(builds["production-apk"].channel, "production");
      assert.equal(builds["production-apk"].distribution, "internal");
      assert.equal(builds["production-apk"].android?.buildType, "apk");

      // Production Store channel
      assert.ok(builds.production, "production profile must exist");
      assert.equal(builds.production.channel, "production");
      assert.equal(builds.production.distribution, "store");
      assert.equal(builds.production.android?.buildType, "app-bundle");
    });
  });
});
