import type { Application } from "@/types/domain";

export interface DataRow {
  label: string;
  value: string;
  icon: string;
}

export interface DataSection {
  id: string;
  title: string;
  subtitle?: string;
  rows: DataRow[];
}

const INTERNAL_KEYS = new Set([
  "isDraft",
  "savedStep",
  "stepIndex",
  "resumeRoute",
  "currentValues",
  "requestedValues",
  "document",
  "documents",
  "internalId",
  "transactionId",
  "paymentMethod",
  "submissionDate",
  "appliedDate",
  "applicationId",
]);

function formatLabel(key: string): string {
  const spaced = key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatCurrency(val: any): string {
  const num = Number(String(val).replace(/[^0-9.-]+/g, ""));
  if (isNaN(num)) return String(val);
  return `₹${num.toLocaleString("en-IN")}`;
}

export function resolveSubmittedDataRows(app: Application): DataRow[] {
  const rows: DataRow[] = [];
  const formData = (app.formData || {}) as Record<string, any>;
  const sid = (app.serviceId || "").toLowerCase();
  const cat = (app.category || "").toUpperCase();

  // 1. GST Registration / Amendment / Cancellation / Filing
  if (cat === "GST" || sid.includes("gst")) {
    if (formData.businessName || formData.legalName) {
      rows.push({
        label: "Business Name",
        value: formData.businessName || formData.legalName,
        icon: "business-outline",
      });
    }
    if (formData.gstin !== undefined) {
      rows.push({
        label: "GSTIN",
        value: formData.gstin && formData.gstin.trim() ? formData.gstin : "-",
        icon: "receipt-outline",
      });
    }
    if (formData.businessType || formData.constitution) {
      rows.push({
        label: "Constitution of Business",
        value: formData.businessType || formData.constitution,
        icon: "document-text-outline",
      });
    }
    if (formData.taxpayerScheme) {
      rows.push({
        label: "Taxpayer Scheme",
        value: formData.taxpayerScheme,
        icon: "shield-checkmark-outline",
      });
    }
    if (formData.filingType) {
      rows.push({
        label: "Return Form",
        value: formData.filingType,
        icon: "receipt-outline",
      });
    }
    if (formData.financialYear && formData.filingPeriod) {
      rows.push({
        label: "Filing Period",
        value: `${formData.filingPeriod} (${formData.financialYear})`,
        icon: "calendar-outline",
      });
    }
    if (formData.state) {
      rows.push({
        label: "State",
        value: formData.state,
        icon: "location-outline",
      });
    }
    if (formData.pincode || formData.pinCode) {
      rows.push({
        label: "PIN Code",
        value: formData.pincode || formData.pinCode,
        icon: "pin-outline",
      });
    }
    if (formData.turnover) {
      rows.push({
        label: "Gross Turnover",
        value: formatCurrency(formData.turnover),
        icon: "cash-outline",
      });
    }
    if (formData.eligibleItc) {
      rows.push({
        label: "Eligible ITC",
        value: formatCurrency(formData.eligibleItc),
        icon: "wallet-outline",
      });
    }
    if (formData.reason) {
      rows.push({
        label: "Reason for Cancellation",
        value: formData.reason,
        icon: "alert-circle-outline",
      });
    }
    if (formData.section) {
      rows.push({
        label: "Amended Section",
        value: formData.section,
        icon: "create-outline",
      });
    }
  }

  // 2. ITR & TDS
  else if (cat === "ITR" || sid.includes("itr") || sid.includes("tds") || sid.includes("notice")) {
    if (formData.name || formData.applicantName) {
      rows.push({
        label: "Taxpayer Name",
        value: formData.name || formData.applicantName,
        icon: "person-outline",
      });
    }
    if (formData.pan) {
      rows.push({
        label: "PAN",
        value: formData.pan,
        icon: "card-outline",
      });
    }
    if (formData.assessmentYear) {
      rows.push({
        label: "Assessment Year",
        value: formData.assessmentYear,
        icon: "calendar-outline",
      });
    }
    if (formData.formType || formData.formTitle) {
      rows.push({
        label: "Return Form",
        value: formData.formTitle || formData.formType,
        icon: "document-text-outline",
      });
    }
    if (formData.regime) {
      rows.push({
        label: "Tax Regime",
        value: formData.regime,
        icon: "options-outline",
      });
    }
    if (formData.grossTotalIncome) {
      rows.push({
        label: "Gross Total Income",
        value: formatCurrency(formData.grossTotalIncome),
        icon: "cash-outline",
      });
    }
    if (formData.taxableIncome) {
      rows.push({
        label: "Net Taxable Income",
        value: formatCurrency(formData.taxableIncome),
        icon: "calculator-outline",
      });
    }
    if (formData.refundAmount) {
      rows.push({
        label: "Estimated Refund",
        value: formatCurrency(formData.refundAmount),
        icon: "cash-outline",
      });
    }
    if (formData.bankName) {
      rows.push({
        label: "Refund Bank",
        value: formData.bankName,
        icon: "business-outline",
      });
    }
    if (formData.accountNumber) {
      rows.push({
        label: "Account Number",
        value: String(formData.accountNumber),
        icon: "card-outline",
      });
    }
    if (formData.ifscCode || formData.ifsc) {
      rows.push({
        label: "IFSC Code",
        value: formData.ifscCode || formData.ifsc,
        icon: "barcode-outline",
      });
    }
  }

  // 3. Loans
  else if (cat === "LOANS" || sid.startsWith("loan")) {
    const loanAmt = formData.requestedAmount || formData.loanAmount;
    if (loanAmt) {
      rows.push({
        label: "Requested Amount",
        value: formatCurrency(loanAmt),
        icon: "cash-outline",
      });
    }
    if (formData.purpose) {
      rows.push({
        label: "Loan Purpose",
        value: formData.purpose,
        icon: "help-circle-outline",
      });
    }
    if (formData.tenure || formData.repaymentPeriod) {
      rows.push({
        label: "Tenure / Repayment",
        value: formData.tenure || formData.repaymentPeriod,
        icon: "time-outline",
      });
    }
    if (formData.annualIncome || formData.monthlyIncome) {
      rows.push({
        label: "Declared Income",
        value: formatCurrency(formData.annualIncome || formData.monthlyIncome),
        icon: "wallet-outline",
      });
    }
    if (formData.turnover) {
      rows.push({
        label: "Annual Turnover",
        value: formatCurrency(formData.turnover),
        icon: "trending-up-outline",
      });
    }
    if (formData.propertyType) {
      rows.push({
        label: "Property Type",
        value: formData.propertyType,
        icon: "home-outline",
      });
    }
    if (formData.city) {
      rows.push({
        label: "City",
        value: formData.city,
        icon: "location-outline",
      });
    }
    if (formData.applicantName || formData.fullName) {
      rows.push({
        label: "Applicant Name",
        value: formData.applicantName || formData.fullName,
        icon: "person-outline",
      });
    }
  }

  // 4. Company Incorporation / Business
  else if (cat === "BUSINESS" || sid.includes("company") || sid.includes("incorporation")) {
    if (formData.companyType || formData.entityType) {
      rows.push({
        label: "Entity Type",
        value: formData.companyType || formData.entityType,
        icon: "business-outline",
      });
    }
    const compName = formData.proposedName || formData.proposedName1 || formData.proposedName2;
    if (compName) {
      rows.push({
        label: "Proposed Name",
        value: compName,
        icon: "document-text-outline",
      });
    }
    if (formData.state) {
      rows.push({
        label: "Registered State",
        value: formData.state,
        icon: "location-outline",
      });
    }
    if (formData.authorizedCapital) {
      rows.push({
        label: "Authorized Capital",
        value: formatCurrency(formData.authorizedCapital),
        icon: "cash-outline",
      });
    }
    const dirCount = formData.promotersCount || formData.directorCount;
    if (dirCount) {
      rows.push({
        label: "Number of Directors",
        value: String(dirCount),
        icon: "people-outline",
      });
    }
  }

  // 5. Catch-all fallback for other submitted values
  const capturedLabels = new Set(rows.map((r) => r.label.toLowerCase()));
  Object.entries(formData).forEach(([key, value]) => {
    if (INTERNAL_KEYS.has(key)) return;
    if (value === null || value === undefined || value === "") return;
    if (typeof value === "object") return;

    const label = formatLabel(key);
    if (!capturedLabels.has(label.toLowerCase())) {
      rows.push({
        label,
        value: String(value),
        icon: "document-outline",
      });
    }
  });

  return rows;
}
