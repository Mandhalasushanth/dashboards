import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";

import { validateGstinFull } from "../../modules/gst/utils/gstValidation";
import { validateGstinInput } from "../../modules/gst/gst-amendment/utils/gstAmendmentValidation";

const ROOT = path.resolve(__dirname, "../../..");
const SCREEN_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-certificate/screens/GstCertificateScreen/GstCertificateScreen.tsx"
);
const HOOK_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-certificate/hooks/useGstCertificateFlow.ts"
);

describe("GST Certificate Bug Fixes", () => {
  describe("validateGstinFull: valid GSTIN format", () => {
    it("accepts Delhi GSTIN", () => {
      assert.equal(validateGstinFull("07AAAPZ1234A1Z0"), null);
    });

    it("accepts Maharashtra GSTIN", () => {
      assert.equal(validateGstinFull("27AABCU9603R1ZP"), null);
    });

    it("accepts West Bengal GSTIN", () => {
      assert.equal(validateGstinFull("19AAACR5055K1ZB"), null);
    });

    it("normalises lowercase input before validating", () => {
      assert.equal(validateGstinFull("07aaapz1234a1z0"), null);
    });
  });

  describe("validateGstinFull: empty / length errors", () => {
    it("rejects empty string", () => {
      assert.equal(validateGstinFull(""), "Enter a valid 15-character GSTIN.");
    });

    it("rejects whitespace-only input", () => {
      assert.equal(validateGstinFull("   "), "Enter a valid 15-character GSTIN.");
    });

    it("rejects GSTIN shorter than 15 chars", () => {
      assert.equal(validateGstinFull("07AAAPZ1234A1Z"), "Enter a valid 15-character GSTIN.");
    });

    it("rejects GSTIN longer than 15 chars", () => {
      assert.equal(validateGstinFull("07AAAPZ1234A1Z0X"), "Enter a valid 15-character GSTIN.");
    });
  });

  describe("validateGstinFull: format / structure errors", () => {
    it("rejects GSTIN containing spaces", () => {
      assert.equal(validateGstinFull("07 AAAPZ1234A1Z0"), "Enter a valid GSTIN format.");
    });

    it("rejects GSTIN containing emoji", () => {
      assert.equal(validateGstinFull("07AAAPZ1234A1Z😂"), "Enter a valid GSTIN format.");
    });

    it("rejects GSTIN where position 14 is not Z", () => {
      assert.equal(validateGstinFull("07AAAPZ1234A1A0"), "Enter a valid GSTIN format.");
    });

    it("rejects GSTIN with digits in the 5-letter PAN alphabetic prefix", () => {
      assert.equal(validateGstinFull("07123PZ1234A1Z0"), "Enter a valid GSTIN format.");
    });
  });

  describe("validateGstinFull: CIN / company numbers rejected", () => {
    it("rejects CIN U62010TS2025PTC (starts with letter, not 2-digit state code)", () => {
      assert.equal(validateGstinFull("U62010TS2025PTC"), "Enter a valid GSTIN format.");
    });

    it("rejects another CIN format L12345MH2020PLC", () => {
      assert.equal(validateGstinFull("L12345MH2020PLC"), "Enter a valid GSTIN format.");
    });
  });

  describe("validateGstinFull: state-code whitelist no longer applied", () => {
    it("accepts state code 99 (2 numeric digits — format is valid)", () => {
      assert.equal(validateGstinFull("99AAAPZ1234A1Z0"), null);
    });

    it("accepts state code 25 (2 numeric digits — format is valid)", () => {
      assert.equal(validateGstinFull("25AAAPZ1234A1Z0"), null);
    });

    it("accepts state code 28 (2 numeric digits — format is valid)", () => {
      assert.equal(validateGstinFull("28AAAPZ1234A1Z0"), null);
    });
  });

  describe("validateGstinFull: checksum not verified — structurally valid GSTINs with non-matching checksum must pass", () => {
    it("accepts 07AAAPZ1234A1Z5 even though its checksum digit does not match the GSTN algorithm", () => {
      assert.equal(validateGstinFull("07AAAPZ1234A1Z5"), null);
    });

    it("accepts 27AABCU9603R1Z0 even though the correct checksum is P not 0", () => {
      assert.equal(validateGstinFull("27AABCU9603R1Z0"), null);
    });
  });

  describe("validateGstinFull: entity-type character not restricted", () => {
    it("accepts D at the entity-type position (position 6) — any uppercase letter is allowed", () => {
      assert.equal(validateGstinFull("07AAADZ1234A1Z0"), null);
    });
  });

  describe("Bug 2 — Back button absent on completed screen", () => {
    it("back button is absent when flow.isCompleted is true", () => {
      const source = fs.readFileSync(SCREEN_FILE, "utf-8");
      assert.ok(
        source.includes("!flow.isCompleted"),
        "Screen must conditionally hide back button based on flow.isCompleted"
      );
    });

    it("completed state renders a placeholder instead of TouchableOpacity back button", () => {
      const source = fs.readFileSync(SCREEN_FILE, "utf-8");
      assert.ok(
        source.includes("<View style={st.backBtn} />"),
        "A placeholder View must replace the back button when completed"
      );
    });

    it("back button onPress no longer contains isCompleted branch", () => {
      const source = fs.readFileSync(SCREEN_FILE, "utf-8");
      assert.ok(
        source.includes("onPress={() => flow.router.back()}"),
        "Back button onPress must be a simple router.back() call, not an isCompleted branch"
      );
    });

    it("Go to My Applications button is still present on completed screen", () => {
      const source = fs.readFileSync(SCREEN_FILE, "utf-8");
      assert.ok(
        source.includes("Go to My Applications"),
        "Go to My Applications button must remain intact"
      );
    });
  });

  describe("Hook uses validateGstinFull", () => {
    it("hook imports validateGstinFull from gstValidation", () => {
      const source = fs.readFileSync(HOOK_FILE, "utf-8");
      assert.ok(
        source.includes("validateGstinFull"),
        "Hook must import and use validateGstinFull"
      );
    });

    it("hook performs real-time validation when GSTIN reaches 15 chars", () => {
      const source = fs.readFileSync(HOOK_FILE, "utf-8");
      assert.ok(
        source.includes("cleaned.length === 15"),
        "Hook must trigger validateGstinFull when GSTIN reaches 15 characters"
      );
    });

    it("hook provides handleGstinBlur for blur validation", () => {
      const source = fs.readFileSync(HOOK_FILE, "utf-8");
      assert.ok(
        source.includes("handleGstinBlur"),
        "Hook must export handleGstinBlur"
      );
    });

    it("screen calls handleGstinBlur onBlur", () => {
      const source = fs.readFileSync(SCREEN_FILE, "utf-8");
      assert.ok(
        source.includes("onBlur={flow.handleGstinBlur}"),
        "Screen must bind onBlur to flow.handleGstinBlur"
      );
    });
  });
});

