import type { Application, ApplicationDocument, TimelineStep } from "@/types/domain";

export interface GstComplianceBackendDto {
  complianceId: string;
  gstin: string;
  applicationType?: string;
  status: string;
  assignedAgentId?: number | null;
  createdAt: string;
  updatedAt?: string;
  submittedAt?: string;
  financialYear?: string;
  requestType?: string;
  gstr2bNumber?: string;
  noticeNumber?: string;
  noticeIssueDate?: string;
  replyDueDate?: string;
  message?: string;
  reconciliationFile1Uploaded?: boolean;
  reconciliationFile2Uploaded?: boolean;
  noticeFileUploaded?: boolean;
}

const COMPLIANCE_DISPLAY_MAP: Record<string, string> = {
  RECONCILIATION_SUPPORT: "Reconciliation Support",
  NOTICE_REPLY: "Notice Reply",
  ANNUAL_RETURN: "Annual Return",
};

export function mapGstComplianceBackendToApplication(dto: GstComplianceBackendDto): Application {
  const rawKey = (dto.requestType || "").trim().toUpperCase();
  const requestLabel = COMPLIANCE_DISPLAY_MAP[rawKey] || (dto.requestType || "Notice / Annual").replace(/_/g, " ");
  const title = `GST Compliance (${requestLabel})`;

  const documents: ApplicationDocument[] = [
    { name: "Reconciliation Sheet 1", status: dto.reconciliationFile1Uploaded ? "Uploaded" : "Pending" },
    { name: "Reconciliation Sheet 2", status: dto.reconciliationFile2Uploaded ? "Uploaded" : "Pending" },
    { name: "Notice / Supporting File", status: dto.noticeFileUploaded ? "Uploaded" : "Pending" },
  ];

  const timeline: TimelineStep[] = [
    {
      title: "Compliance Submitted",
      description: "Your compliance response has been submitted for legal review.",
      status: "completed",
      date: dto.submittedAt || dto.createdAt,
    },
    {
      title: "Under Legal & CA Review",
      description: "Our Chartered Accountants are verifying notice and documentation.",
      status: dto.status === "SUBMITTED" ? "current" : "pending",
    },
    {
      title: "Resolution & Filing",
      description: "Official reply and compliance closure certificate.",
      status: "pending",
    },
  ];

  return {
    id: dto.complianceId,
    serviceId: "gst-compliance",
    serviceName: "GST Compliance",
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
      arn: dto.complianceId,
    },
    documents,
    timeline,
    chatHistory: [],
  };
}
