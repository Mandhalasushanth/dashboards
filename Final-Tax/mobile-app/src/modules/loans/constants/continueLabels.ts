/** The one label every loan screen shows when the customer is updating something they completed. */
export const UPDATE_AND_CONTINUE_LABEL = "Update & Continue →";

/**
 * "Update & Continue →" when the screen is being edited from Review or revisited after being
 * completed once; otherwise the screen's own first-visit label.
 */
export const getContinueLabel = (
  isUpdate: boolean,
  firstVisitLabel: string
): string => (isUpdate ? UPDATE_AND_CONTINUE_LABEL : firstVisitLabel);
