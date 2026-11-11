import React from "react";
import { View, Image } from "react-native";
import { landingStyles } from "./landing.styles";

export function HeroSection() {
  return (
    <View style={landingStyles.heroContainer}>
      <Image
        source={require("../../../assets/images/finsolz-welcome.png")}
        style={landingStyles.heroImage}
        resizeMode="cover"
        accessibilityLabel="Financial advisor and customer collaborating"
      />
    </View>
  );
}

export default HeroSection;
