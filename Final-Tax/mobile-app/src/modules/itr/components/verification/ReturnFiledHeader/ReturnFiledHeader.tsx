import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./ReturnFiledHeader.styles";

export const ReturnFiledHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Left Celebration Badge with Confetti */}
      <View style={styles.badgeWrapper}>
        <Svg width={90} height={90} viewBox="0 0 90 90" style={styles.confettiSvg}>
          <Rect x={10} y={15} width={4} height={4} rx={1} fill="#F97316" transform="rotate(25, 10, 15)" />
          <Circle cx={22} cy={28} r={2} fill="#0B1F3A" />
          <Rect x={8} y={55} width={4} height={3} rx={1} fill="#16A34A" transform="rotate(-15, 8, 55)" />
          <Circle cx={20} cy={72} r={2} fill="#F97316" />

          <Rect x={76} y={15} width={4} height={4} rx={1} fill="#0B1F3A" transform="rotate(-30, 76, 15)" />
          <Circle cx={68} cy={28} r={2} fill="#16A34A" />
          <Rect x={78} y={55} width={4} height={3} rx={1} fill="#F97316" transform="rotate(20, 78, 55)" />
          <Circle cx={70} cy={72} r={2} fill="#0B1F3A" />
        </Svg>

        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}>
            <Ionicons name="checkmark" size={26} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* Right Text Details */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Your ITR has been filed!</Text>
        <Text style={styles.description}>
          Please e-verify to complete the process. A return that is never e-verified is treated as not filed at all.
        </Text>
      </View>
    </View>
  );
};
