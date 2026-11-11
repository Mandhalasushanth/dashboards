import type { CompanyRegistrationDraft } from '../types/registration.types';

export const registrationSchema = {
  isReadyForSubmission(draft: CompanyRegistrationDraft): boolean {
    return Boolean(draft.company.proposedName1 && (draft.directors.length > 0 || draft.partners.length > 0));
  },
};