describe("GST Certificate & Amendment — same canonical GSTIN validator", () => {
  const VALID_GSTINS = [
    "07AAAPZ1234A1Z0",
    "27AABCU9603R1ZP",
    "19AAACR5055K1ZB",
    // State codes outside historic whitelist — format is valid
    "99AAAPZ1234A1Z0",
    "25AAAPZ1234A1Z0",
    // Structurally valid but checksum does not match algorithm — must pass
    "27AABCU9603R1Z0",
    "07AAAPZ1234A1Z5",
    // Entity-type character not in the old restricted set — must pass
    "07AAADZ1234A1Z0",
  ];

  const INVALID_CASES: [string, string][] = [
    ["07AAAPZ1234A1Z",   "14 chars — too short"],
    ["07AAAPZ1234A1Z0X", "16 chars — too long"],
    ["07123PZ1234A1Z0",  "digits in PAN alpha prefix"],
    ["07AAAPZ1234A1A0",  "invalid Z position (position 14 is not Z)"],
    ["U62010TS2025PTC",  "CIN format — starts with letter"],
    ["L12345MH2020PLC",  "CIN format — L prefix"],
    ["07AAAPZ1234A1Z😂", "emoji — invalid character"],
    ["07 AAAPZ1234A1Z0", "space — invalid character"],
  ];

  describe("valid GSTINs — both validators accept", () => {
    VALID_GSTINS.forEach((gstin) => {
      it(`${gstin} is accepted by validateGstinFull (Certificate)`, () => {
        assert.equal(validateGstinFull(gstin), null, `${gstin} must be valid`);
      });

      it(`${gstin} accepted by Amendment validator maps to isValid:true`, () => {
        const res = validateGstinInput(gstin);
        assert.equal(res.isValid, true, `${gstin} must pass Amendment validator`);
      });
    });
  });

  describe("invalid GSTINs — both validators reject", () => {
    INVALID_CASES.forEach(([gstin, label]) => {
      it(`Certificate validator rejects: ${label}`, () => {
        assert.ok(
          validateGstinFull(gstin) !== null,
          `validateGstinFull must reject "${gstin}" (${label})`
        );
      });

      it(`Amendment validator rejects: ${label}`, () => {
        const res = validateGstinInput(gstin);
        assert.equal(res.isValid, false, `validateGstinInput must reject "${gstin}" (${label})`);
      });
    });
  });

  describe("Amendment validator delegates to validateGstinFull", () => {
    it("gstAmendmentValidation imports validateGstinFull", () => {
      const source = fs.readFileSync(
        path.join(ROOT, "src/modules/gst/gst-amendment/utils/gstAmendmentValidation.ts"),
        "utf-8"
      );
      assert.ok(
        source.includes("validateGstinFull"),
        "gstAmendmentValidation must import and call validateGstinFull"
      );
    });
  });
});
