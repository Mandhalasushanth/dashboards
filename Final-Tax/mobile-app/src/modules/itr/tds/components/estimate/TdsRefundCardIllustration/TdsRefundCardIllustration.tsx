import React from "react";
import { View } from "react-native";
import Svg, {
  Rect,
  Path,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { styles } from "./TdsRefundCardIllustration.styles";

export const TdsRefundCardIllustration: React.FC = () => {
  return (
    <View style={styles.container}>
      <Svg width={120} height={110} viewBox="0 0 120 110" fill="none">
      <Defs>
        <LinearGradient id="estimateWalletGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FB923C" />
          <Stop offset="100%" stopColor="#EA580C" />
        </LinearGradient>
        <LinearGradient id="estimateCoinGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FCD34D" />
          <Stop offset="100%" stopColor="#F59E0B" />
        </LinearGradient>
      </Defs>

      {/* Sparkles */}
      <Path d="M72 16L73 19L76 20L73 21L72 24L71 21L68 20L71 19Z" fill="#FBBF24" />
      <Path d="M110 50L111 52L113 53L111 54L110 56L109 54L107 53L109 52Z" fill="#FBBF24" />
      <Circle cx={76} cy={38} r={1.5} fill="#FBBF24" />

      {/* Background Document Paper */}
      <G transform="rotate(3, 80, 45)">
        <Rect
          x={46}
          y={8}
          width={64}
          height={82}
          rx={6}
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth={1.5}
        />
        <SvgText
          x={53}
          y={22}
          fontSize={5.8}
          fontWeight="800"
          fill="#0B1F3A"
          letterSpacing={0.3}
        >
          TAX REFUND
        </SvgText>

        {/* Lines */}
        <Rect x={53} y={28} width={42} height={2.5} rx={1.25} fill="#93C5FD" />
        <Rect x={53} y={34} width={36} height={2.5} rx={1.25} fill="#CBD5E1" />
        <Rect x={53} y={40} width={46} height={2.5} rx={1.25} fill="#CBD5E1" />
        <Rect x={53} y={46} width={38} height={2.5} rx={1.25} fill="#CBD5E1" />

        {/* Orange Checkmark Badge on paper */}
        <Circle cx={96} cy={38} r={6} fill="#FFF7ED" stroke="#F97316" strokeWidth={1.5} />
        <Path d="M93.5 38L95.5 40L98.5 36.5" stroke="#F97316" strokeWidth={1.4} strokeLinecap="round" />
      </G>

      {/* Green Cash note protruding from wallet */}
      <Rect
        x={36}
        y={42}
        width={34}
        height={22}
        rx={3}
        fill="#86EFAC"
        stroke="#4ADE80"
        strokeWidth={1}
        transform="rotate(-10, 36, 42)"
      />
      <Circle cx={54} cy={48} r={3} fill="#4ADE80" opacity={0.6} />

      {/* Orange Leather Wallet */}
      <Rect
        x={32}
        y={54}
        width={54}
        height={38}
        rx={8}
        fill="url(#estimateWalletGrad)"
      />
      {/* Wallet flap & clasp */}
      <Path
        d="M32 60H86V64C86 68 82 70 78 70H40C36 70 32 68 32 64V60Z"
        fill="#C2410C"
        opacity={0.3}
      />
      <Circle cx={76} cy={73} r={4} fill="#FED7AA" />
      <Circle cx={76} cy={73} r={2} fill="#FFFFFF" />

      {/* Golden Rupee Coin */}
      <G transform="translate(18, 62)">
        <Circle cx={12} cy={12} r={12} fill="url(#estimateCoinGrad)" />
        <Circle cx={12} cy={12} r={10} stroke="#FDE68A" strokeWidth={1} />
        <SvgText
          x={8}
          y={17}
          fontSize={13}
          fontWeight="bold"
          fill="#78350F"
        >
          ₹
        </SvgText>
      </G>
      </Svg>
    </View>
  );
};
