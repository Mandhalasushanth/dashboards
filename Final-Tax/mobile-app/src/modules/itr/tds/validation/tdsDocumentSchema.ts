import { TdsChecklistItem } from "../types/checklist.types";
import { TdsCustomerIncomeFormData } from "../types/customerIncome.types";
import {
  isFileTypeAllowed,
  parsePositiveNumber,
  ALLOWED_EXTENSIONS,
} from "../utils/tdsValidation";

/**
 * Computes which documents are applicable and mandatory based on Customer & Income details.
 */
export function getApplicableDocuments(
  formData?: TdsCustomerIncomeFormData | null,
  currentDocs?: TdsChecklistItem[]
): TdsChecklistItem[] {
  const salary = parsePositiveNumber(formData?.income?.salaryIncome);
  const otherTds = parsePositiveNumber(formData?.income?.totalTdsDeducted);
  const hasRental = Boolean(formData?.income?.hasRentalIncome);
  const hasCapitalGains = Boolean(formData?.income?.hasCapitalGains);
  const hasHomeLoan = Boolean(formData?.income?.hasHomeLoan);
  const hasDeductions = Boolean(formData?.income?.hasDeductions);
  const hasPreviousLoss = Boolean(formData?.income?.hasPreviousLoss);

  // 23 CA-Ready Document definitions
  const docDefinitions: Omit<TdsChecklistItem, "status" | "fileUri" | "fileName" | "fileSize" | "mimeType">[] = [
    // 1. Base Documents
    {
      id: "pan",
      title: "PAN Card",
      subtitle: "Mandatory for tax identity & TDS verification",
      category: "base",
      isMandatory: true,
      isVisible: true,
      isHighlighted: true,
    },
    {
      id: "aadhaar",
      title: "Aadhaar Card",
      subtitle: "Required for Aadhaar-PAN linking & e-verification",
      category: "base",
      isMandatory: true,
      isVisible: true,
    },
    {
      id: "form26as",
      title: "Form 26AS (Tax Credit Statement)",
      subtitle: "Essential for complete TDS & tax payment reconciliation",
      category: "base",
      isMandatory: true,
      isVisible: true,
      isHighlighted: true,
    },
    {
      id: "ais",
      title: "Annual Information Statement (AIS)",
      subtitle: "Comprehensive financial transactions reported to IT Dept",
      category: "base",
      isMandatory: true,
      isVisible: true,
    },
    {
      id: "tis",
      title: "Taxpayer Information Summary (TIS)",
      subtitle: "Aggregated tax information statement summary",
      category: "base",
      isMandatory: false,
      isVisible: true,
    },

    // 2. Salary / Employment
    {
      id: "form16",
      title: "Form 16 (Part A & B)",
      subtitle: "Employer TDS certificate & salary breakdown",
      category: "salary",
      isMandatory: salary > 0,
      isVisible: salary > 0,
      isHighlighted: salary > 0,
    },
    {
      id: "salary_slips",
      title: "Salary Slips (Recent 3 months)",
      subtitle: "Supporting proof for allowances & reimbursements",
      category: "salary",
      isMandatory: false,
      isVisible: salary > 0,
    },

    // 3. Non-Salary TDS
    {
      id: "form16a",
      title: "Form 16A (Non-Salary TDS)",
      subtitle: "TDS on interest, contract, rent or professional fees",
      category: "non_salary",
      isMandatory: otherTds > 0,
      isVisible: otherTds > 0,
    },

    // 4. Bank / Interest
    {
      id: "bank_statement",
      title: "Bank Account Statement / Cancelled Cheque",
      subtitle: "For bank verification & direct refund credit",
      category: "bank",
      isMandatory: true,
      isVisible: true,
    },
    {
      id: "interest_cert",
      title: "Interest / Fixed Deposit Certificate",
      subtitle: "Bank interest certificate for Sec 80TTA/80TTB verification",
      category: "bank",
      isMandatory: false,
      isVisible: true,
    },

    // 5. Previous Return
    {
      id: "prev_itr",
      title: "Previous Year's ITR-V / Acknowledgement",
      subtitle: "Required for loss carry-forward & prior return verification",
      category: "previous_return",
      isMandatory: hasPreviousLoss,
      isVisible: hasPreviousLoss || true,
    },

    // 6. Capital Gains
    {
      id: "capital_gains_stmt",
      title: "Capital Gains Statement",
      subtitle: "Equity, mutual funds or property transaction summary",
      category: "capital_gains",
      isMandatory: hasCapitalGains,
      isVisible: hasCapitalGains,
    },
    {
      id: "broker_stmt",
      title: "Broker Contract Notes / P&L Report",
      subtitle: "Zerodha, Groww, Upstox or other broker report",
      category: "capital_gains",
      isMandatory: false,
      isVisible: hasCapitalGains,
    },
    {
      id: "mf_stmt",
      title: "Mutual Fund Capital Gains Report",
      subtitle: "CAMS or KFintech mutual fund statement",
      category: "capital_gains",
      isMandatory: false,
      isVisible: hasCapitalGains,
    },

    // 7. Property / Rental
    {
      id: "rent_receipts",
      title: "Rent Receipts / Tenancy Proof",
      subtitle: "Proof of rental income received or HRA claimed",
      category: "property",
      isMandatory: hasRental,
      isVisible: hasRental,
    },
    {
      id: "rental_agreement",
      title: "Rental Agreement",
      subtitle: "Executed rental agreement copy",
      category: "property",
      isMandatory: false,
      isVisible: hasRental,
    },
    {
      id: "home_loan_cert",
      title: "Home Loan Interest Certificate",
      subtitle: "Bank certificate showing principal & Sec 24(b) interest",
      category: "property",
      isMandatory: hasHomeLoan,
      isVisible: hasHomeLoan,
    },

    // 8. Deductions / Tax Savings
    {
      id: "lic_proof",
      title: "LIC / Life Insurance Premium Proof",
      subtitle: "Premium payment receipts for Section 80C deduction",
      category: "deductions",
      isMandatory: false,
      isVisible: hasDeductions,
    },
    {
      id: "health_ins_proof",
      title: "Health Insurance Premium Receipt (Sec 80D)",
      subtitle: "Mediclaim policy receipt for self, spouse or parents",
      category: "deductions",
      isMandatory: false,
      isVisible: hasDeductions,
    },
    {
      id: "donation_receipts",
      title: "Donation Receipts (Sec 80G)",
      subtitle: "Eligible charitable donations with Form 10BE / 80G receipt",
      category: "deductions",
      isMandatory: false,
      isVisible: hasDeductions,
    },
    {
      id: "tuition_fee_proof",
      title: "Tuition Fee / PPF / ELSS Investment Receipts",
      subtitle: "Supporting receipts for eligible Section 80C deductions",
      category: "deductions",
      isMandatory: false,
      isVisible: hasDeductions,
    },

    // 9. Other TDS & Supporting
    {
      id: "other_tds_certs",
      title: "Other TDS Certificates (16B, 16C, 27D TCS)",
      subtitle: "Property sale, rent TDS or TCS certificates",
      category: "other",
      isMandatory: false,
      isVisible: true,
    },
    {
      id: "additional_docs",
      title: "Additional Supporting Documents",
      subtitle: "Any other relevant document or statement for the CA",
      category: "other",
      isMandatory: false,
      isVisible: true,
    },
  ];

  const existingMap = new Map<string, TdsChecklistItem>();
  if (currentDocs) {
    currentDocs.forEach((d) => existingMap.set(d.id, d));
  }

  return docDefinitions
    .filter((d) => d.isVisible)
    .map((def) => {
      const existing = existingMap.get(def.id);
      return {
        ...def,
        status: existing?.status || "not_uploaded",
        fileUri: existing?.fileUri,
        fileName: existing?.fileName,
        fileSize: existing?.fileSize,
        mimeType: existing?.mimeType,
        uploadedAt: existing?.uploadedAt,
      };
    });
}

export function validateDocumentUploads(documents: TdsChecklistItem[]): {
  isValid: boolean;
  missingMandatory: string[];
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const missingMandatory: string[] = [];

  documents.forEach((doc) => {
    if (doc.isMandatory) {
      if (!doc.fileUri || doc.status === "not_uploaded") {
        missingMandatory.push(doc.title);
        errors[doc.id] = `${doc.title} is required`;
      }
    }

    if (doc.fileUri && doc.fileName) {
      if (!isFileTypeAllowed(doc.fileName, ALLOWED_EXTENSIONS)) {
        errors[doc.id] = "Unsupported file format. Upload PDF, JPG or PNG.";
      }
    }
  });

  return {
    isValid: missingMandatory.length === 0 && Object.keys(errors).length === 0,
    missingMandatory,
    errors,
  };
}
