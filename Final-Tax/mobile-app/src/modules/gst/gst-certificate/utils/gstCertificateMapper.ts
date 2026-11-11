import { CertificateDetails, CertificateRequestParams } from "../types/gstCertificateTypes";

const STATE_CODE_MAP: Record<string, string> = {
  "07": "Delhi",
  "24": "Gujarat",
  "27": "Maharashtra",
  "29": "Karnataka",
  "33": "Tamil Nadu",
  "36": "Telangana",
  "19": "West Bengal",
  "09": "Uttar Pradesh",
  "06": "Haryana",
  "08": "Rajasthan",
  "32": "Kerala",
  "37": "Andhra Pradesh",
};

export function mapRegistrationDataToCertificate(
  targetGstin: string,
  params: CertificateRequestParams,
  applications: any[],
  gstDraft: any,
  registrationDraft: any,
  customer: any
): CertificateDetails {
  const clean = targetGstin.trim().toUpperCase();
  const app =
    applications.find((a) => a.formData?.gstin?.toUpperCase() === clean) ||
    applications.find((a) => a.serviceId === "gst-registration");
  const fd = app?.formData || {};
  const dBiz = gstDraft?.businessData || {};
  const sDraft = (registrationDraft || {}) as any;
  const cust = customer || ({} as any);

  const state =
    params.state ||
    fd.state ||
    dBiz.state ||
    sDraft.state ||
    cust.state ||
    STATE_CODE_MAP[clean.slice(0, 2)] ||
    "";

  const legalName =
    params.legalName ||
    fd.legalName ||
    dBiz.legalName ||
    sDraft.legalName ||
    cust.businessName ||
    cust.name ||
    (clean ? `ENTERPRISE ${clean}` : "TAXPAYER ENTERPRISE");

  const tradeName =
    params.tradeName ||
    fd.businessName ||
    dBiz.businessName ||
    sDraft.businessName ||
    legalName;

  const constitution =
    params.constitution ||
    fd.businessType ||
    dBiz.businessType ||
    sDraft.constitution ||
    "Private Limited Company";

  const addrParts = [
    fd.businessAddress || dBiz.businessAddress,
    fd.city || dBiz.city,
    fd.district || dBiz.district,
    state,
    fd.pinCode || dBiz.pinCode,
  ].filter(Boolean);

  const address =
    params.address ||
    (addrParts.length > 0
      ? addrParts.join(", ")
      : cust.address || (state ? `Registered Office, ${state}` : "Registered Business Address"));

  const sigName =
    params.director ||
    params.signatoryName ||
    fd.signatoryName ||
    dBiz.signatoryName ||
    cust.name ||
    "";
  const sigDesignation =
    fd.signatoryDesignation || dBiz.signatoryDesignation || "Director";
  const signatories = sigName
    ? [{ name: String(sigName).toUpperCase(), designation: sigDesignation }]
    : [];

  const additionalPlaces = (
    fd.additionalAddress
      ? [fd.additionalAddress]
      : dBiz.additionalAddress
      ? [dBiz.additionalAddress]
      : []
  ).filter(Boolean);

  const natureStr = fd.natureOfBusiness || dBiz.natureOfBusiness || "";
  const activities = natureStr
    ? natureStr.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return {
    gstin: clean,
    legalName: String(legalName).toUpperCase(),
    tradeName: String(tradeName).toUpperCase(),
    constitution,
    address,
    liabilityDate: fd.businessStartDate || dBiz.businessStartDate || "",
    validityFrom: fd.businessStartDate || dBiz.businessStartDate || "01/04/2026",
    regType: fd.compositionScheme?.includes("composition") ? "Composition" : "Regular",
    regDate: fd.appliedDate || todayStr,
    issueDate: todayStr,
    additionalPlaces,
    signatories,
    activities,
    state,
  };
}
