import type {
  LoanDocumentRequirement,
} from "../../types/loanReview.types";
import {
  ALL_UPLOAD_SOURCES,
  DEFAULT_ALLOWED_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "../../constants/loanDocuments";
import type { VehicleLoanFormData } from "../types/vehicleLoan.types";

export const VEHICLE_DOCUMENT_IDS = {
  newVehicleQuotation: "vehicle_new_quotation",
  bookingReceipt: "vehicle_booking_receipt",
  usedVehicleRegistration: "vehicle_used_rc_copy",
} as const;

function requirement(
  id: string,
  icon: LoanDocumentRequirement["icon"],
  name: string,
  description: string,
  isMandatory: boolean
): LoanDocumentRequirement {
  return {
    id,
    icon,
    name,
    description,
    isMandatory,
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    maxSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
    uploadSources: ALL_UPLOAD_SOURCES,
  };
}

/** Resolves only the documents established for the selected vehicle condition. */
export function getVehicleLoanDocuments(
  formData: VehicleLoanFormData
): LoanDocumentRequirement[] {
  if (formData.vehicleCondition === "New Vehicle") {
    return [
      requirement(
        VEHICLE_DOCUMENT_IDS.newVehicleQuotation,
        "document-text-outline",
        "Vehicle Quotation / Proforma Invoice",
        "Quotation or proforma invoice for the selected new vehicle",
        true
      ),
      requirement(
        VEHICLE_DOCUMENT_IDS.bookingReceipt,
        "receipt-outline",
        "Booking Receipt",
        "Vehicle booking receipt, if available",
        false
      ),
    ];
  }

  if (formData.vehicleCondition === "Used Vehicle") {
    return [
      requirement(
        VEHICLE_DOCUMENT_IDS.usedVehicleRegistration,
        "car-outline",
        "RC Copy",
        "Registration certificate for the used vehicle",
        true
      ),
    ];
  }

  return [];
}
