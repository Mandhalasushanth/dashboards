import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, getContainerInsetsStyle } from "./StartApplicationButton.styles";

interface StartApplicationButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const StartApplicationButton: React.FC<StartApplicationButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.bottom)]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.button,
          disabled ? styles.disabledButton : styles.enabledButton,
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            disabled ? styles.disabledButtonText : styles.enabledButtonText,
          ]}
        >
          Start Application
        </Text>
      </TouchableOpacity>
    </View>
  );
};
