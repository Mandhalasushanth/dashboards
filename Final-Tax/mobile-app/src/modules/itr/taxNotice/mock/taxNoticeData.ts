import {
  TaxNoticeFormData,
  TaxNoticeSummaryData,
  TaxNoticeSupportingDoc,
  NoticeTrackingStep,
  NoticeStatusDetails,
  NoticeTypeOption,
} from "../types/taxNotice.types";

export const INITIAL_TAX_NOTICE_FORM_DATA: TaxNoticeFormData = {
  pan: "",
  assessmentYear: "",
  noticeType: "",
  noticeDate: "",
  noticeNumber: "",
  responseDueDate: "",
  customerExplanation: "",
  noticeFileUri: undefined,
  noticeFileName: undefined,
  noticeFileSize: undefined,
  noticeFileType: undefined,
};

export const NOTICE_TYPE_OPTIONS: NoticeTypeOption[] = [
  {
    label: "Section 143(1)(a) - Proposed Adjustment",
    value: "143(1)(a)",
    section: "143(1)(a)",
    description: "Discrepancy between reported income/deductions and AIS/26AS",
  },
  {
    label: "Section 139(9) - Defective Return",
    value: "139(9)",
    section: "139(9)",
    description: "Incomplete return, missing schedules, or audit discrepancies",
  },
  {
    label: "Section 142(1) - Inquiry / Production of Accounts",
    value: "142(1)",
    section: "142(1)",
    description: "Notice calling for specific documents or accounts before assessment",
  },
  {
    label: "Section 148 / 148A - Income Escaping Assessment",
    value: "148",
    section: "148",
    description: "Re-assessment notice for undisclosed or unassessed income",
  },
  {
    label: "Section 156 - Notice of Demand",
    value: "156",
    section: "156",
    description: "Demand notice for outstanding tax, interest, or penalty payable",
  },
  {
    label: "Section 245 - Refund Adjustment Intimation",
    value: "245",
    section: "245",
    description: "Intimation proposing to adjust pending refund against past demand",
  },
  {
    label: "Other Notice / Communication",
    value: "other",
    section: "Other",
    description: "Any other official notice or query from the Income Tax Department",
  },
];

export const INITIAL_TAX_NOTICE_DOCUMENTS: TaxNoticeSupportingDoc[] = [
  {
    id: "doc-notice",
    title: "Tax Notice",
    subtitle: "Complete notice received from the IT Department",
    isMandatory: true,
    status: "not_uploaded",
  },
  {
    id: "doc-prev-itr",
    title: "Previous ITR",
    subtitle: "Filed return form for the relevant or preceding year",
    isMandatory: true,
    status: "not_uploaded",
  },
  {
    id: "doc-itr-ack",
    title: "ITR Acknowledgement",
    subtitle: "ITR-V acknowledgement receipt of return",
    isMandatory: true,
    status: "not_uploaded",
  },
  {
    id: "doc-form-16",
    title: "Form 16 / 16A",
    subtitle: "TDS certificates issued by employer or deductors",
    isMandatory: true,
    status: "not_uploaded",
  },
  {
    id: "doc-ais",
    title: "AIS (Annual Information Statement)",
    subtitle: "Comprehensive statement from the Income Tax portal",
    isMandatory: true,
    status: "not_uploaded",
  },
  {
    id: "doc-tis",
    title: "TIS (Taxpayer Information Summary)",
    subtitle: "Summary statement of taxable financial transactions",
    isMandatory: false,
    status: "not_uploaded",
  },
  {
    id: "doc-bank",
    title: "Bank Statements",
    subtitle: "Full financial year statement of all bank accounts",
    isMandatory: true,
    status: "not_uploaded",
  },
  {
    id: "doc-income",
    title: "Supporting Income Documents",
    subtitle: "Interest certificates, dividend statements, capital gains sheets",
    isMandatory: false,
    status: "not_uploaded",
  },
  {
    id: "doc-expense",
    title: "Supporting Expense Documents",
    subtitle: "80C/80D proofs, medical bills, donation receipts (80G), home loan certs",
    isMandatory: false,
    status: "not_uploaded",
  },
  {
    id: "doc-prev-responses",
    title: "Previous Tax Responses",
    subtitle: "Any past submissions, letters, or rectifications filed earlier",
    isMandatory: false,
    status: "not_uploaded",
  },
  {
    id: "doc-other",
    title: "Other Notice-Specific Documents",
    subtitle: "Property registry deeds, gift deeds, agreements, or affidavits",
    isMandatory: false,
    status: "not_uploaded",
  },
];

// Alias for backward compatibility
export const MOCK_SUPPORTING_DOCS = INITIAL_TAX_NOTICE_DOCUMENTS;

export const MOCK_NOTICE_SUMMARY: TaxNoticeSummaryData = {
  noticeType: "Proposed Adjustment",
  section: "143(1)(a)",
  issuedDate: "18 Aug 2026",
  responseDueDate: "17 Sep 2026",
  daysLeft: 15,
  riskLevel: "Low",
  whatItMeans:
    "The department's records show ₹42,000 of interest income that does not appear on your return. They are proposing to add it to your taxable income and have given you an opportunity to respond.",
  actionRequired:
    "You need to confirm whether the income was already reported, agree with the adjustment, or provide an explanation with supporting documents.",
};

export const generateNoticeDraftResponse = (params: {
  name?: string;
  pan?: string;
  noticeNumber?: string;
  noticeDate?: string;
  assessmentYear?: string;
  section?: string;
}): string => {
  const assesseeName = params.name?.trim() || "Assessee";
  const panStr = params.pan?.trim() ? ` (PAN ${params.pan.trim()})` : "";
  const nNumber = params.noticeNumber?.trim() || "CPC/ITD/NOTICE";
  const nDate = params.noticeDate?.trim() || "the notice";
  const ay = params.assessmentYear?.trim() || "AY 2025–26";
  const sec = params.section?.trim() || "143(1)(a)";

  return `Respected Sir/Madam,

With reference to the notice under section ${sec} bearing reference number ${nNumber} dated ${nDate}, we respectfully submit this response on behalf of ${assesseeName}${panStr} for Assessment Year ${ay}.

The assessee has reviewed the particulars stated in the notice. The reconciliation of income and taxes paid has been verified with Form 26AS, AIS, and underlying financial statements. 

Supporting documents and explanations are attached herewith for your kind perusal. We request that the assessment/intimation be finalized taking these records into account.

Yours faithfully,
For Finsolz Finsolz
Tax Compliance Division`;
};

export const MOCK_DRAFT_RESPONSE_TEXT = generateNoticeDraftResponse({});

export const MOCK_TRACKING_STEPS: NoticeTrackingStep[] = [
  {
    id: "step-1",
    title: "Received",
    date: "Notice Uploaded",
    description: "Notice received and indexed in system",
    status: "completed",
  },
  {
    id: "step-2",
    title: "Under Review",
    date: "Active",
    description: "Tax Executive reviewing notice and supporting documents",
    status: "completed",
  },
  {
    id: "step-3",
    title: "Response Submitted",
    date: "Submitted",
    description: "Response submitted to Income Tax Department",
    status: "completed",
  },
  {
    id: "step-4",
    title: "Resolved",
    date: "Pending",
    description: "Awaiting IT Department acknowledgment and closure",
    status: "pending",
  },
];

export const MOCK_NOTICE_STATUS_DETAILS: NoticeStatusDetails = {
  noticeNumber: "",
  section: "143(1)(a)",
  submittedOn: "Today",
  acknowledgementNo: "",
  assignedTaxExecutive: "Tax Executive",
  currentStatus: "Response Submitted",
};
