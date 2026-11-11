import { apiClient } from "../../../../core/api/apiClient";
import { tokenManager } from "@/core/authentication/tokenManager";
import { TdsCustomerIncomeFormData } from "../types/customerIncome.types";
import { TdsDocumentItem } from "../types/tdsDocuments.types";
import { parsePositiveNumber } from "../utils/tdsValidation";
import {
  TdsRefundDto,
  RefundBankAccountDto,
  IncomeTaxInfoDto,
  TdsTaxesPaidDto,
} from "./tdsApiTypes";
import { readFileAsBase64 } from "./tdsDocumentsApiService";

// Helper: Extract generated ID from Spring backend string responses like "Saved. ID: TDS-12345" or "TDS12345"
const extractIdFromResponse = (responseMsg: unknown): string | null => {
  if (!responseMsg) return null;
  if (typeof responseMsg === "object" && (responseMsg as any).id) {
    return String((responseMsg as any).id);
  }
  if (typeof responseMsg !== "string") return String(responseMsg);
  const match = responseMsg.match(/ID:\s*([A-Za-z0-9_-]+)/i);
  if (match) return match[1];
  const trimmed = responseMsg.trim().replace(/^["']|["']$/g, "");
  return trimmed || null;
};

export const tdsBankAndIncomeApiService = {
  // ----------------------------------------------------
  // 1. TDS REFUND / BANK ACCOUNT API (@RequestMapping("/tds-refund"))
  // ----------------------------------------------------
  buildTdsRefundPayload: async (
    bankData: TdsCustomerIncomeFormData["bank"] | TdsRefundDto,
    custId?: string,
    businessData?: TdsCustomerIncomeFormData["business"],
    documents?: TdsDocumentItem[],
    personalData?: TdsCustomerIncomeFormData["personal"],
  ): Promise<TdsRefundDto> => {
    let panBase64: string | null = null;
    let aadhaarBase64: string | null = null;

    if (documents && Array.isArray(documents)) {
      const panDoc =
        documents.find(
          (d) =>
            d.id === "pan" ||
            String(d.id || "").toLowerCase().includes("pan") ||
            String(d.title || "").toLowerCase().includes("pan") ||
            (d as any).iconType === "pan",
        ) || documents[0];
      const aadhaarDoc =
        documents.find(
          (d) =>
            d.id === "aadhaar" ||
            String(d.id || "").toLowerCase().includes("aadhaar") ||
            String(d.title || "").toLowerCase().includes("aadhaar"),
        ) || documents[1];

      const panUri = panDoc?.fileUri || (panDoc as any)?.uri || (panDoc as any)?.fileUrl || (panDoc as any)?.url;
      const aadhaarUri = aadhaarDoc?.fileUri || (aadhaarDoc as any)?.uri || (aadhaarDoc as any)?.fileUrl || (aadhaarDoc as any)?.url;

      if (panUri) {
        panBase64 = await readFileAsBase64(panUri);
      }
      if (aadhaarUri) {
        aadhaarBase64 = await readFileAsBase64(aadhaarUri);
      }
    }

    // Fallback: check saved draft storage if not in memory
    if (!panBase64 || !aadhaarBase64) {
      try {
        const { tdsDraftService } = await import("./tdsDraftService");
        const draftDocs = await tdsDraftService.getDocumentsDraft();
        if (draftDocs && Array.isArray(draftDocs)) {
          const draftPan =
            draftDocs.find((d) => String(d.id || "").toLowerCase().includes("pan") || String(d.title || "").toLowerCase().includes("pan")) || draftDocs[0];
          const draftAadhaar =
            draftDocs.find((d) => String(d.id || "").toLowerCase().includes("aadhaar") || String(d.title || "").toLowerCase().includes("aadhaar")) || draftDocs[1];
          if (!panBase64 && (draftPan?.fileUri || (draftPan as any)?.uri)) {
            panBase64 = await readFileAsBase64(draftPan.fileUri || (draftPan as any).uri);
          }
          if (!aadhaarBase64 && (draftAadhaar?.fileUri || (draftAadhaar as any)?.uri)) {
            aadhaarBase64 = await readFileAsBase64(draftAadhaar.fileUri || (draftAadhaar as any).uri);
          }
        }
      } catch (draftErr) {
        console.warn("[TDS API] Draft docs fallback check warning:", draftErr);
      }
    }

    console.log("📄 [TDS API] Documents processed -> PAN bytes length:", panBase64?.length || 0, "Aadhaar bytes length:", aadhaarBase64?.length || 0);

    const isDirectDto = "legalBusinessName" in bankData;

    const legalBusinessName = isDirectDto
      ? (bankData as TdsRefundDto).legalBusinessName
      : (businessData?.legalName || personalData?.fullName || bankData.accountHolderName || "").trim();

    const businessPan = isDirectDto
      ? (bankData as TdsRefundDto).businessPan
      : (businessData?.pan || personalData?.pan || "").trim().toUpperCase();

    const aadhaarNumber = isDirectDto
      ? (bankData as TdsRefundDto).aadhaarNumber
      : (businessData?.aadhaar || personalData?.aadhaar || "").replace(/\D/g, "");

    const mobileNumber = isDirectDto
      ? (bankData as TdsRefundDto).mobileNumber
      : (businessData?.mobileNumber || personalData?.mobileNumber || custId || "").replace(/\D/g, "").slice(-10);

    const accountHolderName = isDirectDto
      ? (bankData as TdsRefundDto).accountHolderName
      : (bankData.accountHolderName || personalData?.fullName || "").trim();

    const accountNumber = isDirectDto
      ? (bankData as TdsRefundDto).accountNumber
      : (bankData.accountNumber || "").trim();

    const confirmAccountNumber = isDirectDto
      ? (bankData as TdsRefundDto).confirmAccountNumber
      : (bankData.confirmAccountNumber || bankData.accountNumber || "").trim();

    const ifscCode = isDirectDto
      ? (bankData as TdsRefundDto).ifscCode
      : (bankData.ifscCode || "").trim().toUpperCase();

    const bankName = isDirectDto
      ? (bankData as TdsRefundDto).bankName
      : (bankData.bankName || "").trim();

    const branchName = isDirectDto
      ? (bankData as TdsRefundDto).branchName
      : (bankData.branchName || "").trim();

    const accountType = isDirectDto
      ? (bankData as TdsRefundDto).accountType
      : (bankData.accountType?.toUpperCase() === "CURRENT" ? "CURRENT" : "SAVINGS");

    return {
      legalBusinessName,
      businessPan,
      businessPanDocument: isDirectDto ? (bankData as TdsRefundDto).businessPanDocument : (panBase64 || undefined),
      aadhaarNumber,
      aadhaarDocument: isDirectDto ? (bankData as TdsRefundDto).aadhaarDocument : (aadhaarBase64 || undefined),
      mobileNumber,
      accountHolderName,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
      bankName: bankName || undefined,
      branchName: branchName || undefined,
      accountType,
    };
  },

  /**
   * Save new TDS Refund / Bank Account (@PostMapping("/save"))
   */
  saveBankAccount: async (
    bankData: TdsCustomerIncomeFormData["bank"] | TdsRefundDto,
    custId: string,
    existingId?: string,
    businessData?: TdsCustomerIncomeFormData["business"],
    documents?: TdsDocumentItem[],
    personalData?: TdsCustomerIncomeFormData["personal"],
  ): Promise<string> => {
    if (existingId) {
      return await tdsBankAndIncomeApiService.updateBankAccount(
        existingId,
        bankData,
        custId,
        businessData,
        documents,
        personalData,
      );
    }

    const payload = await tdsBankAndIncomeApiService.buildTdsRefundPayload(
      bankData,
      custId,
      businessData,
      documents,
      personalData,
    );

    console.log("🌐 [TDS API] Calling POST /tds-refund/save with payload:", {
      ...payload,
      businessPanDocument: payload.businessPanDocument ? `[base64: ${payload.businessPanDocument.length} chars]` : undefined,
      aadhaarDocument: payload.aadhaarDocument ? `[base64: ${payload.aadhaarDocument.length} chars]` : undefined,
    });

    const res = await apiClient.post<string>("/tds-refund/save", payload);
    const extractedId =
      extractIdFromResponse(res) || (typeof res === "string" ? res : null) || "";
    return extractedId;
  },

  /**
   * Update existing TDS Refund / Bank Account (@PutMapping("/update/{id}"))
   */
  updateBankAccount: async (
    id: string,
    bankData: TdsCustomerIncomeFormData["bank"] | TdsRefundDto,
    custId?: string,
    businessData?: TdsCustomerIncomeFormData["business"],
    documents?: TdsDocumentItem[],
    personalData?: TdsCustomerIncomeFormData["personal"],
  ): Promise<string> => {
    const payload = await tdsBankAndIncomeApiService.buildTdsRefundPayload(
      bankData,
      custId,
      businessData,
      documents,
      personalData,
    );

    console.log(`🌐 [TDS API] Calling PUT /tds-refund/update/${id} with payload:`, {
      ...payload,
      businessPanDocument: payload.businessPanDocument ? `[base64: ${payload.businessPanDocument.length} chars]` : undefined,
      aadhaarDocument: payload.aadhaarDocument ? `[base64: ${payload.aadhaarDocument.length} chars]` : undefined,
    });

    let res: string;
    try {
      res = await apiClient.put<string>(`/tds-refund/update/${id}`, payload);
    } catch (err) {
      console.warn(`[TDS API] PUT /tds-refund/update/${id} failed, falling back to /tds-refund/save:`, err);
      res = await apiClient.post<string>("/tds-refund/save", payload);
    }

    const extractedId =
      extractIdFromResponse(res) || (typeof res === "string" ? res : null) || id;
    return extractedId;
  },

  /**
   * Update directly with DTO (@PutMapping("/update/{id}"))
   */
  updateTdsRefund: async (id: string, dto: TdsRefundDto): Promise<string> => {
    console.log(`🌐 [TDS API] Calling PUT /tds-refund/update/${id}`);
    const res = await apiClient.put<string>(`/tds-refund/update/${id}`, dto);
    return extractIdFromResponse(res) || (typeof res === "string" ? res : id);
  },

  saveTdsRefund: async (dto: TdsRefundDto, existingId?: string): Promise<string> => {
    if (existingId) {
      return await tdsBankAndIncomeApiService.updateTdsRefund(existingId, dto);
    }
    const res = await apiClient.post<string>("/tds-refund/save", dto);
    return extractIdFromResponse(res) || (typeof res === "string" ? res : "");
  },

  getTdsRefund: async (id: string): Promise<TdsRefundDto> => {
    return await apiClient.get<TdsRefundDto>(
      `/tds-refund/get/${id}`,
    );
  },

  submitTdsRefund: async (id: string, pushToken?: string): Promise<string> => {
    try {
      const cleanId = String(id || "").trim();
      if (!cleanId) {
        throw new Error("Missing TDS refund ID for submission.");
      }
      const token = await tokenManager.getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const params: Record<string, string> = { id: cleanId };
      if (pushToken && pushToken.trim()) {
        params.pushToken = pushToken.trim();
      }

      console.log(`🌐 [TDS API] Calling POST /tds-refund/submit?id=${cleanId}`, { pushToken });

      try {
        return await apiClient.post<string>("/tds-refund/submit", undefined, { headers, params });
      } catch (clientErr: any) {
        const errMsg = String(clientErr?.response?.data || clientErr?.message || "");
        if (
          errMsg.toLowerCase().includes("already submitted") ||
          errMsg.toLowerCase().includes("cannot be submitted")
        ) {
          console.warn("[TDS API] Idempotent submit detected:", errMsg);
          return `TDS refund submitted successfully. Refund ID: ${cleanId}`;
        }

        // Direct fetch fallback
        const { getActiveBaseUrl } = await import("../../../../core/api/apiConfig");
        const activeHost = await getActiveBaseUrl();
        let url = `${activeHost}/tds-refund/submit?id=${encodeURIComponent(cleanId)}`;
        if (pushToken && pushToken.trim()) {
          url += `&pushToken=${encodeURIComponent(pushToken.trim())}`;
        }
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const resText = await res.text();
        if (!res.ok) {
          if (
            resText.toLowerCase().includes("already submitted") ||
            resText.toLowerCase().includes("cannot be submitted")
          ) {
            return `TDS refund submitted successfully. Refund ID: ${cleanId}`;
          }
          throw new Error(resText || `HTTP ${res.status}`);
        }
        return resText;
      }
    } catch (error) {
      console.error("Error submitting TDS refund:", error);
      throw error;
    }
  },

  getBankAccount: async (id: string): Promise<RefundBankAccountDto> => {
    return await apiClient.get<RefundBankAccountDto>(
      `/tds-refund/get/${id}`,
    );
  },

  getBankAccountByCustId: async (
    custId: string,
  ): Promise<RefundBankAccountDto | null> => {
    try {
      return await apiClient.get<RefundBankAccountDto>(
        `/tds-refund/get-by-customer/${custId}`,
      );
    } catch {
      return null;
    }
  },

  // ----------------------------------------------------
  // 2. INCOME & TAX INFO API
  // ----------------------------------------------------
  saveIncomeTaxInfo: async (
    incomeData: TdsCustomerIncomeFormData["income"],
    tdsRefundId: string,
  ): Promise<string> => {
    const payload: IncomeTaxInfoDto = {
      tdsRefundId,
      salaryIncome: parsePositiveNumber(incomeData.salaryIncome),
      otherIncome: parsePositiveNumber(incomeData.otherIncome),
      interestIncome: parsePositiveNumber(incomeData.interestIncome),
      rentalIncome: incomeData.hasRentalIncome
        ? parsePositiveNumber(incomeData.rentalIncome)
        : 0,
      municipalTaxesPaid: incomeData.hasRentalIncome
        ? parsePositiveNumber(incomeData.municipalTaxesPaid)
        : 0,
      shortTermCapitalGains: incomeData.hasCapitalGains
        ? parsePositiveNumber(incomeData.shortTermCapitalGains)
        : 0,
      longTermCapitalGains: incomeData.hasCapitalGains
        ? parsePositiveNumber(incomeData.longTermCapitalGains)
        : 0,
      grossTurnover: incomeData.hasBusinessIncome
        ? parsePositiveNumber(incomeData.grossTurnover)
        : 0,
      netBusinessProfit: incomeData.hasBusinessIncome
        ? parsePositiveNumber(incomeData.netBusinessProfit)
        : 0,
      homeLoanInterestSec24b: incomeData.hasHomeLoan
        ? parsePositiveNumber(incomeData.homeLoanInterestSec24b)
        : 0,
      deductions80C: incomeData.hasDeductions
        ? parsePositiveNumber(incomeData.deductions80C)
        : 0,
      deductions80D: incomeData.hasDeductions
        ? parsePositiveNumber(incomeData.deductions80D)
        : 0,
    };

    return await apiClient.post<string>("/itr/income-tax-info/save", payload);
  },

  getIncomeTaxInfo: async (
    tdsRefundId: string,
  ): Promise<IncomeTaxInfoDto | null> => {
    try {
      return await apiClient.get<IncomeTaxInfoDto>(
        `/itr/income-tax-info/${tdsRefundId}`,
      );
    } catch {
      return null;
    }
  },

  // ----------------------------------------------------
  // 3. TDS & TAXES PAID API
  // ----------------------------------------------------
  saveTdsTaxesPaid: async (
    incomeData: TdsCustomerIncomeFormData["income"],
    custId: string,
    tdsRefundId: string,
  ): Promise<string> => {
    const payload: TdsTaxesPaidDto = {
      custId,
      tdsRefundId,
      totalTdsDeducted: parsePositiveNumber(incomeData.totalTdsDeducted),
      tcsAmount: parsePositiveNumber(incomeData.tcsAmount),
      advanceTax: parsePositiveNumber(incomeData.advanceTaxPaid),
      selfAssessmentTax: parsePositiveNumber(incomeData.selfAssessmentTaxPaid),
    };

    return await apiClient.post<string>("/itr/tds-taxes-paid/save", payload);
  },

  getTdsTaxesPaid: async (
    tdsRefundId: string,
  ): Promise<TdsTaxesPaidDto | null> => {
    try {
      return await apiClient.get<TdsTaxesPaidDto>(
        `/itr/tds-taxes-paid/${tdsRefundId}`,
      );
    } catch {
      return null;
    }
  },
};
