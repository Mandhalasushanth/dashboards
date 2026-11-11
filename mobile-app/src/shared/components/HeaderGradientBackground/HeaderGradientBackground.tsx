/**
 * HeaderGradientBackground
 * Shared deep navy gradient header background with ambient warm lighting flare
 * and abstract curved wave lines matching the Home screen header theme.
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
} from "react-native-svg";

export const HEADER_GRADIENT_COLORS = ["#061D3D", "#082B59", "#0B3475"] as const;

export function HeaderGradientBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={HEADER_GRADIENT_COLORS}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id="headerBlueGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#38BDF8" stopOpacity="0.22" />
            <Stop offset="0.6" stopColor="#1E40AF" stopOpacity="0.1" />
            <Stop offset="1" stopColor="#0B3475" stopOpacity="0" />
          </SvgLinearGradient>
          <RadialGradient id="headerAmberGlow" cx="90%" cy="15%" r="60%">
            <Stop offset="0" stopColor="#FF791B" stopOpacity="0.35" />
            <Stop offset="0.7" stopColor="#FF791B" stopOpacity="0.06" />
            <Stop offset="1" stopColor="#082B59" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient lighting flare on top right */}
        <Circle cx="390" cy="20" r="150" fill="url(#headerAmberGlow)" />

        {/* Sweeping abstract curved wave lines */}
        <Path
          d="M 160 -10 C 240 30, 320 90, 420 170 L 420 -10 Z"
          fill="url(#headerBlueGlow)"
        />
        <Path
          d="M 210 -10 C 280 50, 360 120, 420 220 L 420 -10 Z"
          fill="rgba(56, 189, 248, 0.08)"
        />
      </Svg>
    </View>
  );
}
