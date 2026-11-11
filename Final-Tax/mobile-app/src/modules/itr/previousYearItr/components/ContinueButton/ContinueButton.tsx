import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { styles } from "./ContinueButton.styles";

interface ContinueButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        disabled ? styles.buttonDisabled : styles.buttonActive,
      ]}
    >
      <Text style={styles.buttonText}>Continue</Text>
    </TouchableOpacity>
  );
};
