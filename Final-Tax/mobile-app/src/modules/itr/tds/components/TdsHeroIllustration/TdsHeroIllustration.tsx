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
} from "react-native-svg";
import { styles } from "./TdsHeroIllustration.styles";

export const TdsHeroIllustration: React.FC = () => {
  return (
    <View style={styles.container}>
      <Svg width={135} height={135} viewBox="0 0 135 135" fill="none">
      <Defs>
        <LinearGradient id="walletGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FB923C" />
          <Stop offset="100%" stopColor="#EA580C" />
        </LinearGradient>
        <LinearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FCD34D" />
          <Stop offset="100%" stopColor="#F59E0B" />
        </LinearGradient>
        <LinearGradient id="rupeeCircleGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#60A5FA" />
          <Stop offset="100%" stopColor="#2563EB" />
        </LinearGradient>
      </Defs>

      {/* Sparkles */}
      <Path d="M115 15L116 19L120 20L116 21L115 25L114 21L110 20L114 19Z" fill="#FBBF24" />
      <Path d="M12 35L13 38L16 39L13 40L12 43L11 40L8 39L11 38Z" fill="#FBBF24" />
      <Circle cx={124} cy={60} r={2} fill="#FBBF24" />

      {/* Background Document Paper */}
      <G transform="rotate(4, 75, 45)">
        <Rect
          x={35}
          y={10}
          width={72}
          height={92}
          rx={8}
          fill="#F8FAFC"
          stroke="#E2E8F0"
          strokeWidth={1.5}
        />
        {/* Document Header lines */}
        <Rect x={45} y={22} width={28} height={4} rx={2} fill="#94A3B8" />
        <Rect x={45} y={30} width={45} height={3} rx={1.5} fill="#CBD5E1" />
        <Rect x={45} y={37} width={38} height={3} rx={1.5} fill="#CBD5E1" />

        {/* Small badge on document */}
        <Circle cx={88} cy={24} r={6} fill="#DCFCE7" />
        <Path d="M85 24L87 26L91 22" stroke="#16A34A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </G>

      {/* Blue Rupee Circular Badge (Floating) */}
      <G transform="translate(18, 55)">
        <Circle cx={18} cy={18} r={18} fill="url(#rupeeCircleGrad)" />
        <Path
          d="M12 11h12 M12 14.5h11 M12 11v14 M12 11h5c3.8 0 5.8 1.4 5.8 3.5s-2 3.5-5.8 3.5H12 M16 18l7 7"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>

      {/* Orange Wallet in Foreground */}
      {/* Wallet Shadow */}
      <Rect
        x={50}
        y={66}
        width={70}
        height={48}
        rx={12}
        fill="#000000"
        opacity={0.15}
      />
      {/* Wallet Body */}
      <Rect
        x={48}
        y={62}
        width={70}
        height={48}
        rx={12}
        fill="url(#walletGrad)"
      />
      {/* Wallet flap & clasp */}
      <Path
        d="M58 74H116V78C116 82 112 84 108 84H66C62 84 58 82 58 78V74Z"
        fill="#C2410C"
        opacity={0.3}
      />
      <Circle cx={106} cy={86} r={4.5} fill="#FED7AA" />
      <Circle cx={106} cy={86} r={2.5} fill="#FFFFFF" />

      {/* Golden Coins Stack at Base */}
      {/* Coin 1 */}
      <G transform="translate(38, 92)">
        <Rect x={0} y={6} width={26} height={6} rx={3} fill="#D97706" />
        <Rect x={0} y={0} width={26} height={6} rx={3} fill="url(#coinGrad)" />
      </G>
      {/* Coin 2 */}
      <G transform="translate(38, 98)">
        <Rect x={0} y={6} width={26} height={6} rx={3} fill="#D97706" />
        <Rect x={0} y={0} width={26} height={6} rx={3} fill="url(#coinGrad)" />
      </G>
      {/* Coin 3 */}
      <G transform="translate(38, 104)">
        <Rect x={0} y={6} width={26} height={6} rx={3} fill="#D97706" />
        <Rect x={0} y={0} width={26} height={6} rx={3} fill="url(#coinGrad)" />
      </G>
      </Svg>
    </View>
  );
};
