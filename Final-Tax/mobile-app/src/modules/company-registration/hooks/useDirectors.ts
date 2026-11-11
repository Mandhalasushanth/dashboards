import { useCompanyRegistrationStore } from "../store/companyRegistrationSlice";
import type { DirectorInfo, PartnerInfo } from "../types/director.types";

export function useDirectors() {
  const { draft, addDirector, removeDirector, addPartner, removePartner } =
    useCompanyRegistrationStore();

  return {
    directors: draft.directors,
    partners: draft.partners,
    addDirector,
    removeDirector,
    addPartner,
    removePartner,
  };
}

export default useDirectors;
