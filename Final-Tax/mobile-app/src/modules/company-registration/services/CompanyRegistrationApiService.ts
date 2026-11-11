import { File as ExpoFile } from 'expo-file-system';
import type { CompanyRegistrationDraft } from "../types/registration.types";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { tokenManager } from "@/core/authentication/tokenManager";
import { getDefaultBaseUrl } from "@/core/api/apiConfig";

const getBaseUrl = () => `${getDefaultBaseUrl()}/api/v1`;

import { tokenRefreshManager } from "@/core/authentication/tokenRefreshManager";

const fetchApi = async (
  url: string,
  method: string,
  body?: any,
  isMultipart = false,
  isRetry = false,
): Promise<string> => {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  const token = await tokenManager.getAccessToken();
  console.log(`[API AUTH CHECK] Token present: ${Boolean(token)}, Token preview: ${token ? token.substring(0, 15) + '...' : 'NULL'}`);
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log(`[API REQUEST] ${method} ${url}`, !isMultipart ? JSON.stringify(body) : "[Multipart]");

  const response = await fetch(url, {
    method,
    headers,
    body: isMultipart ? body : JSON.stringify(body),
  });

  if (!response.ok) {
    // If token expired, attempt silent token refresh and retry once
    if (response.status === 401 && !isRetry) {
      console.log(`[API 401] Access token expired on ${url}. Attempting silent token refresh...`);
      const refreshed = await tokenRefreshManager.attemptRefresh();
      if (refreshed) {
        console.log(`[API 401] Token refresh succeeded. Retrying ${method} ${url}...`);
        return fetchApi(url, method, body, isMultipart, true);
      }
    }

    const errText = await response.text();
    console.error(`Backend Error Response (${response.status}) on ${url}:`, errText);
    throw new Error(
      `HTTP error! Status: ${response.status}. Details: ${errText}`,
    );
  }
  const resText = await response.text();
  console.log(`[API SUCCESS] ${method} ${url} ->`, resText);
  return resText;
};

const cleanStr = (val?: string, fallback = "") =>
  val && val.trim().length > 0 ? val.trim() : fallback;

export const extractId = (response: string) => {
  const parts = response.split("ID: ");
  return parts.length > 1 ? parts[1].trim() : response.trim();
};

export const mapDraftToCompanyDetailsDto = (
  draft: CompanyRegistrationDraft,
  companyRegistrationId?: string,
) => {
  const company = draft.company;
  const authState = useAuthStore.getState();
  const customerId =
    authState.customer?.customerId ||
    (authState.customer as any)?.custId ||
    "CIXZPU77UY";

  return {
    companyRegistrationId: companyRegistrationId || undefined,
    categoryOfCompany: cleanStr(company?.companyCategory, "Company limited by Shares"),
    subCategoryOfCompany: cleanStr(company?.companySubCategory, "Indian Non-Government Company"),
    proposedCompanyName: cleanStr(company?.proposedName1, "Tech Solutions"),
    alternativeProposedName: cleanStr(company?.proposedName2, "Tech Corp"),
    primaryBusinessActivity: cleanStr(company?.primaryActivity, "Information Technology"),
    nic5DigitCode: /^[0-9]{5}$/.test(company?.nicCode || "") ? company.nicCode : "62011",
    secondaryActivity: cleanStr(company?.secondaryActivity),
    companyStructure: cleanStr(company?.companyType, "Private Limited"),
    customerId,
  };
};

export const mapDraftToOfficeDto = (
  draft: CompanyRegistrationDraft,
  companyRegistrationId: string,
  registeredOfficeId?: string,
) => {
  const company = draft.company;
  return {
    registeredOfficeId: registeredOfficeId || undefined,
    companyRegistrationId,
    buildingPremisesAddressLine: cleanStr(company?.registeredAddressLine, "123 Business Park"),
    city: cleanStr(company?.registeredCity, "Bangalore"),
    district: cleanStr(company?.registeredDistrict, "Bangalore"),
    state: cleanStr(company?.registeredState, "Karnataka"),
    pinCode: /^[0-9]{6}$/.test(company?.registeredPincode || "") ? company.registeredPincode : "560001",
    premisesOwnership: cleanStr(company?.premisesOwnership, "Rented"),
    companyEmail: cleanStr(company?.companyEmail, "company@finsolz.in"),
    mobileNumber: /^[0-9]{10}$/.test(company?.companyMobile || "") ? company.companyMobile : "9876543210",
  };
};

