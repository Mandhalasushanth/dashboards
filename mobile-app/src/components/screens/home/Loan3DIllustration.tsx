import React from "react";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Path,
  Text as SvgText,
  G,
} from "react-native-svg";

interface Loan3DIllustrationProps {
  width?: number;
  height?: number;
}

export function Loan3DIllustration({
  width = 124,
  height = 124,
}: Loan3DIllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 120" fill="none">
      <Defs>
        {/* Backdrop Circular Glow */}
        <RadialGradient id="circleGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.45" />
          <Stop offset="70" stopColor="#1E40AF" stopOpacity="0.25" />
          <Stop offset="100%" stopColor="#1E40AF" stopOpacity="0" />
        </RadialGradient>

        {/* 3D Document Gradient */}
        <LinearGradient id="docGrad" x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="0.85" stopColor="#F1F5F9" />
          <Stop offset="1" stopColor="#CBD5E1" />
        </LinearGradient>

        {/* Golden Coin Gradient */}
        <LinearGradient id="goldCoinGrad" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#FDE68A" />
          <Stop offset="0.3" stopColor="#F59E0B" />
          <Stop offset="0.75" stopColor="#D97706" />
          <Stop offset="1" stopColor="#B45309" />
        </LinearGradient>

        {/* Golden Coin Bevel Rim */}
        <LinearGradient id="coinRimGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FEF3C7" />
          <Stop offset="0.5" stopColor="#F59E0B" />
          <Stop offset="1" stopColor="#78350F" />
        </LinearGradient>
      </Defs>

      {/* Layered Backdrop Circles */}
      <Circle cx="66" cy="56" r="46" fill="url(#circleGlow)" />
      <Circle cx="66" cy="56" r="34" fill="rgba(30, 64, 175, 0.35)" />

      {/* 3D Loan Document */}
      <G transform="rotate(-6 52 50)">
        {/* Document Shadow */}
        <Rect
          x="26"
          y="18"
          width="48"
          height="66"
          rx="7"
          fill="rgba(0, 0, 0, 0.22)"
        />
        {/* Document Body */}
        <Rect
          x="24"
          y="15"
          width="48"
          height="66"
          rx="7"
          fill="url(#docGrad)"
        />
        {/* "LOAN" Text Header */}
        <SvgText
          x="48"
          y="30"
          fontSize="10"
          fontWeight="900"
          fill="#1D4ED8"
          textAnchor="middle"
          letterSpacing="0.8"
        >
          LOAN
        </SvgText>
        {/* Document Blue Content Lines */}
        <Rect x="30" y="38" width="36" height="3" rx="1.5" fill="#93C5FD" />
        <Rect x="30" y="45" width="28" height="3" rx="1.5" fill="#BFDBFE" />
        <Rect x="30" y="52" width="34" height="3" rx="1.5" fill="#BFDBFE" />
        <Rect x="30" y="59" width="22" height="3" rx="1.5" fill="#BFDBFE" />

        {/* Bottom Curled Corner */}
        <Path
          d="M 24 75 Q 48 81 72 75 L 72 81 Q 48 85 24 81 Z"
          fill="#94A3B8"
          opacity={0.4}
        />
      </G>

      {/* Golden Rupee 3D Coin in Foreground */}
      <G>
        {/* Coin Drop Shadow */}
        <Circle cx="76" cy="74" r="23" fill="rgba(0, 0, 0, 0.28)" />

        {/* Outer Coin Rim */}
        <Circle cx="75" cy="72" r="23" fill="url(#coinRimGrad)" />

        {/* Inner Coin Surface */}
        <Circle cx="75" cy="72" r="19.5" fill="url(#goldCoinGrad)" />

        {/* Embossed Rupee Symbol (₹) */}
        <SvgText
          x="75"
          y="80.5"
          fontSize="22"
          fontWeight="900"
          fill="#78350F"
          textAnchor="middle"
        >
          ₹
        </SvgText>
      </G>

      {/* Sparkle Rays in Top Right */}
      <Path
        d="M 96 18 Q 97 22 101 23 Q 97 24 96 28 Q 95 24 91 23 Q 95 22 96 18 Z"
        fill="#FBBF24"
      />
      <Path
        d="M 106 28 Q 106.5 30.5 109 31 Q 106.5 31.5 106 34 Q 105.5 31.5 103 31 Q 105.5 30.5 106 28 Z"
        fill="#FDE68A"
      />
    </Svg>
  );
}
