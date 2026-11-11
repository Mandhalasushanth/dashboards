import { uploadAmendmentWithFile } from "./gstAmendment/gstAmendmentTransport";
import { legalNameAmendmentApi } from "./gstAmendment/legalNameAmendmentApi";
import { principalPlaceAmendmentApi } from "./gstAmendment/principalPlaceAmendmentApi";
import { additionalPlaceAmendmentApi } from "./gstAmendment/additionalPlaceAmendmentApi";
import { bankAccountAmendmentApi } from "./gstAmendment/bankAccountAmendmentApi";
import { contactAmendmentApi } from "./gstAmendment/contactAmendmentApi";
import { signatoryAmendmentApi } from "./gstAmendment/signatoryAmendmentApi";
import { gstAmendmentRecordApi } from "./gstAmendment/gstAmendmentRecordApi";

/** GST amendment endpoints, grouped by section in ./gstAmendment. */
export const gstAmendmentApi = {
  uploadAmendmentWithFile,
  ...legalNameAmendmentApi,
  ...principalPlaceAmendmentApi,
  ...additionalPlaceAmendmentApi,
  ...bankAccountAmendmentApi,
  ...contactAmendmentApi,
  ...signatoryAmendmentApi,
  ...gstAmendmentRecordApi,
};