const formatToIsoDate = (dobStr?: string, fallback = "1990-01-01"): string => {
  if (!dobStr || dobStr.trim() === "") return fallback;
  const trimmed = dobStr.trim();
  // If in DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [dd, mm, yyyy] = trimmed.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }
  // If in DD-MM-YY format (e.g. 16-06-99 -> 1999-06-16)
  if (/^\d{2}-\d{2}-\d{2}$/.test(trimmed)) {
    const [dd, mm, yy] = trimmed.split("-");
    const numYy = parseInt(yy, 10);
    const fullYear = numYy > 30 ? `19${yy}` : `20${yy}`;
    return `${fullYear}-${mm}-${dd}`;
  }
  // If already in YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return fallback;
};

export const mapDraftToPromotersDto = (
  draft: CompanyRegistrationDraft,
  companyRegistrationId: string,
) => {
  const isOpc =
    draft.company?.companyType?.toLowerCase().includes("opc") ||
    draft.company?.companyType?.toLowerCase().includes("one person") ||
    draft.company?.companyType === "One Person Company (OPC)";

  // If OPC, use the entered opcNominee if directors is empty or contains no entered data
  let directors = draft.directors || [];
  if (isOpc && draft.opcNominee && draft.opcNominee.name) {
    const nominee = draft.opcNominee;
    return [
      {
        companyRegistrationId,
        fullName: cleanStr(nominee.name, "Nominee Director"),
        panNumber: /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(nominee.pan || "")
          ? nominee.pan
          : "ABCDE1234F",
        dateOfBirth: formatToIsoDate(nominee.dob || "1990-01-01"),
        designation: "Nominee Director",
        emailAddress: cleanStr(nominee.email, "nominee@finsolz.in"),
        mobileNumber: /^[0-9]{10}$/.test(nominee.phone || "")
          ? nominee.phone
          : "9876543210",
        din: (nominee as any).din || undefined,
        relationship: nominee.relationship ? nominee.relationship.trim() : undefined,
        aadhaarNumber: /^[0-9]{12}$/.test(nominee.aadhaar || "") ? nominee.aadhaar : undefined,
      },
    ];
  }

  if (directors.length === 0) {
    directors = [
      {
        id: "dir-1",
        name: "Director One",
        pan: "ABCDE1234F",
        email: "director@finsolz.in",
        phone: "9876543210",
        dob: "1990-01-01",
        designation: "Director",
      },
    ];
  }

  return directors.map((d: any) => ({
    companyRegistrationId,
    fullName: cleanStr(d.name || d.fullName, "Director One"),
    panNumber: /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(d.pan || d.panNumber || "")
      ? d.pan || d.panNumber
      : "ABCDE1234F",
    dateOfBirth: formatToIsoDate(d.dob || d.dateOfBirth),
    designation: cleanStr(d.designation, "Director"),
    emailAddress: cleanStr(d.email || d.emailAddress, "director@finsolz.in"),
    mobileNumber: /^[0-9]{10}$/.test(d.phone || d.mobileNumber || "")
      ? d.phone || d.mobileNumber
      : "9876543210",
    din: d.din || undefined,
    aadhaarNumber: /^[0-9]{12}$/.test(d.aadhaar || "") ? d.aadhaar : undefined,
  }));
};

export const mapDraftToCapitalDto = (
  draft: CompanyRegistrationDraft,
  companyRegistrationId: string,
  promoterIds: string[],
) => {
  const company = draft.company;
  const faceValue = Number(company?.faceValuePerShare) || 10;
  const authCapital = Number(company?.authorizedCapital) || 100000;
  const totalAuthShares = faceValue > 0 ? Math.floor(authCapital / faceValue) : 10000;
  const directors = draft.directors || [];

  const shareholdingPattern = promoterIds.map((pId, idx) => {
    const dir = directors[idx];
    const allocShares = Number(dir?.numberOfShares) > 0
      ? Number(dir.numberOfShares)
      : Math.floor(totalAuthShares / (promoterIds.length || 1));
    const amt = allocShares * faceValue;

    return {
      promoterDirectorId: pId,
      allocatedShares: allocShares > 0 ? allocShares : 1,
      amount: amt > 0 ? amt : faceValue,
    };
  });

  const subscribedCapital = shareholdingPattern.reduce((sum, p) => sum + p.amount, 0);

  return {
    companyRegistrationId,
    authorisedCapital: authCapital,
    faceValuePerShare: faceValue,
    authorisedShares: totalAuthShares,
    subscribedCapital: subscribedCapital > 0 ? subscribedCapital : authCapital,
    shareholdingPattern,
  };
};

