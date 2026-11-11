import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("TDS Refund Screen 1 — Personal Information Card Removal", () => {
  const formScreenPath = path.resolve(
    __dirname,
    "../../modules/itr/tds/screens/TdsRefundFormScreen/TdsRefundFormScreen.tsx"
  );
  const businessSectionPath = path.resolve(
    __dirname,
    "../../modules/itr/tds/screens/TdsRefundFormScreen/BusinessDetailsSection.tsx"
  );
  const bankSectionPath = path.resolve(
    __dirname,
    "../../modules/itr/tds/screens/TdsRefundFormScreen/RefundBankAccountSection.tsx"
  );

  const formScreenContent = fs.readFileSync(formScreenPath, "utf-8");
  const businessSectionContent = fs.readFileSync(businessSectionPath, "utf-8");
  const bankSectionContent = fs.readFileSync(bankSectionPath, "utf-8");

  it("TdsRefundFormScreen does not import PersonalInfoSection", () => {
    assert.equal(
      formScreenContent.includes("PersonalInfoSection"),
      false,
      "TdsRefundFormScreen should not import PersonalInfoSection"
    );
  });

  it("TdsRefundFormScreen does not render PersonalInfoSection JSX", () => {
    assert.equal(
      formScreenContent.includes("<PersonalInfoSection"),
      false,
      "TdsRefundFormScreen should not render <PersonalInfoSection"
    );
  });

  it("TdsRefundFormScreen begins form with BusinessDetailsSection", () => {
    assert.equal(
      formScreenContent.includes("<BusinessDetailsSection"),
      true,
      "TdsRefundFormScreen must render BusinessDetailsSection"
    );
    assert.equal(
      formScreenContent.includes("<RefundBankAccountSection"),
      true,
      "TdsRefundFormScreen must render RefundBankAccountSection"
    );
  });

  it("BusinessDetailsSection has section number 1", () => {
    assert.equal(
      businessSectionContent.includes('<SectionHeader number={1} title="Business Details" />'),
      true,
      "BusinessDetailsSection must have SectionHeader number={1}"
    );
    assert.equal(
      businessSectionContent.includes('<SectionHeader number={2} title="Business Details" />'),
      false,
      "BusinessDetailsSection must no longer have number={2}"
    );
  });

  it("RefundBankAccountSection has section number 2", () => {
    assert.equal(
      bankSectionContent.includes('<SectionHeader number={2} title="Refund Bank Account" />'),
      true,
      "RefundBankAccountSection must have SectionHeader number={2}"
    );
    assert.equal(
      bankSectionContent.includes('<SectionHeader number={3} title="Refund Bank Account" />'),
      false,
      "RefundBankAccountSection must no longer have number={3}"
    );
  });
});

