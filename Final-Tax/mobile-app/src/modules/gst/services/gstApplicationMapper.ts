import type { Application, ApplicationDocument, TimelineStep } from "@/types/domain";

export interface GstBackendApplicationDto {
  gstId: string;
  applicationType?: string;
  status: string;
  assignedAgentId?: number | null;
  createdAt: string;
  updatedAt?: string;
  submittedAt?: string;

  // Documents Details
  documentId?: string;
  principalPlaceAddressType?: string;
  panCardUploaded?: boolean;
  aadhaarCardUploaded?: boolean;
  businessRegistrationProofUploaded?: boolean;
  principalPlaceAddressProofUploaded?: boolean;
  bankPassbookOrCancelledChequeUploaded?: boolean;
  passportSizePhotographUploaded?: boolean;
}

export function mapGstBackendToApplication(dto: GstBackendApplicationDto): Application {
  const documents: ApplicationDocument[] = [
    { name: "PAN Card", status: dto.panCardUploaded ? "Uploaded" : "Pending" },
    { name: "Aadhaar Card", status: dto.aadhaarCardUploaded ? "Uploaded" : "Pending" },
    { name: "Business Registration Proof", status: dto.businessRegistrationProofUploaded ? "Uploaded" : "Pending" },
    { name: "Principal Place Address Proof", status: dto.principalPlaceAddressProofUploaded ? "Uploaded" : "Pending" },
    { name: "Bank Passbook / Cancelled Cheque", status: dto.bankPassbookOrCancelledChequeUploaded ? "Uploaded" : "Pending" },
    { name: "Passport Size Photograph", status: dto.passportSizePhotographUploaded ? "Uploaded" : "Pending" },
  ];

  const timeline: TimelineStep[] = [
    {
      title: "Application Submitted",
      description: "Your GST registration application has been submitted successfully.",
      status: "completed",
      date: dto.submittedAt || dto.createdAt,
    },
    {
      title: "Under Verification",
      description: "Your documents are being verified.",
      status: dto.status === "SUBMITTED" ? "current" : "pending",
    },
    {
      title: "Approval & GSTIN Generation",
      description: "GSTIN certificate will be issued upon approval.",
      status: "pending",
    },
  ];

  return {
    id: dto.gstId,
    serviceId: "gst-registration",
    serviceName: "GST Registration",
    category: "GST",
    status: dto.status || "SUBMITTED",
    progress: dto.status === "SUBMITTED" ? 25 : 10,
    assignedExecutive: dto.assignedAgentId ? `Agent #${dto.assignedAgentId}` : "Under Assignment",
    paymentAmount: 0,
    paymentStatus: "Paid",
    createdAt: dto.createdAt || new Date().toISOString(),
    formData: {
      ...dto,
      applicantName: "GST Registration",
      businessName: "GST Registration",
      submissionDate: dto.submittedAt || dto.createdAt,
      appliedDate: dto.submittedAt || dto.createdAt,
      arn: dto.gstId,
    },
    documents,
    timeline,
    chatHistory: [],
  };
}
