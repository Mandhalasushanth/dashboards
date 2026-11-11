import React from "react";
import { View, Text } from "react-native";
import { landingStyles } from "./landing.styles";

const SERVICES = [
  "GST Registration",
  "ITR Filing",
  "Business Loans",
  "Compliance",
] as const;

export function ServicePills() {
  return (
    <View style={landingStyles.pillsContainer}>
      {SERVICES.map((service) => (
        <View key={service} style={landingStyles.pill}>
          <Text style={landingStyles.pillText}>{service}</Text>
        </View>
      ))}
    </View>
  );
}

export default ServicePills;
