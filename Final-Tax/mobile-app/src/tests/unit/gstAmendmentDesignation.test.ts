/// <reference types="node" />
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  validateAmendmentFieldValue,
  validateSectionForm,
  ALLOWED_DESIGNATION_TITLES,
} from "../../modules/gst/gst-amendment/utils/gstAmendmentValidation";
import { INITIAL_AMENDMENT_FORM_DATA } from "../../modules/gst/gst-amendment/types/gstAmendmentTypes";
import type { AmendmentFormData, SupportingDoc } from "../../modules/gst/gst-amendment/types/gstAmendmentTypes";

const FIELD = "newSignatoryDesignation" as const;
const EMPTY_FORM: AmendmentFormData = { ...INITIAL_AMENDMENT_FORM_DATA };

const validate = (value: string) =>
  validateAmendmentFieldValue(FIELD, value, EMPTY_FORM, true);

const VALID_SIGNATORY_FORM: AmendmentFormData = {
  ...INITIAL_AMENDMENT_FORM_DATA,
  newSignatoryName: "John Smith",
  newSignatoryPan: "ABCPF1234Z",
  newSignatoryDob: "01-01-1990",
  newSignatoryDesignation: "MR",
  newSignatoryMobile: "9876543210",
  newSignatoryEmail: "john.smith@example.com",
};

const MOCK_DOC: SupportingDoc = { uri: "file://mock.pdf", name: "proof.pdf", size: "100 KB" };

describe("GST Amendment — Designation Title Validation (allowlist)", () => {
  describe("Allowlist export sanity", () => {
    it("ALLOWED_DESIGNATION_TITLES contains the canonical set", () => {
      assert.ok(ALLOWED_DESIGNATION_TITLES.has("MR"));
      assert.ok(ALLOWED_DESIGNATION_TITLES.has("MS"));
      assert.ok(ALLOWED_DESIGNATION_TITLES.has("DR"));
      assert.ok(ALLOWED_DESIGNATION_TITLES.has("MRS"));
      assert.ok(ALLOWED_DESIGNATION_TITLES.has("DRS"));
      assert.equal(ALLOWED_DESIGNATION_TITLES.size, 5);
    });
  });

  describe("Accepted values", () => {
    it("MR is accepted", () => {
      assert.equal(validate("MR"), null);
    });

    it("MS is accepted", () => {
      assert.equal(validate("MS"), null);
    });

    it("DR is accepted", () => {
      assert.equal(validate("DR"), null);
    });

    it("MRS is accepted", () => {
      assert.equal(validate("MRS"), null);
    });

    it("DRS is accepted", () => {
      assert.equal(validate("DRS"), null);
    });

    it("lowercase input is normalised to uppercase before allowlist check", () => {
      assert.equal(validate("mr"), null);
      assert.equal(validate("Ms"), null);
      assert.equal(validate("dR"), null);
    });

    it("leading/trailing whitespace is trimmed before checking", () => {
      assert.equal(validate("  MR  "), null);
    });
  });

  describe("Rejected values", () => {
    it("empty designation is rejected", () => {
      const err = validate("");
      assert.ok(err, "Empty must be rejected");
    });

    it("whitespace-only is rejected", () => {
      const err = validate("   ");
      assert.ok(err, "Whitespace-only must be rejected");
    });

    it("ABC is rejected (not in allowlist)", () => {
      assert.ok(validate("ABC") !== null, "ABC must be rejected");
    });

    it("MR1 is rejected (digit present)", () => {
      assert.ok(validate("MR1") !== null, "MR1 must be rejected");
    });

    it("MR@ is rejected (special character present)", () => {
      assert.ok(validate("MR@") !== null, "MR@ must be rejected");
    });

    it("MR (with trailing space before trim) is accepted after trim", () => {
      assert.equal(validate("MR "), null, "Trailing space trims away — MR is valid");
    });

    it("more than 3 characters are rejected", () => {
      const over3 = ["MRSDR", "MASTER", "ABCDE"];
      over3.forEach((val) => {
        assert.ok(validate(val) !== null, `"${val}" (>3 chars) must be rejected`);
      });
    });

    it("numbers-only is rejected", () => {
      assert.ok(validate("123") !== null, "Numbers-only must be rejected");
    });

    it("emoji is rejected", () => {
      assert.ok(validate("MR😀") !== null, "Emoji must be rejected");
    });

    it("arbitrary professional titles are rejected", () => {
      const rejected = ["Director", "Partner", "Proprietor", "CEO", "MD"];
      rejected.forEach((val) => {
        assert.ok(validate(val) !== null, `"${val}" must be rejected as it is not in the allowlist`);
      });
    });
  });

  describe("Error message", () => {
    it("error message is user-friendly and matches spec for all rejected inputs", () => {
      const inputs = ["", "   ", "ABC", "MR1", "MR@", "😀", "Director", "MASTER"];
      inputs.forEach((input) => {
        const err = validate(input);
        assert.ok(err, `"${input}" must be rejected`);
        assert.equal(
          err,
          "Enter a valid designation (MR, MS, DR or DRS).",
          `Error for "${input}" must match spec`
        );
      });
    });
  });

  describe("Review/Submit gate", () => {
    it("valid designation (MR) allows proceeding to Review", () => {
      const { errors } = validateSectionForm(
        "authorised-signatories",
        VALID_SIGNATORY_FORM,
        MOCK_DOC
      );
      assert.equal(errors.newSignatoryDesignation, undefined, "No error for valid designation MR");
    });

    it("invalid designation blocks proceed-to-Review", () => {
      const formInvalid: AmendmentFormData = { ...VALID_SIGNATORY_FORM, newSignatoryDesignation: "" };
      const { isValid, errors } = validateSectionForm("authorised-signatories", formInvalid, MOCK_DOC);
      assert.equal(isValid, false);
      assert.ok(errors.newSignatoryDesignation, "Designation error must be in errors object");
    });

    it("arbitrary 3-letter value (not in allowlist) blocks Review", () => {
      const formInvalid: AmendmentFormData = { ...VALID_SIGNATORY_FORM, newSignatoryDesignation: "ABC" };
      const { isValid, errors } = validateSectionForm("authorised-signatories", formInvalid, MOCK_DOC);
      assert.equal(isValid, false);
      assert.ok(errors.newSignatoryDesignation, "ABC must block Review since it is not in the allowlist");
    });
  });
});
