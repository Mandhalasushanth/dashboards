import type { Application, ApplicationDocument, TimelineStep } from "@/types/domain";

export interface ItrFilingBackendDto {
  itrId: string;
  applicationType?: string;
  status: string;
  assignedAgentId?: number | null;
  createdAt: string;
  updatedAt?: string;
  submittedAt?: string;

  // Display identifier
  assessmentYear?: string;

  // Documents flags
  form16Uploaded?: boolean;
  form26asUploaded?: boolean;
  aisTisUploaded?: boolean;
  bankAccountStatementUploaded?: boolean;
  salaryPayslipsUploaded?: boolean;
}

export function mapItrFilingBackendToApplication(dto: ItrFilingBackendDto): Application {
  const ay = dto.assessmentYear ? `AY ${dto.assessmentYear}` : "ITR Filing";
  const serviceName = `ITR Filing (${ay})`;

  const documents: ApplicationDocument[] = [
    { name: "Form 16 (Part A & B)", status: dto.form16Uploaded ? "Uploaded" : "Pending" },
    { name: "Form 26AS", status: dto.form26asUploaded ? "Uploaded" : "Pending" },
    { name: "AIS / TIS Statement", status: dto.aisTisUploaded ? "Uploaded" : "Pending" },
    { name: "Bank Account Statement", status: dto.bankAccountStatementUploaded ? "Uploaded" : "Pending" },
    { name: "Salary Payslips", status: dto.salaryPayslipsUploaded ? "Uploaded" : "Pending" },
  ];

  const timeline: TimelineStep[] = [
    {
      title: "ITR Submitted",
      description: "Your income tax return filing has been submitted for CA review.",
      status: "completed",
      date: dto.submittedAt || dto.createdAt,
    },
    {
      title: "Computation & Verification",
      description: "Income, deductions, and tax liabilities are being verified.",
      status: dto.status === "SUBMITTED" ? "current" : "pending",
    },
    {
      title: "ITR-V & Acknowledgement",
      description: "Official e-filing acknowledgement will be generated.",
      status: "pending",
    },
  ];

  return {
    id: dto.itrId,
    serviceId: "itr-filing",
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
      applicantName: "Income Tax Return",
      businessName: "Income Tax Return",
      assessmentYear: dto.assessmentYear,
      submissionDate: dto.submittedAt || dto.createdAt,
      appliedDate: dto.submittedAt || dto.createdAt,
      arn: dto.itrId,
    },
    documents,
    timeline,
    chatHistory: [],
  };
}
