import { BrandColors } from "@/shared/theme";
import { AmendmentSectionConfig } from "../types/gstAmendmentTypes";
import { CORE_AMENDMENT_SECTIONS, CORE_ACCEPTED_PROOFS } from "./gstCoreAmendmentConfig";

export const NON_CORE_AMENDMENT_SECTIONS: AmendmentSectionConfig[] = [
  {
    id: "bank-accounts",
    title: "Bank Accounts",
    type: "non-core",
    typeLabel: "Non-core - auto-approved",
    icon: "wallet",
    image: require("@/../assets/images/services/gst/bank_accounts.png"),
    iconBg: "#F3E8FF",
    iconColor: "#7E22CE",
  },
  {
    id: "authorised-signatories",
    title: "Authorised Signatories",
    type: "non-core",
    typeLabel: "Non-core - auto-approved",
    icon: "create",
    image: require("@/../assets/images/services/gst/authorised_signatories.png"),
    iconBg: "#FFF1E8",
    iconColor: BrandColors.PRIMARY_ORANGE_DARK,
  },
  {
    id: "contact-details",
    title: "Contact Details",
    type: "non-core",
    typeLabel: "Non-core - auto-approved",
    icon: "call",
    image: require("@/../assets/images/services/gst/contact_details.png"),
    iconBg: "#FCE7F3",
    iconColor: "#DB2777",
  },
];

export const BANK_ACCOUNT_TYPES = [
  "Current",
  "Savings",
  "Cash Credit",
];

export const NON_CORE_ACCEPTED_PROOFS: Record<string, { initial: string[]; all: string[] }> = {
  "bank-accounts": {
    initial: [
      "Bank Statement",
      "First Page of Passbook",
      "Cancelled Cheque",
    ],
    all: [
      "Bank Statement",
      "First Page of Passbook",
      "Cancelled Cheque",
      "Recent Bank Account Statement (last 3 months)",
      "Bank Account Certificate issued by Bank",
      "Letter from Bank confirming account details",
    ],
  },
  "authorised-signatories": {
    initial: [
      "Letter of Authorisation",
      "Board Resolution",
      "Managing Committee Resolution",
    ],
    all: [
      "Letter of Authorisation",
      "Board Resolution",
      "Managing Committee Resolution",
      "Acceptance Letter accompanying the Resolution",
      "Applicable official appointment / authorisation document",
      "Other official authorisation document applicable to the entity",
    ],
  },
  "contact-details": {
    initial: [
      "Official government/business registration document showing the updated contact details",
      "Official government correspondence showing the updated contact details",
      "Other supporting document showing the updated contact details",
    ],
    all: [
      "Official government/business registration document showing the updated contact details",
      "Official government correspondence showing the updated contact details",
      "Other supporting document showing the updated contact details",
      "Board Resolution / Authorization for contact update",
      "Utility Bill in the name of the entity / authorized person",
      "Other official document evidencing the contact detail change",
    ],
  },
};

export const AMENDMENT_SECTIONS: AmendmentSectionConfig[] = [
  ...CORE_AMENDMENT_SECTIONS,
  ...NON_CORE_AMENDMENT_SECTIONS,
];

export const SECTION_ACCEPTED_PROOFS: Record<string, { initial: string[]; all: string[] }> = {
  ...CORE_ACCEPTED_PROOFS,
  ...NON_CORE_ACCEPTED_PROOFS,
};
