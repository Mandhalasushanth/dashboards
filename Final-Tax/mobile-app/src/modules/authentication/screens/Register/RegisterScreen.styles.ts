/**
 * Screen: Create Profile / Register Styles
 * Module-owned styles.
 * Preserves all styling keys with zero functional regression.
 */

import { StyleSheet } from "react-native";
import { formStyles } from "./RegisterScreen.form.styles";
import { modalStyles } from "./RegisterScreen.modal.styles";
import { aadhaarOtpStyles } from "./RegisterScreen.otp.styles";

export { formStyles, modalStyles, aadhaarOtpStyles };

export const styles = StyleSheet.create({
  ...formStyles,
  ...modalStyles,
  ...aadhaarOtpStyles,
});

export default styles;
