import type { Payment } from "@/types/domain";

export const mockPayments: Payment[] = [
  {
    id: "PAY-1001",
    applicationId: "ITR-2026-00032",
    serviceName: "ITR Filing Standard Assisted Plan",
    amount: 1800,
    status: "Pending",
    dueDate: "Sep 10, 2026",
    invoiceNo: "TXE-2026-09214",
  },
  {
    id: "PAY-1002",
    applicationId: "LOAN-2026-00021",
    serviceName: "Business Loan Processing Fee Assistance",
    amount: 1130,
    status: "Pending",
    dueDate: "Sep 05, 2026",
    invoiceNo: "TXE-2026-09118",
  },
  {
    id: "PAY-1003",
    applicationId: "GST-2026-00045",
    serviceName: "GST Quarterly Return Filing Service",
    amount: 2500,
    status: "Paid",
    paymentDate: "Aug 16, 2026",
    invoiceNo: "TXE-2026-08103",
  },
  {
    id: "PAY-1004",
    applicationId: "PREV-00008",
    serviceName: "Company Registration Incorporation Fee",
    amount: 5000,
    status: "Paid",
    paymentDate: "Jul 10, 2026",
    invoiceNo: "TXE-2026-07085",
  },
];
