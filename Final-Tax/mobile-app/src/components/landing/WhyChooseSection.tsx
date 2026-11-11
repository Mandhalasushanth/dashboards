import React from "react";
import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import { landingStyles } from "./landing.styles";

function ShieldIcon({ size = 20, color = "#0052FF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ComplianceIcon({ size = 20, color = "#0052FF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.21 13.89L7 21.5l5-3 5 3-1.21-7.61"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 9l1.8 1.8 3.7-3.6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HeadsetIcon({ size = 20, color = "#0052FF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 18v-6a9 9 0 0 1 18 0v6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const BENEFITS = [
  {
    id: "secure",
    Icon: ShieldIcon,
    line1: "Secure &",
    line2: "Trusted",
  },
  {
    id: "compliance",
    Icon: ComplianceIcon,
    line1: "100%",
    line2: "Compliance",
  },
  {
    id: "support",
    Icon: HeadsetIcon,
    line1: "Expert",
    line2: "Support",
  },
];

export function WhyChooseSection() {
  return (
    <View style={landingStyles.whyChooseContainer}>
      {/* Header Divider */}
      <View style={landingStyles.dividerRow}>
        <View style={landingStyles.dividerLine} />
        <Text style={landingStyles.dividerText}>• WHY CHOOSE FINSOLZ? •</Text>
        <View style={landingStyles.dividerLine} />
      </View>

      {/* 3 Benefit Cards */}
      <View style={landingStyles.benefitsRow}>
        {BENEFITS.map(({ id, Icon, line1, line2 }) => (
          <View key={id} style={landingStyles.benefitCard}>
            <Icon size={19} color="#0052FF" />
            <View style={landingStyles.benefitTextWrapper}>
              <Text style={landingStyles.benefitText}>{line1}</Text>
              <Text style={landingStyles.benefitText}>{line2}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default WhyChooseSection;
