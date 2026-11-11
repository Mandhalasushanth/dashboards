import type { Application, ApplicationDocument, TimelineStep } from "@/types/domain";

export interface TdsRefundBackendDto {
  tdsRefundId: string;
  applicationType?: string;
  status: string;
  assignedAgentId?: number | null;
  createdAt: string;
  updatedAt?: string;
  submittedAt?: string;

  // Display identifier
  businessPan?: string;

  // Documents flags
  businessPanDocumentUploaded?: boolean;
  aadhaarDocumentUploaded?: boolean;
}

export function mapTdsRefundBackendToApplication(dto: TdsRefundBackendDto): Application {
  const applicantName = dto.businessPan ? `PAN: ${dto.businessPan}` : "TDS Refund Claim";
  const serviceName = "TDS Refund Claim";

  const documents: ApplicationDocument[] = [
    { name: "Business PAN Document", status: dto.businessPanDocumentUploaded ? "Uploaded" : "Pending" },
    { name: "Aadhaar Document", status: dto.aadhaarDocumentUploaded ? "Uploaded" : "Pending" },
  ];

  const timeline: TimelineStep[] = [
    {
      title: "TDS Refund Claim Submitted",
      description: "Your TDS refund application has been submitted for scrutiny.",
      status: "completed",
      date: dto.submittedAt || dto.createdAt,
    },
    {
      title: "TDS 26AS Reconciliation",
      description: "TDS deductions are being verified against TRACES & IT portal records.",
      status: dto.status === "SUBMITTED" ? "current" : "pending",
    },
    {
      title: "Refund Processed by ITD",
      description: "Refund amount will be directly credited to verified bank account.",
      status: "pending",
    },
  ];

  return {
    id: dto.tdsRefundId,
    serviceId: "tds-refund",
    serviceName,
    category: "ITR",
    status: dto.status || "SUBMITTED",
    progress: dto.status === "SUBMITTED" ? 25 : 10,
    assignedExecutive: dto.assignedAgentId ? `Agent #${dto.assignedAgentId}` : "Under Assignment",
    paymentAmount: 0,
    paymentStatus: "Paid",
    createdAt: dto.createdAt || new Date().toISOString(),
    formData: {
      ...dto,
      applicantName,
      businessName: applicantName,
      pan: dto.businessPan,
      submissionDate: dto.submittedAt || dto.createdAt,
      appliedDate: dto.submittedAt || dto.createdAt,
      arn: dto.tdsRefundId,
    },
    documents,
    timeline,
    chatHistory: [],
  };
}
