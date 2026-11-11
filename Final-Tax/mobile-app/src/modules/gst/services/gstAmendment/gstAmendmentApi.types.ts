/** Supporting proof picked by the user (image or PDF). */
export type AmendmentFileInput = { uri?: string; name?: string } | null | undefined;

/** An amendment record as stored by the backend; `id` is assigned on save. */
export interface AmendmentRecord {
  id?: number | string;
  [field: string]: unknown;
}

/** "Existing details" responses, one per amendment section (all fields optional). */
export interface ExistingLegalNameDto {
  newLegalName?: string;
}

export interface ExistingPrincipalPlaceDto {
  newBusinessAddress?: string;
  newCity?: string;
  newDistrict?: string;
  newState?: string;
  newPinCode?: string;
}

export interface ExistingAdditionalPlaceDto {
  address?: string;
  city?: string;
  pinCode?: string;
  natureOfPremises?: string | number;
}

export interface ExistingBankAccountDto {
  newBankName?: string;
  newBankAccountNumber?: string;
  newIfscCode?: string;
  newAccountType?: string;
}

export interface ExistingSignatoryDto {
  newSignatoryName?: string;
  newSignatoryPan?: string;
  newDesignation?: string;
  newSignatoryMobile?: string;
  newSignatoryEmail?: string;
}

export interface ExistingContactDto {
  newMobileNumber?: string;
  newEmail?: string;
}
