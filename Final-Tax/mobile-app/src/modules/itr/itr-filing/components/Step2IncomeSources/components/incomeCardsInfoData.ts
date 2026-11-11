import { InfoModalContent } from "./IncomeFieldInfoModal";

export const SALARY_CARD_INFO: InfoModalContent = {
  title: "Salary Income Details",
  description: "Enter your salary and tax deduction details from your Form 16 or payslip.",
  fields: [
    {
      label: "Employer Name",
      detail: "Enter the legal registered name of your employer or organisation.",
    },
    {
      label: "Gross Salary",
      detail: "Enter your total annual gross salary earned before any tax or PF deductions.",
    },
    {
      label: "Exempt Allowances",
      detail: "Enter total tax-exempt allowances such as HRA, LTA, or standard deduction (enter 0 if none).",
    },
    {
      label: "TDS Deducted",
      detail: "Enter the total tax already deducted by your employer as shown in Form 16 / 26AS (enter 0 if none).",
    },
  ],
};

export const HOUSE_PROPERTY_CARD_INFO: InfoModalContent = {
  title: "House Property Details",
  description: "Enter details for your self-occupied or rented residential/commercial property.",
  fields: [
    {
      label: "Property Type",
      detail: "Choose Self-Occupied if you reside in it, or Let-Out if given on rent.",
    },
    {
      label: "Annual Rent Received",
      detail: "Enter the total rent amount received from tenants during the financial year (enter 0 for self-occupied).",
    },
    {
      label: "Municipal Taxes Paid",
      detail: "Enter the local property or municipal tax paid by you during the year (enter 0 if none).",
    },
    {
      label: "Home Loan Interest",
      detail: "Enter the annual interest paid on your housing loan certificate (enter 0 if no loan).",
    },
  ],
};

export const BUSINESS_CARD_INFO: InfoModalContent = {
  title: "Business / Profession Details",
  description: "Enter turnover and profit details for your business or freelance profession.",
  fields: [
    {
      label: "Reporting Scheme",
      detail: "Select Presumptive Taxation (Section 44AD / 44ADA) or Regular Books of Account.",
    },
    {
      label: "Gross Turnover / Receipts",
      detail: "Enter the total annual sales turnover, billings, or professional receipts collected.",
    },
    {
      label: "Declared Net Profit",
      detail: "Enter your taxable net profit (minimum 6%/8% for business 44AD, 50% for professional 44ADA).",
    },
  ],
};

export const CAPITAL_GAINS_CARD_INFO: InfoModalContent = {
  title: "Capital Gains Details",
  description: "Enter gains or losses from sale of shares, mutual funds, or immovable property.",
  fields: [
    {
      label: "Asset Types Traded",
      detail: "Select the investment categories you traded (e.g. Equity Shares, Mutual Funds, Real Estate).",
    },
    {
      label: "Short-Term Capital Gains (STCG)",
      detail: "Enter net profit from sale of short-term assets (equity held <= 12 months; enter 0 if none).",
    },
    {
      label: "Long-Term Capital Gains (LTCG)",
      detail: "Enter net profit from sale of long-term assets (equity held > 12 months; enter 0 if none).",
    },
  ],
};

export const OTHER_SOURCES_CARD_INFO: InfoModalContent = {
  title: "Other Sources Details",
  description: "Enter interest, dividend, or any other miscellaneous taxable receipts.",
  fields: [
    {
      label: "Savings Account Interest",
      detail: "Enter the total interest received across all your savings bank accounts (enter 0 if none).",
    },
    {
      label: "FD / Term Deposit Interest",
      detail: "Enter the total interest earned from fixed or recurring deposits (enter 0 if none).",
    },
    {
      label: "Dividend Income",
      detail: "Enter total dividend payouts received from shares or mutual fund units (enter 0 if none).",
    },
    {
      label: "Other Miscellaneous Income",
      detail: "Enter any other taxable receipts like family pension, gifts, or commissions (enter 0 if none).",
    },
  ],
};
