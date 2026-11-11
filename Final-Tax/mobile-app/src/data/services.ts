import type { Service, ServiceCategory, ServiceCategoryId } from "@/types/domain";

export const CATEGORIES: ServiceCategory[] = [
  {
    id: "GST",
    name: "GST Services",
    icon: "receipt-outline",
    count: 6,
    color: "#0B5ED7",
  },
  {
    id: "ITR",
    name: "ITR Services",
    icon: "cash-outline",
    count: 5,
    color: "#083B75",
  },
  {
    id: "LOANS",
    name: "Loans & Capital",
    icon: "business-outline",
    count: 9,
    color: "#F97316",
  },
  {
    id: "INSURANCE",
    name: "Insurance Solutions",
    icon: "shield-checkmark-outline",
    count: 9,
    color: "#10B981",
  },
  {
    id: "BUSINESS",
    name: "Business / Commercial",
    icon: "briefcase-outline",
    count: 13,
    color: "#8B5CF6",
  },
];

export const SERVICES: Service[] = [
  // GST Services
  {
    id: "gst-registration",
    name: "GST Registration",
    category: "GST",
    description:
      "Get your Goods and Services Tax registration completed quickly and securely.",
    icon: "document-text-outline",
    requiredDocs: [
      "PAN Card",
      "Aadhaar Card",
      "Business Address Proof",
      "Bank Statement",
      "Passport Photo",
    ],
    formFields: [
      {
        name: "businessName",
        label: "Business Legal Name",
        type: "text",
        placeholder: "As in PAN",
        required: true,
      },
      {
        name: "pan",
        label: "PAN of Business / Proprietor",
        type: "text",
        placeholder: "ABCDE1234F",
        required: true,
      },
      {
        name: "constitution",
        label: "Constitution of Business",
        type: "dropdown",
        options: ["Proprietorship", "Partnership", "LLP", "Pvt Ltd"],
        required: true,
      },
      {
        name: "commencementDate",
        label: "Date of Commencement",
        type: "date",
        required: true,
      },
    ],
  },
  {
    id: "gst-filing",
    name: "GST Filing",
    category: "GST",
    description: "Assistance with filing GSTR-1, GSTR-3B, and annual returns.",
    icon: "checkmark-circle-outline",
    requiredDocs: [
      "Sales Register",
      "Purchase Register",
      "Previous GSTR Filing copy",
    ],
    formFields: [
      {
        name: "gstin",
        label: "GSTIN",
        type: "text",
        placeholder: "22AAAAA1111A1Z1",
        required: true,
      },
      {
        name: "filingPeriod",
        label: "Filing Period",
        type: "dropdown",
        options: ["July 2026", "August 2026", "Q2 2026"],
        required: true,
      },
    ],
  },
  {
    id: "gst-compliance",
    name: "GST Compliance",
    category: "GST",
    description:
      "Complete GST compliance audit, e-way bills setup, and support.",
    icon: "shield-outline",
    requiredDocs: ["PAN Card", "GST Registration Certificate"],
    formFields: [
      {
        name: "gstin",
        label: "GSTIN",
        type: "text",
        placeholder: "22AAAAA1111A1Z1",
        required: true,
      },
      {
        name: "contactPerson",
        label: "Contact Person Name",
        type: "text",
        required: true,
      },
    ],
  },

  // ITR Services
  {
    id: "itr-filing",
    name: "ITR Filing",
    category: "ITR",
    description:
      "File your Income Tax Return. Safe, accurate, and optimized for maximum refunds.",
    icon: "calculator-outline",
    requiredDocs: [
      "PAN Card",
      "Aadhaar Card",
      "Form 16",
      "Bank Statement (Yearly)",
      "Investment Proofs",
    ],
    formFields: [
      {
        name: "fullName",
        label: "Full Name",
        type: "text",
        placeholder: "As in Aadhaar",
        required: true,
      },
      { name: "dob", label: "Date of Birth", type: "date", required: true },
      {
        name: "incomeType",
        label: "Primary Income Type",
        type: "dropdown",
        options: [
          "Salaried",
          "Business/Professional",
          "Capital Gains",
          "House Property",
        ],
        required: true,
      },
      {
        name: "estimatedIncome",
        label: "Estimated Annual Income (₹)",
        type: "number",
        placeholder: "e.g. 800000",
        required: true,
      },
    ],
  },
  {
    id: "tds-refund",
    name: "TDS Refund Claim",
    category: "ITR",
    description: "Claim your TDS refunds and resolve mismatch notices.",
    icon: "arrow-down-circle-outline",
    requiredDocs: ["Form 26AS", "Form 16 / 16A", "PAN Card"],
    formFields: [
      { name: "pan", label: "PAN Card Number", type: "text", required: true },
      {
        name: "financialYear",
        label: "Financial Year",
        type: "dropdown",
        options: ["FY 2025-26", "FY 2024-25"],
        required: true,
      },
    ],
  },

  // Loans
  {
    id: "business-loan",
    name: "Business Loan",
    category: "LOANS",
    description:
      "Secure funding to scale your business operations, buy equipment, or expand.",
    icon: "trending-up-outline",
    requiredDocs: [
      "PAN Card",
      "Aadhaar Card",
      "GST Registration",
      "2 Years ITR",
      "12 Months Bank Statement",
    ],
    formFields: [
      {
        name: "businessName",
        label: "Business Name",
        type: "text",
        required: true,
      },
      {
        name: "loanAmount",
        label: "Requested Loan Amount (₹)",
        type: "number",
        placeholder: "e.g. 1500000",
        required: true,
      },
      {
        name: "turnover",
        label: "Annual Turnover (₹)",
        type: "number",
        placeholder: "e.g. 5000000",
        required: true,
      },
      {
        name: "vintage",
        label: "Years in Business",
        type: "number",
        placeholder: "e.g. 3",
        required: true,
      },
    ],
  },
  {
    id: "personal-loan",
    name: "Personal Loan",
    category: "LOANS",
    description:
      "Quick personal loans with minimal documentation and attractive rates.",
    icon: "people-outline",
    requiredDocs: [
      "PAN Card",
      "Aadhaar Card",
      "3 Months Payslips",
      "6 Months Bank Statement",
    ],
    formFields: [
      {
        name: "monthlySalary",
        label: "Net Monthly Salary (₹)",
        type: "number",
        required: true,
      },
      {
        name: "loanAmount",
        label: "Loan Amount (₹)",
        type: "number",
        required: true,
      },
      {
        name: "employer",
        label: "Employer Name",
        type: "text",
        required: true,
      },
    ],
  },
  {
    id: "working-capital",
    name: "Working Capital",
    category: "LOANS",
    description:
      "Funding to cover your day-to-day operational business expenses.",
    icon: "cash-outline",
    requiredDocs: [
      "PAN",
      "GST Certificate",
      "Audited Financials",
      "6 Months Bank Statements",
    ],
    formFields: [
      {
        name: "businessName",
        label: "Company Name",
        type: "text",
        required: true,
      },
      {
        name: "requiredLimit",
        label: "Required Limit (₹)",
        type: "number",
        required: true,
      },
    ],
  },
  {
    id: "home-loan",
    name: "Home Loan",
    category: "LOANS",
    description:
      "Competitive home loans for purchase, construction, or renovation.",
    icon: "home-outline",
    requiredDocs: [
      "PAN Card",
      "Aadhaar Card",
      "Property Documents",
      "Income Proof",
      "6 Months Bank Statement",
    ],
    formFields: [
      {
        name: "propertyValue",
        label: "Estimated Property Value (₹)",
        type: "number",
        required: true,
      },
      {
        name: "loanAmount",
        label: "Required Loan Amount (₹)",
        type: "number",
        required: true,
      },
    ],
  },
  {
    id: "property-loan",
    name: "Property Loan",
    category: "LOANS",
    description:
      "Mortgage and loan against property with attractive interest rates.",
    icon: "business-outline",
    requiredDocs: [
      "PAN Card",
      "Aadhaar Card",
      "Title Deed",
      "Tax Receipts",
      "Income Proof",
    ],
    formFields: [
      {
        name: "propertyType",
        label: "Property Type",
        type: "text",
        required: true,
      },
      {
        name: "loanAmount",
        label: "Required Loan Amount (₹)",
        type: "number",
        required: true,
      },
    ],
  },
  {
    id: "vehicle-loan",
    name: "Vehicle Loan",
    category: "LOANS",
    description:
      "Finance your new or pre-owned vehicle with fast approvals.",
    icon: "car-outline",
    requiredDocs: [
      "PAN Card",
      "Aadhaar Card",
      "Proforma Invoice / Quotation",
      "3 Months Payslips",
      "6 Months Bank Statement",
    ],
    formFields: [
      {
        name: "vehicleType",
        label: "Vehicle Type",
        type: "text",
        required: true,
      },
      {
        name: "loanAmount",
        label: "Loan Amount (₹)",
        type: "number",
        required: true,
      },
    ],
  },
  {
    id: "machinery-loan",
    name: "Machinery Loan",
    category: "LOANS",
    description:
      "Acquire equipment and industrial machinery with flexible repayment.",
    icon: "construct-outline",
    requiredDocs: [
      "PAN Card",
      "Aadhaar Card",
      "Machinery Quotation / Invoice",
      "Business ITR (2 Years)",
      "6 Months Bank Statement",
    ],
    formFields: [
      {
        name: "machineryName",
        label: "Machinery / Equipment Name",
        type: "text",
        required: true,
      },
      {
        name: "loanAmount",
        label: "Loan Amount (₹)",
        type: "number",
        required: true,
      },
    ],
  },

  // Insurance
  {
    id: "health-insurance",
    name: "Health Insurance",
    category: "INSURANCE",
    description: "Get comprehensive medical cover for you and your family.",
    icon: "heart-outline",
    requiredDocs: [
      "Aadhaar Card",
      "PAN Card",
      "Previous Insurance Policy (if any)",
    ],
    formFields: [
      {
        name: "insuredCount",
        label: "Number of members to insure",
        type: "number",
        required: true,
      },
      {
        name: "eldestAge",
        label: "Age of eldest member",
        type: "number",
        required: true,
      },
      {
        name: "preExisting",
        label: "Any pre-existing illness?",
        type: "dropdown",
        options: ["No", "Yes"],
        required: true,
      },
    ],
  },
  {
    id: "life-insurance",
    name: "Life Insurance",
    category: "INSURANCE",
    description:
      "Protect your family's financial future with term or endowment life policies.",
    icon: "rose-outline",
    requiredDocs: ["Aadhaar Card", "PAN Card", "Income Proof (Payslips/ITR)"],
    formFields: [
      {
        name: "sumAssured",
        label: "Desired Sum Assured (₹)",
        type: "number",
        placeholder: "e.g. 10000000",
        required: true,
      },
      {
        name: "tobacco",
        label: "Do you consume tobacco?",
        type: "dropdown",
        options: ["No", "Yes"],
        required: true,
      },
      {
        name: "occupation",
        label: "Occupation Type",
        type: "dropdown",
        options: ["Salaried", "Self-Employed", "Business Owner"],
        required: true,
      },
    ],
  },

  // Business
  {
    id: "company-registration",
    name: "Company Registration",
    category: "BUSINESS",
    description:
      "Incorporate your Private Limited or One Person Company (OPC) end-to-end.",
    icon: "business-outline",
    requiredDocs: [
      "PAN of all directors",
      "Aadhaar of all directors",
      "Proof of Registered Office",
      "NOC from Owner",
    ],
    formFields: [
      {
        name: "proposedName1",
        label: "Proposed Name Option 1",
        type: "text",
        required: true,
      },
      {
        name: "proposedName2",
        label: "Proposed Name Option 2",
        type: "text",
        required: false,
      },
      {
        name: "directorsCount",
        label: "Number of Directors",
        type: "number",
        placeholder: "Minimum 2",
        required: true,
      },
      {
        name: "businessActivity",
        label: "Brief Business Activity Description",
        type: "text",
        required: true,
      },
    ],
  },
  {
    id: "accounting-bookkeeping",
    name: "Accounting & Bookkeeping",
    category: "BUSINESS",
    description:
      "Professional accounting services, ledger maintenance, and financial reporting.",
    icon: "server-outline",
    requiredDocs: ["Bank Statements", "Sales Invoices", "Purchase Bills"],
    formFields: [
      {
        name: "businessName",
        label: "Business Name",
        type: "text",
        required: true,
      },
      {
        name: "monthlyTransactions",
        label: "Approx. Monthly Transactions",
        type: "number",
        required: true,
      },
    ],
  },
];

export const getServiceById = (id: string): Service | undefined => {
  return SERVICES.find((service) => service.id === id);
};

export const getServicesByCategory = (
  category: ServiceCategoryId,
): Service[] => {
  return SERVICES.filter((service) => service.category === category);
};
