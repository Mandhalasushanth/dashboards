import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  LoanProgressHeader,
  type LoanProgressHeaderProps,
} from "@/shared/components/LoanProgressHeader";
import { styles } from "./LoanFlowHeader.styles";

interface LoanFlowHeaderProps extends LoanProgressHeaderProps {
  /**
   * Opened from Review → Edit. The back button and step progress are hidden:
   * the screen is a stand-alone edit page that returns to Review when saved.
   */
  isEditMode?: boolean;
}

/**
 * The shared loan progress header, padded with the device's top safe-area inset so it
 * is never hidden under the status bar or Dynamic Island.
 */
export const LoanFlowHeader: React.FC<LoanFlowHeaderProps> = ({
  isEditMode = false,
  ...headerProps
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <LoanProgressHeader
        {...headerProps}
        {...(isEditMode
          ? {
              onBack: undefined,
              hideProgress: true,
              stepLabel: "Editing from Review",
            }
          : null)}
      />
    </View>
  );
};

export default LoanFlowHeader;
