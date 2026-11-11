import { companyRegistrationApi } from "./companyRegistrationApi";
import type { CompanyType } from "../types/company.types";

export interface CompanyTypeOption {
  type: CompanyType;
  title: string;
  description: string;
  minMembers: number;
  timeline: string;
  fee: number;
}

export const companyRegistrationService = {
  api: companyRegistrationApi,

  getCompanyTypes: (): CompanyTypeOption[] => [
    {
      type: "Private Limited",
      title: "Private Limited Company (Pvt Ltd)",
      description: "Ideal for startups and growing businesses looking to raise venture capital.",
      minMembers: 2,
      timeline: "7 - 10 Days",
      fee: 4999,
    },
    {
      type: "Limited Liability Partnership (LLP)",
      title: "Limited Liability Partnership (LLP)",
      description: "Best for professional firms and consultancy businesses with low compliance needs.",
      minMembers: 2,
      timeline: "5 - 7 Days",
      fee: 3999,
    },
    {
      type: "One Person Company (OPC)",
      title: "One Person Company (OPC)",
      description: "Sole founder with limited liability protection and full corporate status.",
      minMembers: 1,
      timeline: "7 - 10 Days",
      fee: 4499,
    },
    {
      type: "Section 8 (NGO)",
      title: "Section 8 Company (NGO / Trust)",
      description: "Non-profit foundation for social, educational, or charitable missions.",
      minMembers: 2,
      timeline: "12 - 15 Days",
      fee: 7999,
    },
    {
      type: "Public Limited",
      title: "Public Limited Company",
      description: "Large scale corporate • Public shareholding & listing",
      minMembers: 3,
      timeline: "14 - 20 Days",
      fee: 14999,
    },
  ],
};

export default companyRegistrationService;
