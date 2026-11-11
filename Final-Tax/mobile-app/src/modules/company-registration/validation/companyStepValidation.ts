import type { CompanyRegistrationDraft } from "../types/registration.types";
import { companySchema, isOpcCompanyType, getMinRequiredPromoters } from "./companySchema";
import { directorSchema, validateOpcNominee } from "./directorSchema";

export interface StepValidationResult {
  valid: boolean;
  /** Errors to show; may be empty even when `valid` is false. */
  fieldErrors: Record<string, string>;
}

/** Rules that must pass before the registration wizard leaves `step`. */
export const validateRegistrationStep = (
  step: number,
  draft: CompanyRegistrationDraft
): StepValidationResult => {
  // Step 0: Company Type Selection
  if (step === 0) {
    if (!draft.company.companyType) {
      return { valid: false, fieldErrors: { companyType: 'Please select a Company Type to proceed.' } };
    }
  }

  // Step 1: Combined Details (Classification, Activity, Names)
  if (step === 1) {
    const { valid, fieldErrors } = companySchema.validateStep(1, draft.company);
    if (!valid) {
      return { valid: false, fieldErrors };
    }
  }

  // Step 2: Registered Office Details
  if (step === 2) {
    const { valid, fieldErrors } = companySchema.validateStep(2, draft.company);
    if (!valid) {
      return { valid: false, fieldErrors };
    }
  }

  // Step 3: Promoter / Director Details
  if (step === 3) {
    const isOpc = isOpcCompanyType(draft.company.companyType);

    if (isOpc) {
      const { valid: nomineeValid, fieldErrors: nomineeErrors } = validateOpcNominee(draft.opcNominee);
      if (!nomineeValid) {
        return { valid: false, fieldErrors: nomineeErrors };
      }
      return { valid: true, fieldErrors: {} };
    }

    const minRequired = getMinRequiredPromoters(draft.company.companyType);
    if (draft.directors.length < minRequired) {
      return {
        valid: false,
        fieldErrors: {
          directorsCount: `At least ${minRequired} promoter(s) are required for ${draft.company.companyType || 'incorporation'}.`,
        },
      };
    }

    const combinedErrors: Record<string, string> = {};
    let hasError = false;
    draft.directors.forEach((dir, idx) => {
      const { valid, fieldErrors } = directorSchema.validateDirector(dir, idx);
      if (!valid) {
        hasError = true;
        Object.assign(combinedErrors, fieldErrors);
      }
    });

    if (hasError) {
      return { valid: false, fieldErrors: combinedErrors };
    }
  }

  // Step 4: Shareholding & Capital
  if (step === 4) {
    const { valid, fieldErrors } = companySchema.validateStep(4, draft.company);
    const combinedErrors: Record<string, string> = { ...fieldErrors };
    const totalSubscribed = draft.directors.reduce((sum, d) => sum + (Number(d.numberOfShares) || 0), 0);
    const faceValue = Number(draft.company.faceValuePerShare) || 0;
    const authCapital = Number(draft.company.authorizedCapital) || 0;
    const totalAuthShares = faceValue > 0 ? Math.floor(authCapital / faceValue) : 0;
    const isOpc = isOpcCompanyType(draft.company.companyType);

    if (!isOpc) {
      if (totalSubscribed <= 0) {
        combinedErrors.shareholdingTotal = 'Please allocate shares to at least one promoter/shareholder.';
      } else if (totalAuthShares > 0 && totalSubscribed > totalAuthShares) {
        combinedErrors.shareholdingTotal = 'Total subscribed shares cannot exceed total authorised shares of the company.';
      }

      draft.directors.forEach((d) => {
        if (d.numberOfShares !== undefined && d.numberOfShares !== null) {
          const str = String(d.numberOfShares).trim();
          if (str !== '' && (!/^\d+$/.test(str) || Number(str) < 0)) {
            combinedErrors[`dir_${d.id}_shares`] = 'Please remove unsupported special characters.';
          }
        }
      });
    }

    if (!valid || Object.keys(combinedErrors).length > 0) {
      return { valid: false, fieldErrors: combinedErrors };
    }
  }

  // Step 5: Documents & KYC Checklist
  if (step === 5) {
    const docErrors: Record<string, string> = {};
    const requiredIds = ['doc-pan', 'doc-aadhaar', 'doc-address', 'doc-utility'];
    requiredIds.forEach((id) => {
      const doc = draft.documents.find((d) => d.id === id);
      if (!doc || doc.status !== 'Uploaded') {
        docErrors[id] = 'Mandatory document upload required.';
      }
    });
    const isNocRequired = draft.company.premisesOwnership === 'Rented' || draft.company.premisesOwnership === 'Leased';
    if (isNocRequired) {
      const nocDoc = draft.documents.find((d) => d.id === 'doc-noc');
      if (!nocDoc || nocDoc.status !== 'Uploaded') {
        docErrors['doc-noc'] = 'Owner NOC is required for Rented/Leased premises.';
      }
    }
    if (Object.keys(docErrors).length > 0) {
      return { valid: false, fieldErrors: docErrors };
    }
  }

  // Step 6: Linked Registrations
  if (step === 6) {
    const { valid, fieldErrors } = companySchema.validateStep(6, draft.company, draft.linkedRegistrations);
    if (!valid) {
      return { valid: false, fieldErrors };
    }
  }

  return { valid: true, fieldErrors: {} };
};
