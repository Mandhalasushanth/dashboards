import type { Application, ApplicationDocument, TimelineStep } from "@/types/domain";

export interface GstFilingBackendDto {
  gstfilingId: string;
  gstin: string;
  applicationType?: string;
  status: string;
  assignedAgentId?: number | null;
  createdAt: string;
  updatedAt?: string;
  submittedAt?: string;

  // Step 1: Return Details
  financialYear?: string;
  filingPeriod?: string;
  filingFrequency?: string;
  returnType?: string;
  filingType?: string;
  taxCalculationMethod?: string;
  estimatedTaxableSales?: number;
  estimatedTaxablePurchases?: number;
  estimatedEligibleItc?: number;

  // Step 2: Documents Flags
  documentId?: string;
  salesInvoiceUploaded?: boolean;
  purchaseInvoicesUploaded?: boolean;
  gstr2bItcStatementUploaded?: boolean;
  creditNotesUploaded?: boolean;
  debitNotesUploaded?: boolean;
  eInvoiceDataUploaded?: boolean;
  eWayBillDataUploaded?: boolean;
  expenseInvoicesAndVouchersUploaded?: boolean;
  bankStatementUploaded?: boolean;
  previousGstReturnsUploaded?: boolean;
  previousFilingAcknowledgementUploaded?: boolean;
  otherSupportingDocumentsUploaded?: boolean;
}

export function mapGstFilingBackendToApplication(dto: GstFilingBackendDto): Application {
  const title = `GST Filing (${dto.returnType || "GSTR"} - ${dto.filingPeriod || ""})`;

  const documents: ApplicationDocument[] = [
    { name: "Sales Invoice", status: dto.salesInvoiceUploaded ? "Uploaded" : "Pending" },
    { name: "Purchase Invoices", status: dto.purchaseInvoicesUploaded ? "Uploaded" : "Pending" },
    { name: "GSTR-2B Statement", status: dto.gstr2bItcStatementUploaded ? "Uploaded" : "Pending" },
    { name: "Bank Statement", status: dto.bankStatementUploaded ? "Uploaded" : "Pending" },
  ];

  const timeline: TimelineStep[] = [
    {
      title: "Filing Submitted",
      description: "Your GST return filing has been submitted for review.",
      status: "completed",
      date: dto.submittedAt || dto.createdAt,
    },
    {
      title: "Verification & Tax Computation",
      description: "Sales, purchases, and ITC are being verified.",
      status: dto.status === "SUBMITTED" ? "current" : "pending",
    },
    {
      title: "ARN & Government Acknowledgement",
      description: "Official GST return filing acknowledgement will be generated.",
      status: "pending",
    },
  ];

  return {
    id: dto.gstfilingId,
    serviceId: "gst-filing",
    serviceName: "GST Filing",
    category: "GST",
    status: dto.status || "SUBMITTED",
    progress: dto.status === "SUBMITTED" ? 25 : 10,
    assignedExecutive: dto.assignedAgentId ? `Agent #${dto.assignedAgentId}` : "Under Assignment",
    paymentAmount: 0,
    paymentStatus: "Paid",
    createdAt: dto.createdAt || new Date().toISOString(),
    formData: {
      ...dto,
      applicantName: dto.gstin,
      gstin: dto.gstin,
      submissionDate: dto.submittedAt || dto.createdAt,
      appliedDate: dto.submittedAt || dto.createdAt,
      arn: dto.gstfilingId,
    },
    documents,
    timeline,
    chatHistory: [],
  };
}
