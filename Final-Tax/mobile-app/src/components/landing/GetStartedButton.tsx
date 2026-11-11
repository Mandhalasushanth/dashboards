import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { landingStyles } from "./landing.styles";

interface GetStartedButtonProps {
  onPress: () => void;
}

export function GetStartedButton({ onPress }: GetStartedButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={landingStyles.getStartedButton}
      accessibilityRole="button"
      accessibilityLabel="Get Started"
    >
      <Text style={landingStyles.getStartedButtonText}>Get Started</Text>
      <View style={landingStyles.arrowContainer}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 12h14M12 5l7 7-7 7"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </TouchableOpacity>
  );
}

export default GetStartedButton;
