import type { CatalogueSection } from "@/types/domain";

/**
 * Service catalogue shown in the "Explore Services" sheet.
 *
 * `serviceId` is set only where a matching entry exists in data/services.ts, so
 * the row can open /service/<id>. Everything else falls back to the category's
 * module hub.
 */
export const SERVICE_CATALOGUE: CatalogueSection[] = [
  {
    id: "GST",
    title: "GST Services",
    icon: "receipt",
    tint: "#2563EB",
    tintBg: "#EAF1FE",
    items: [
      { label: "GST Registration", serviceId: "gst-registration" },
      { label: "GST Filing", serviceId: "gst-filing" },
      { label: "GST Compliance", serviceId: "gst-compliance" },
      // { label: "GST Cancellation" },
      { label: "GST Amendment" },
      { label: "GST Certificate" },
    ],
  },
  {
    id: "ITR",
    title: "ITR & TDS Services",
    icon: "reader",
    tint: "#0F766E",
    tintBg: "#E6F5F2",
    items: [
      { label: "ITR Filing", serviceId: "itr-filing" },
      { label: "TDS Refund", serviceId: "tds-refund" },
      { label: "Previous Year ITR" },
      { label: "Revised ITR" },
      { label: "Tax Notice Assistance" },
    ],
  },
  {
    id: "LOANS",
    title: "Loans & Finance",
    icon: "business",
    tint: "#EA580C",
    tintBg: "#FEF0E6",
    items: [
      { label: "Business Loan", serviceId: "business-loan" },
      { label: "Personal Loan", serviceId: "personal-loan" },
      { label: "Working Capital", serviceId: "working-capital" },
      { label: "Home Loan", serviceId: "home-loan" },
      { label: "Property Loan", serviceId: "property-loan" },
      { label: "Vehicle Loan", serviceId: "vehicle-loan" },
      { label: "Machinery Loan", serviceId: "machinery-loan" },
    ],
  },
  {
    id: "INSURANCE",
    title: "Insurance",
    icon: "shield-checkmark",
    tint: "#DC2626",
    tintBg: "#FDEBEB",
    items: [
      { label: "Health Insurance", serviceId: "health-insurance" },
      { label: "Life Insurance", serviceId: "life-insurance" },
      { label: "Vehicle Insurance" },
      { label: "Property Insurance" },
      { label: "Business Insurance" },
    ],
  },
  {
    id: "BUSINESS",
    title: "Commercial",
    icon: "storefront",
    tint: "#0891B2",
    tintBg: "#E5F5F9",
    items: [
      { label: "Trade License" },
      { label: "Shop & Establishment" },
      { label: "Import Export Code" },
      { label: "Commercial Property" },
      { label: "Udyam / MSME" },
    ],
  },
  {
    id: "BUSINESS",
    title: "Business Services",
    icon: "briefcase",
    tint: "#7C3AED",
    tintBg: "#F1ECFE",
    items: [
      { label: "Company Registration", serviceId: "company-registration" },
      { label: "Accounting & Bookkeeping", serviceId: "accounting-bookkeeping" },
      { label: "Payroll Management" },
      { label: "Trademark Registration" },
      { label: "Business Advisory" },
      { label: "Annual Compliance" },
    ],
  },
];
