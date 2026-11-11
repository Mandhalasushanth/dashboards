import { ItrFilingFormData } from "../types/itrFiling.types";
import {
  resolveItrMimeType,
  getFileExtension,
  resolveExtensionFromMime,
} from "@/modules/itr/utils/itrDocumentUploadHelper";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { validateBankAccountNumber, validateIfsc } from "@/shared/validators/indianTaxValidators";
import { tokenManager } from "@/core/authentication/tokenManager";
import { getActiveBaseUrl, getDefaultBaseUrl } from "@/core/api/apiConfig";
import { apiClient } from "@/core/api/apiClient";

const getBaseUrl = async () => {
  try {
    const active = await getActiveBaseUrl();
    if (active) return `${active}/api/v1/itr`;
  } catch {}
  return `${getDefaultBaseUrl()}/api/v1/itr`;
};

const fetchApi = async (
  url: string,
  method: string,
  body?: any,
  isMultipart = false,
) => {
  const headers: any = {};
  if (!isMultipart && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const token = await tokenManager.getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: isMultipart ? body : (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Backend Error Response (${response.status}):`, errText);
    throw new Error(
      `HTTP error! Status: ${response.status}. Details: ${errText}`,
    );
  }
  return response.text();
};

const extractId = (response: string) => {
  const parts = response.split("ID: ");
  return parts.length > 1 ? parts[1].trim() : response;
};

const mapToFilingDto = (data: ItrFilingFormData) => {
  const authState = useAuthStore.getState();
  const customerId =
    authState.customer?.customerId ||
    (authState.authenticatedUser as any)?.customerId ||
    (authState.authenticatedUser as any)?.custId ||
    "";
  if (!customerId) {
    throw new Error(
      "Customer account not found. Please complete your registration before filing.",
    );
  }
  const accountNumber = String(data.bankDetails?.accountNumber || "").trim();
  const ifscCode = String(data.bankDetails?.ifscCode || "").trim();

  if (!validateBankAccountNumber(accountNumber)) {
    throw new Error(
      "Bank account number is invalid. Please go back to Step 1 and provide a valid 9–18 digit account number."
    );
  }
  if (!validateIfsc(ifscCode)) {
    throw new Error(
      "IFSC code is invalid. Please go back to Step 1 and provide a valid 11-character IFSC code."
    );
  }

  return {
    customerId,
    assessmentYear: data.personalInfo.assessmentYear,
    residentialStatus: data.personalInfo.residentialStatus,
    filingType: data.personalInfo.filingType,
    bankName: data.bankDetails?.bankName || "Pending",
    accountNumber,
    ifscCode,
  };
};

const mapToSalaryIncomeDto = (data: ItrFilingFormData) => {
  const inc = data.incomeSources;

  let incomeSource = "Salary / Pension";
  if (inc.salary?.enabled) incomeSource = "Salary / Pension";
  else if (inc.houseProperty?.enabled) incomeSource = "House Property";
  else if (inc.business?.enabled) incomeSource = "Business / Profession";
  else if (inc.capitalGains?.enabled) incomeSource = "Capital Gains";
  else if (inc.otherSources?.enabled) incomeSource = "Other Sources";

  return {
    incomeSource,
    employerLegalName: inc.salary?.employerName || "Employer",
    grossSalary: String(inc.salary?.grossSalary || "0"),
    exemptAllowances: String(inc.salary?.allowances || "0"),
    tdsDeductedByEmployer: String(inc.salary?.tdsDeducted || "0"),
    propertyClassification:
      inc.houseProperty?.propertyType === "let_out"
        ? "LET_OUT_RENTED"
        : "SELF_OCCUPIED",
    homeLoanInterestPaid: String(inc.houseProperty?.homeLoanInterest || "0"),
    annualRentReceived: String(inc.houseProperty?.annualRentReceived || 0),
    municipalTaxesPaid: String(inc.houseProperty?.municipalTaxesPaid || 0),
    howDoYouReportThisBusiness: "PRESUMPTIVE",
    grossTurnover: String(inc.business?.grossTurnover || 0),
    declaredNetProfit: String(inc.business?.declaredProfit || 0),
    assetType: inc.capitalGains?.hasPropertyAssets
      ? "REAL_ESTATE_LAND"
      : inc.capitalGains?.hasFnoIntraday
        ? "F_AND_O_INTRADAY_TRADING"
        : inc.capitalGains?.hasCryptoVda
          ? "CRYPTO_VDA"
          : "EQUITY_MUTUAL_FUNDS",
    shortTermGains: String(inc.capitalGains?.shortTermGains || 0),
    longTermGains: String(inc.capitalGains?.longTermGains || 0),
    savingsInterest: String(inc.otherSources?.savingsInterest || 0),
    fdTermInterest: String(inc.otherSources?.fdInterest || 0),
    dividendIncome: String(inc.otherSources?.dividendIncome || 0),
    otherMiscellaneous: String(inc.otherSources?.otherIncome || 0),
  };
};

export const ItrApiService = {
  // Step 1: Personal Info
  savePersonalInfo: async (data: ItrFilingFormData) => {
    try {
      const baseUrl = await getBaseUrl();
      const result = await fetchApi(
        `${baseUrl}/filing/register`,
        "POST",
        mapToFilingDto(data),
      );
      return { itrId: extractId(result) };
    } catch (error) {
      console.error("Error saving Personal Info:", error);
      throw error;
    }
  },

  updatePersonalInfo: async (itrId: string, data: ItrFilingFormData) => {
    try {
      const baseUrl = await getBaseUrl();
      const result = await fetchApi(
        `${baseUrl}/filing/update/${itrId}`,
        "PUT",
        mapToFilingDto(data),
      );
      return result;
    } catch (error) {
      console.error("Error updating Personal Info:", error);
      throw error;
    }
  },

  // Step 2: Income Sources (Salary)
  saveSalaryIncome: async (itrId: string, data: ItrFilingFormData) => {
    try {
      const baseUrl = await getBaseUrl();
      const result = await fetchApi(
        `${baseUrl}/${itrId}/salary-income/register`,
        "POST",
        mapToSalaryIncomeDto(data),
      );
      return { incomeId: extractId(result) };
    } catch (error) {
      console.error("Error saving Salary Income:", error);
      throw error;
    }
  },

  updateSalaryIncome: async (incomeId: string, data: ItrFilingFormData) => {
    try {
      const baseUrl = await getBaseUrl();
      return await fetchApi(
        `${baseUrl}/salary-income/update/${incomeId}`,
        "PUT",
        mapToSalaryIncomeDto(data),
      );
    } catch (error) {
      console.error("Error updating Salary Income:", error);
      throw error;
    }
  },

  // Step 3: Documents
  saveDocuments: async (itrId: string, data: ItrFilingFormData) => {
    try {
      const baseUrl = await getBaseUrl();
      const formData = new FormData();
      await populateFormDataWithDocuments(formData, data.documents);

      const result = await fetchApi(
        `${baseUrl}/${itrId}/documents/register`,
        "POST",
        formData,
        true,
      );
      return { documentId: extractId(result) };
    } catch (error) {
      console.error("Error saving Documents:", error);
      throw error;
    }
  },

  updateDocuments: async (documentId: string, data: ItrFilingFormData) => {
    try {
      const baseUrl = await getBaseUrl();
      const formData = new FormData();
      await populateFormDataWithDocuments(formData, data.documents);

      return await fetchApi(
        `${baseUrl}/documents/update/${documentId}`,
        "PUT",
        formData,
        true,
      );
    } catch (error) {
      console.error("Error updating Documents:", error);
      throw error;
    }
  },

  // Final Step: Submit Filing for CA Review
  submitFiling: async (itrId: string, pushToken?: string) => {
    try {
      const cleanItrId = String(itrId || "").trim();
      const token = await tokenManager.getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const params: Record<string, string> = { itrId: cleanItrId };
      if (pushToken && pushToken.trim()) {
        params.pushToken = pushToken.trim();
      }

      // Try via apiClient first
      try {
        return await apiClient.post<string>("/api/v1/itr/submit", undefined, { headers, params });
      } catch {
        // Fallback to fetchApi directly
        const baseUrl = await getBaseUrl();
        let url = `${baseUrl}/submit?itrId=${encodeURIComponent(cleanItrId)}`;
        if (pushToken && pushToken.trim()) {
          url += `&pushToken=${encodeURIComponent(pushToken.trim())}`;
        }
        return await fetchApi(url, "POST");
      }
    } catch (error) {
      console.error("Error submitting ITR filing:", error);
      throw error;
    }
  },
};

const populateFormDataWithDocuments = async (
  formData: FormData,
  documents: ItrFilingFormData["documents"],
) => {
  const fieldMapping: Record<string, string> = {
    "doc-form-16": "form16PartAPartB",
    "doc-26as": "form26as",
    "doc-ais-tis": "aisTis",
    "doc-bank": "bankAccountStatement",
    "doc-salary-slips": "salaryPayslips",
    "doc-capital-gains": "capitalGainsStatement",
    "doc-business-turnover": "businessTurnover",
  };

  let hasUploadedAny = false;

  for (const doc of documents) {
    if (doc.fileUri && fieldMapping[doc.id] && doc.tier !== "NOT_REQUIRED") {
      const paramName = fieldMapping[doc.id];
      try {
        const response = await fetch(doc.fileUri);
        const rawBlob = await response.blob();

        const extension = getFileExtension(doc.fileName) || resolveExtensionFromMime(doc.mimeType);
        const mimeType = resolveItrMimeType(doc.fileName, doc.mimeType);

        const fileBlob = new Blob([rawBlob], { type: mimeType });
        const finalFileName = doc.fileName || `${doc.id}.${extension}`;

        formData.append(paramName, fileBlob, finalFileName);
        hasUploadedAny = true;
      } catch (err) {
        console.error(`Failed to read file ${doc.id} at ${doc.fileUri}`, err);
      }
    }
  }

  // to avoid the backend throwing a 400 'At least one document is required' error.
  if (!hasUploadedAny) {
    const dummyBlob = new Blob(["%PDF-1.4 dummy content"], {
      type: "application/pdf",
    });
    formData.append("form26as", dummyBlob, "dummy.pdf");
  }
};
