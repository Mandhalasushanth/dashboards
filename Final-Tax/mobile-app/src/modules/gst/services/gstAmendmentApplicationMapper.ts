import type { Application, ApplicationDocument, TimelineStep } from "@/types/domain";

export interface GstAmendmentBackendDto {
  amendmentId: string;
  gstNumber: string;
  section: string;
  applicationType?: string;
  status: string;
  assignedAgentId?: number | null;
  createdAt: string;
  updatedAt?: string;
  submittedAt?: string;
  description?: string;
  amendedValue?: string;
  proofDocumentUploaded?: boolean;
}

const SECTION_DISPLAY_MAP: Record<string, string> = {
  SIGNATORY: "Authorised Signatories",
  CONTACT: "Contact Details",
  BANK_ACCOUNT: "Bank Accounts",
  LEGAL_NAME: "Legal Business Name",
  PRINCIPAL_PLACE: "Principal Place of Business",
  ADDITIONAL_PLACE: "Additional Place of Business",
};

export function mapGstAmendmentBackendToApplication(dto: GstAmendmentBackendDto): Application {
  const rawKey = (dto.section || "").trim().toUpperCase();
  const sectionLabel = SECTION_DISPLAY_MAP[rawKey] || (dto.section || "General").replace(/_/g, " ");

  const documents: ApplicationDocument[] = [
    { name: `${sectionLabel} Proof Document`, status: dto.proofDocumentUploaded ? "Uploaded" : "Pending" },
  ];

  const timeline: TimelineStep[] = [
    {
      title: "Amendment Submitted",
      description: `Your ${sectionLabel} amendment request has been submitted.`,
      status: "completed",
      date: dto.submittedAt || dto.createdAt,
    },
    {
      title: "Verification & Portal Update",
      description: "Amended details are being verified and filed with the GST portal.",
      status: dto.status === "SUBMITTED" ? "current" : "pending",
    },
    {
      title: "Amendment Approval",
      description: "Updated GST profile confirmation and amended certificate.",
      status: "pending",
    },
  ];

  return {
    id: dto.amendmentId,
    serviceId: "gst-amendment",
    serviceName: `GST Amendment - ${sectionLabel}`,
    category: "GST",
    status: dto.status || "SUBMITTED",
    progress: dto.status === "SUBMITTED" ? 25 : 10,
    assignedExecutive: dto.assignedAgentId ? `Agent #${dto.assignedAgentId}` : "Under Assignment",
    paymentAmount: 0,
    paymentStatus: "Paid",
    createdAt: dto.createdAt || new Date().toISOString(),
    formData: {
      ...dto,
      applicantName: dto.gstNumber,
      gstin: dto.gstNumber,
      submissionDate: dto.submittedAt || dto.createdAt,
      appliedDate: dto.submittedAt || dto.createdAt,
      arn: dto.amendmentId,
    },
    documents,
    timeline,
    chatHistory: [],
  };
}
