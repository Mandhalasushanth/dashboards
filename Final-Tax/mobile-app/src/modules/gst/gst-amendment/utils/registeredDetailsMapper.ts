import type { RegisteredDetails } from "../types/gstAmendmentTypes";
import type {
  ExistingLegalNameDto,
  ExistingPrincipalPlaceDto,
  ExistingAdditionalPlaceDto,
  ExistingBankAccountDto,
  ExistingSignatoryDto,
  ExistingContactDto,
} from "@/modules/gst/services/gstAmendment/gstAmendmentApi.types";

/** GST business profile as returned by `/api/v1/gst/business/:id`. */
export interface RegisteredBusinessSource {
  legalName?: string;
  tradeName?: string;
  businessAddress?: string;
  city?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  natureOfBusiness?: string | number;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  accountType?: string;
  signatoryName?: string;
  authorisedSignatory?: string;
  accountHolderName?: string;
  signatoryPan?: string;
  designation?: string;
  signatoryMobile?: string;
  signatoryEmail?: string;
}

/** Settled results of the seven "existing details" requests, in request order. */
export interface RegisteredDetailsSources {
  businessRes: PromiseSettledResult<RegisteredBusinessSource | null | undefined>;
  legalRes: PromiseSettledResult<ExistingLegalNameDto | null | undefined>;
  principalRes: PromiseSettledResult<ExistingPrincipalPlaceDto | null | undefined>;
  additionalRes: PromiseSettledResult<ExistingAdditionalPlaceDto | ExistingAdditionalPlaceDto[] | null | undefined>;
  bankRes: PromiseSettledResult<ExistingBankAccountDto | null | undefined>;
  signatoryRes: PromiseSettledResult<ExistingSignatoryDto | null | undefined>;
  contactRes: PromiseSettledResult<ExistingContactDto | null | undefined>;
}

/**
 * Overlays registered business data, then any approved amendments, onto the current details.
 * Later sources win; empty fields never overwrite.
 */
export const mergeRegisteredDetails = (
  prev: RegisteredDetails,
  { businessRes, legalRes, principalRes, additionalRes, bankRes, signatoryRes, contactRes }: RegisteredDetailsSources
): RegisteredDetails => {
  const updated = { ...prev };

  if (businessRes.status === "fulfilled" && businessRes.value) {
    const b = businessRes.value;
    if (b.legalName) updated.legalBusinessName = b.legalName;
    else if (b.tradeName) updated.legalBusinessName = b.tradeName;

    if (b.businessAddress) updated.principalAddress = b.businessAddress;
    if (b.city) updated.principalCity = b.city;
    if (b.district) updated.principalDistrict = b.district;
    if (b.state) updated.principalState = b.state;
    if (b.pinCode) updated.principalPincode = b.pinCode;

    if (b.businessAddress) updated.additionalAddress = b.businessAddress;
    if (b.city) updated.additionalCity = b.city;
    if (b.pinCode) updated.additionalPincode = b.pinCode;
    if (b.natureOfBusiness) updated.additionalNatureOfPremises = String(b.natureOfBusiness);

    if (b.bankName) updated.bankName = b.bankName;
    if (b.bankAccountNumber) updated.bankAccountNumber = b.bankAccountNumber;
    if (b.ifscCode) updated.ifscCode = b.ifscCode;
    if (b.accountType) updated.accountType = b.accountType;

    if (b.signatoryName) updated.signatoryName = b.signatoryName;
    else if (b.authorisedSignatory) updated.signatoryName = b.authorisedSignatory;
    else if (b.accountHolderName) updated.signatoryName = b.accountHolderName;

    if (b.signatoryPan) updated.signatoryPan = b.signatoryPan;
    if (b.designation) updated.signatoryDesignation = b.designation;
    if (b.signatoryMobile) {
      updated.signatoryMobile = b.signatoryMobile;
      updated.contactMobile = b.signatoryMobile;
    }
    if (b.signatoryEmail) {
      updated.signatoryEmail = b.signatoryEmail;
      updated.contactEmail = b.signatoryEmail;
    }
  }

  if (legalRes.status === "fulfilled" && legalRes.value?.newLegalName) {
    updated.legalBusinessName = legalRes.value.newLegalName;
  }

  if (principalRes.status === "fulfilled" && principalRes.value) {
    const p = principalRes.value;
    if (p.newBusinessAddress) updated.principalAddress = p.newBusinessAddress;
    if (p.newCity) updated.principalCity = p.newCity;
    if (p.newDistrict) updated.principalDistrict = p.newDistrict;
    if (p.newState) updated.principalState = p.newState;
    if (p.newPinCode) updated.principalPincode = p.newPinCode;
  }

  if (additionalRes.status === "fulfilled" && additionalRes.value) {
    const addList = Array.isArray(additionalRes.value) ? additionalRes.value : [additionalRes.value];
    if (addList.length > 0 && addList[0]) {
      const a = addList[0];
      if (a.address) updated.additionalAddress = a.address;
      if (a.city) updated.additionalCity = a.city;
      if (a.pinCode) updated.additionalPincode = a.pinCode;
      if (a.natureOfPremises) updated.additionalNatureOfPremises = String(a.natureOfPremises);
    }
  }

  if (bankRes.status === "fulfilled" && bankRes.value) {
    const bk = bankRes.value;
    if (bk.newBankName) updated.bankName = bk.newBankName;
    if (bk.newBankAccountNumber) updated.bankAccountNumber = bk.newBankAccountNumber;
    if (bk.newIfscCode) updated.ifscCode = bk.newIfscCode;
    if (bk.newAccountType) updated.accountType = bk.newAccountType;
  }

  if (signatoryRes.status === "fulfilled" && signatoryRes.value) {
    const s = signatoryRes.value;
    if (s.newSignatoryName) updated.signatoryName = s.newSignatoryName;
    if (s.newSignatoryPan) updated.signatoryPan = s.newSignatoryPan;
    if (s.newDesignation) updated.signatoryDesignation = s.newDesignation;
    if (s.newSignatoryMobile) updated.signatoryMobile = s.newSignatoryMobile;
    if (s.newSignatoryEmail) updated.signatoryEmail = s.newSignatoryEmail;
  }

  if (contactRes.status === "fulfilled" && contactRes.value) {
    const c = contactRes.value;
    if (c.newMobileNumber) updated.contactMobile = c.newMobileNumber;
    if (c.newEmail) updated.contactEmail = c.newEmail;
  }

  return updated;
};