export const companyRegistrationApiService = {
  createRegistration: async (draft: CompanyRegistrationDraft) => {
    const payload = mapDraftToCompanyDetailsDto(draft);
    return fetchApi(`${getBaseUrl()}/company-registration/register`, "POST", payload);
  },

  updateRegistration: async (
    companyRegistrationId: string,
    draft: CompanyRegistrationDraft,
  ) => {
    const payload = mapDraftToCompanyDetailsDto(draft, companyRegistrationId);
    return fetchApi(
      `${getBaseUrl()}/company-registration/${companyRegistrationId}`,
      "PUT",
      payload,
    );
  },

  saveRegisteredOffice: async (
    companyRegistrationId: string,
    draft: CompanyRegistrationDraft,
  ) => {
    const payload = mapDraftToOfficeDto(draft, companyRegistrationId);
    return fetchApi(
      `${getBaseUrl()}/registered-office-details/register`,
      "POST",
      payload,
    );
  },

  updateRegisteredOffice: async (
    registeredOfficeId: string,
    draft: CompanyRegistrationDraft,
    companyRegistrationId: string,
  ) => {
    const payload = mapDraftToOfficeDto(draft, companyRegistrationId, registeredOfficeId);
    return fetchApi(
      `${getBaseUrl()}/registered-office-details/${registeredOfficeId}`,
      "PUT",
      payload,
    );
  },

  savePromoters: async (
    companyRegistrationId: string,
    draft: CompanyRegistrationDraft,
  ) => {
    const payload = mapDraftToPromotersDto(draft, companyRegistrationId);
    return fetchApi(
      `${getBaseUrl()}/promoter-director-details/register`,
      "POST",
      payload,
    );
  },

  getPromoters: async (companyRegistrationId: string): Promise<any[]> => {
    try {
      const res = await fetchApi(
        `${getBaseUrl()}/company-registration/${companyRegistrationId}/promoters`,
        "GET",
      );
      return typeof res === "string" ? JSON.parse(res) : res;
    } catch {
      return [];
    }
  },

  saveShareholdingCapital: async (
    companyRegistrationId: string,
    draft: CompanyRegistrationDraft,
    promoterIds: string[],
  ) => {
    const payload = mapDraftToCapitalDto(draft, companyRegistrationId, promoterIds);
    return fetchApi(
      `${getBaseUrl()}/register`,
      "POST",
      payload,
    );
  },

  uploadDocuments: async (
    companyRegistrationId: string,
    files: Record<string, { uri: string; name: string }>,
  ) => {
    const formData = new FormData();
    formData.append("companyRegistrationId", companyRegistrationId);

    for (const [fieldName, file] of Object.entries(files)) {
      if (file?.uri) {
        try {
          const res = await fetch(file.uri);
          const rawBlob = await res.blob();
          const cleanName = file.name || `${fieldName}.pdf`;
          const ext = cleanName.split(".").pop()?.toLowerCase();
          const mime =
            ext === "png"
              ? "image/png"
              : ext === "jpg" || ext === "jpeg"
                ? "image/jpeg"
                : "application/pdf";
          const blob = rawBlob.type && rawBlob.type !== "application/octet-stream"
            ? rawBlob
            : rawBlob.slice(0, rawBlob.size, mime);
          formData.append(fieldName, blob, cleanName);
        } catch (blobErr) {
          console.warn(`Failed to convert ${fieldName} to blob:`, blobErr);
          try {
            const expoFile = new ExpoFile(file.uri);
            formData.append(fieldName, expoFile as any);
          } catch {
            const cleanName = file.name || `${fieldName}.pdf`;
            const ext = cleanName.split(".").pop()?.toLowerCase();
            const mime =
              ext === "png"
                ? "image/png"
                : ext === "jpg" || ext === "jpeg"
                  ? "image/jpeg"
                  : "application/pdf";
            formData.append(fieldName, {
              uri: file.uri,
              name: cleanName,
              type: mime,
            } as any);
          }
        }
      }
    }

    return fetchApi(
      `${getBaseUrl()}/documents-kyc-checklist/register`,
      "POST",
      formData,
      true,
    );
  },

  submitRegistration: async (companyRegistrationId: string) => {
    return fetchApi(
      `${getBaseUrl()}/company-registration/${companyRegistrationId}`,
      "POST",
      {},
    );
  },
};

export default companyRegistrationApiService;
