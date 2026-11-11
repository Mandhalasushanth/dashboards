import type { AmendmentFileInput, AmendmentRecord } from "./gstAmendmentApi.types";
import type { AmendmentFormData } from "@/modules/gst/gst-amendment/types/gstAmendmentTypes";
import { legalNameAmendmentApi } from "./legalNameAmendmentApi";
import { principalPlaceAmendmentApi } from "./principalPlaceAmendmentApi";
import { additionalPlaceAmendmentApi } from "./additionalPlaceAmendmentApi";
import { bankAccountAmendmentApi } from "./bankAccountAmendmentApi";
import { contactAmendmentApi } from "./contactAmendmentApi";
import { signatoryAmendmentApi } from "./signatoryAmendmentApi";

/** Amendment form values; older drafts may carry the designation under legacy keys. */
type AmendmentRecordInput = AmendmentFormData & { newDesignation?: string; designation?: string };

/** Section-agnostic save / fetch / update, dispatched by amendment section id. */
export const gstAmendmentRecordApi = {
  saveAmendmentRecord: async (
    sectionId: string,
    targetGstId: string,
    formData: AmendmentRecordInput,
    file: AmendmentFileInput,
  ): Promise<AmendmentRecord> => {
    switch (sectionId) {
      case "legal-name":
        return legalNameAmendmentApi.submitLegalNameAmendment(
          targetGstId,
          formData.newLegalBusinessName,
          file,
        );
      case "principal-place":
        return principalPlaceAmendmentApi.submitPrincipalPlaceAmendment(
          targetGstId,
          formData.newPrincipalAddress,
          formData.newPrincipalCity,
          formData.newPrincipalState,
          formData.newPrincipalPincode,
          file,
          formData.newPrincipalDistrict,
          formData.newPrincipalNatureOfPremises,
        );
      case "additional-place":
        return additionalPlaceAmendmentApi.submitAdditionalPlaceAmendment(
          targetGstId,
          formData.newAdditionalAddress,
          formData.newAdditionalCity,
          formData.newAdditionalPincode,
          formData.newAdditionalNatureOfPremises,
          file,
        );
      case "bank-accounts":
        return bankAccountAmendmentApi.submitBankAccountAmendment(
          targetGstId,
          formData.newBankName,
          formData.newBankAccountNumber,
          formData.newIfscCode,
          formData.newAccountType,
          file,
        );
      case "contact-details":
        return contactAmendmentApi.submitContactAmendment(
          targetGstId,
          formData.newContactMobile,
          formData.newContactEmail,
          file,
        );
      case "authorised-signatories":
        return signatoryAmendmentApi.submitSignatoryAmendment(
          targetGstId,
          formData.newSignatoryName,
          formData.newSignatoryPan,
          file,
          formData.newSignatoryDob,
          formData.newSignatoryDesignation || formData.newDesignation || formData.designation,
          formData.newSignatoryMobile,
          formData.newSignatoryEmail,
        );
      default:
        throw new Error(`Unsupported amendment section: ${sectionId}`);
    }
  },

  getAmendmentRecordById: async (
    sectionId: string,
    id: number | string,
  ): Promise<AmendmentRecord> => {
    switch (sectionId) {
      case "legal-name":
        return legalNameAmendmentApi.getLegalNameAmendmentById(id);
      case "principal-place":
        return principalPlaceAmendmentApi.getPrincipalPlaceAmendmentById(id);
      case "additional-place":
        return additionalPlaceAmendmentApi.getAdditionalPlaceAmendmentById(id);
      case "bank-accounts":
        return bankAccountAmendmentApi.getBankAccountAmendmentById(id);
      case "contact-details":
        return contactAmendmentApi.getContactAmendmentById(id);
      case "authorised-signatories":
        return signatoryAmendmentApi.getSignatoryAmendmentById(id);
      default:
        throw new Error(`Unsupported amendment section: ${sectionId}`);
    }
  },

  updateAmendmentRecord: async (
    sectionId: string,
    id: number | string,
    formData: AmendmentRecordInput,
    file?: AmendmentFileInput,
  ): Promise<AmendmentRecord> => {
    switch (sectionId) {
      case "legal-name":
        return legalNameAmendmentApi.updateLegalNameAmendment(
          id,
          formData.newLegalBusinessName,
          file,
        );
      case "principal-place":
        return principalPlaceAmendmentApi.updatePrincipalPlaceAmendment(
          id,
          formData.newPrincipalAddress,
          formData.newPrincipalCity,
          formData.newPrincipalState,
          formData.newPrincipalPincode,
          file,
          formData.newPrincipalDistrict,
          formData.newPrincipalNatureOfPremises,
        );
      case "additional-place":
        return additionalPlaceAmendmentApi.updateAdditionalPlaceAmendment(
          id,
          formData.newAdditionalAddress,
          formData.newAdditionalCity,
          formData.newAdditionalPincode,
          formData.newAdditionalNatureOfPremises,
          file,
        );
      case "bank-accounts":
        return bankAccountAmendmentApi.updateBankAccountAmendment(
          id,
          formData.newBankName,
          formData.newBankAccountNumber,
          formData.newIfscCode,
          formData.newAccountType,
          file,
        );
      case "contact-details":
        return contactAmendmentApi.updateContactAmendment(
          id,
          formData.newContactMobile,
          formData.newContactEmail,
          file,
        );
      case "authorised-signatories":
        return signatoryAmendmentApi.updateSignatoryAmendment(
          id,
          formData.newSignatoryName,
          formData.newSignatoryPan,
          file,
          formData.newSignatoryDob,
          formData.newSignatoryDesignation || formData.newDesignation || formData.designation,
          formData.newSignatoryMobile,
          formData.newSignatoryEmail,
        );
      default:
        throw new Error(`Unsupported amendment section: ${sectionId}`);
    }
  },

  submitFinalAmendmentRecord: async (
    sectionId: string,
    gstId?: string,
    id?: number | string | null,
    pushToken?: string,
  ): Promise<string> => {
    switch (sectionId) {
      case "legal-name":
        return legalNameAmendmentApi.submitFinalLegalNameAmendment(gstId, id, pushToken);
      case "principal-place":
        return principalPlaceAmendmentApi.submitFinalPrincipalPlaceAmendment(gstId, id, pushToken);
      case "additional-place":
        return additionalPlaceAmendmentApi.submitFinalAdditionalPlaceAmendment(gstId, id, pushToken);
      case "bank-accounts":
        return bankAccountAmendmentApi.submitFinalBankAccountAmendment(gstId, id, pushToken);
      case "contact-details":
        return contactAmendmentApi.submitFinalContactAmendment(gstId, id, pushToken);
      case "authorised-signatories":
        return signatoryAmendmentApi.submitFinalSignatoryAmendment(gstId, id, pushToken);
      default:
        throw new Error(`Unsupported amendment section: ${sectionId}`);
    }
  },
};

