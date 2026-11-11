import { tdsBankAndIncomeApiService } from "./tdsBankAndIncomeApiService";
import { tdsDocumentsApiService } from "./tdsDocumentsApiService";
import { tdsApplicationApiService } from "./tdsApplicationApiService";

export * from "./tdsApiTypes";

export const tdsApiService = {
  ...tdsBankAndIncomeApiService,
  ...tdsDocumentsApiService,
  ...tdsApplicationApiService,
};

export default tdsApiService;
