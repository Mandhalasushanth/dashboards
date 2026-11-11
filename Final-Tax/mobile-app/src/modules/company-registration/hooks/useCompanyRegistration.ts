import { useCompanyRegistrationStore } from "../store/companyRegistrationSlice";
import { companyRegistrationService } from "../services/companyRegistrationService";

export function useCompanyRegistration() {
  const {
    draft,
    setCompanyType,
    updateCompanyDetails,
    addDirector,
    removeDirector,
    addPartner,
    removePartner,
    setStep,
    resetRegistration,
  } = useCompanyRegistrationStore();

  const companyTypes = companyRegistrationService.getCompanyTypes();

  return {
    draft,
    companyTypes,
    setCompanyType,
    updateCompanyDetails,
    addDirector,
    removeDirector,
    addPartner,
    removePartner,
    setStep,
    resetRegistration,
  };
}

export default useCompanyRegistration;
