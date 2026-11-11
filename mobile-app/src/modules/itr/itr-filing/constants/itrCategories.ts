import { ItrCategoryType } from "../types/itrFiling.types";

export interface CategoryOption {
  id: ItrCategoryType;
  title: string;
  subtitle: string;
  iconName: string;
}

export const ALL_CATEGORIES: CategoryOption[] = [
  {
    id: "salaried",
    title: "Salaried",
    subtitle: "Salary income with Form 16",
    iconName: "person-outline",
  },
  {
    id: "business",
    title: "Business Income",
    subtitle: "Trading, manufacturing & sales",
    iconName: "storefront-outline",
  },
  {
    id: "professional",
    title: "Professional",
    subtitle: "Doctor, Lawyer, Consultant, CA",
    iconName: "medkit-outline",
  },
  {
    id: "freelancer",
    title: "Freelancer",
    subtitle: "Independent contractor & gigs",
    iconName: "laptop-outline",
  },
  {
    id: "trader_investor",
    title: "Trader / Investor",
    subtitle: "Stocks, F&O & Intraday",
    iconName: "trending-up-outline",
  },
  {
    id: "rental",
    title: "Rental Income",
    subtitle: "House & commercial property",
    iconName: "home-outline",
  },
  {
    id: "capital_gains",
    title: "Capital Gains",
    subtitle: "Property, shares & mutual funds",
    iconName: "document-text-outline",
  },
  {
    id: "multiple",
    title: "Multiple Sources",
    subtitle: "Combination of income sources",
    iconName: "link-outline",
  },
];

