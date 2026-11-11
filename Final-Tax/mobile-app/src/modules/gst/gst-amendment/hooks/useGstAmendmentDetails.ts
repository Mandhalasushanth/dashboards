import { useState, useEffect } from "react";
import { apiClient } from "@/core/api/apiClient";
import { gstAmendmentApi } from "@/modules/gst/services/gstAmendmentApi";
import { logger } from "@/core/logging/logger";
import { RegisteredDetails } from "../types/gstAmendmentTypes";
import { mergeRegisteredDetails } from "../utils/registeredDetailsMapper";

export function useGstAmendmentDetails(
  targetGstId: string,
  selectedSectionId: string
): RegisteredDetails {
  const [registeredDetails, setRegisteredDetails] = useState<RegisteredDetails>({
    legalBusinessName: "-",
    principalAddress: "-",
    principalCity: "-",
    principalDistrict: "-",
    principalState: "-",
    principalPincode: "-",
    principalProofType: "-",
    additionalAddress: "-",
    additionalCity: "-",
    additionalPincode: "-",
    additionalNatureOfPremises: "-",
    bankName: "-",
    bankAccountNumber: "-",
    ifscCode: "-",
    accountType: "-",
    signatoryName: "-",
    signatoryPan: "-",
    signatoryDesignation: "-",
    signatoryMobile: "-",
    signatoryEmail: "-",
    contactMobile: "-",
    contactEmail: "-",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchAllRegisteredDetails = async () => {
      try {
        const idToFetch = targetGstId || "DEFAULT";

        const [
          businessRes,
          legalRes,
          principalRes,
          additionalRes,
          bankRes,
          signatoryRes,
          contactRes,
        ] = await Promise.allSettled([
          apiClient.get<any>(`/api/v1/gst/business/${idToFetch}`),
          gstAmendmentApi.getExistingLegalName(idToFetch),
          gstAmendmentApi.getExistingPrincipalPlace(idToFetch),
          gstAmendmentApi.getExistingAdditionalPlace(idToFetch),
          gstAmendmentApi.getExistingBankAccount(idToFetch),
          gstAmendmentApi.getExistingSignatory(idToFetch),
          gstAmendmentApi.getExistingContact(idToFetch),
        ]);

        if (!isMounted) return;

        setRegisteredDetails((prev) => {
          return mergeRegisteredDetails(prev, {
            businessRes,
            legalRes,
            principalRes,
            additionalRes,
            bankRes,
            signatoryRes,
            contactRes,
          });
        });
      } catch (err) {
        logger.warn("[useGstAmendmentDetails] Error fetching registered amendment details from database:", { error: err });
      }
    };

    fetchAllRegisteredDetails();

    return () => {
      isMounted = false;
    };
  }, [targetGstId, selectedSectionId]);

  return registeredDetails;
}
