/**
 * Official Indian States and Union Territories (36 entities)
 * Aligned with GST portal standard conventions and ISO 3166-2:IN.
 */
export const STATE_OPTIONS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

/**
 * Standard verified Indian commercial banks.
 * Serves as search baseline in UI, complemented by manual entry.
 */
export const BANK_OPTIONS = [
  "Axis Bank",
  "Bank of Baroda",
  "Bank of India",
  "Canara Bank",
  "Central Bank of India",
  "Federal Bank",
  "HDFC Bank",
  "ICICI Bank",
  "IDBI Bank",
  "IDFC First Bank",
  "IndusInd Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "State Bank of India",
  "Union Bank of India",
  "Yes Bank",
] as const;

export type StateOption = (typeof STATE_OPTIONS)[number];
export type BankOption = (typeof BANK_OPTIONS)[number];

export const BUSINESS_TYPES = [
  "Proprietorship", "Partnership Firm", "Limited Liability Partnership (LLP)",
  "Private Limited Company", "Public Limited Company", "HUF",
  "Society / Trust / Club", "AOP / BOI", "Government Department",
  "Foreign Company", "One Person Company (OPC)",
] as const;

export const NATURE_OF_BUSINESS = [
  "Trader", "Manufacturer", "Service Provider", "Wholesaler / Distributor",
  "Retailer", "Exporter / Importer", "Contractor / Freelancer",
] as const;

export const REASONS = [
  "Crossed turnover threshold", "Voluntary registration", "Inter-state supply",
  "E-commerce operator / seller", "Casual taxable person", "Input Service Distributor",
] as const;

export const COMPOSITION_OPTIONS = ["No - regular scheme", "Yes - composition scheme"] as const;
export const PLACE_OPTIONS = ["Principal place of business", "Additional place of business"] as const;
export const ACCOUNT_TYPES = ["Current", "Savings", "Cash Credit / OD"] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];
export type NatureOfBusiness = (typeof NATURE_OF_BUSINESS)[number];
export type ReasonForRegistration = (typeof REASONS)[number];
export type CompositionOption = (typeof COMPOSITION_OPTIONS)[number];
export type PlaceOption = (typeof PLACE_OPTIONS)[number];
export type AccountType = (typeof ACCOUNT_TYPES)[number];
