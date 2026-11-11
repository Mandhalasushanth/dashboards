import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { SharedValue } from "react-native-reanimated";

const SCENE_W = 112;
const SCENE_H = 104;

const WALLET_SIZE = 62;
const WALLET_TOP = 40;

const COIN = 24;
const CYCLE = 1900;

interface CoinProps {
  clock: SharedValue<number>;
  offset: number;
  x: number;
  accent: string;
}

function Coin({ clock, offset, x, accent }: CoinProps) {
  const style = useAnimatedStyle(() => {
    const t = (clock.value + offset) % 1;

    const translateY = interpolate(
      t,
      [0, 0.16, 0.3, 0.42, 0.52],
      [-52, -34, -14, 10, 32],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      t,
      [0, 0.04, 0.4, 0.5, 0.52, 1],
      [0, 1, 1, 0.35, 0, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(t, [0, 0.4, 0.52], [0.9, 1, 0.78], Extrapolation.CLAMP);
    const rotate = interpolate(t, [0, 0.52], [-14, 12], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ translateY }, { scale }, { rotate: `${rotate}deg` }],
    };
  });

  return (
    <Animated.View style={[styles.coinWrap, { left: x }, style]}>
      <View style={[styles.coin, { borderColor: accent }]}>
        <Text style={[styles.coinGlyph, { color: accent }]}>₹</Text>
      </View>
    </Animated.View>
  );
}

interface SparkleProps {
  beat: SharedValue<number>;
  dx: number;
  dy: number;
  size: number;
  delay: number;
}

function Sparkle({ beat, dx, dy, size, delay }: SparkleProps) {
  const style = useAnimatedStyle(() => {
    const t = (beat.value + delay) % 1;
    const opacity = interpolate(t, [0, 0.06, 0.3, 0.5], [0, 1, 0.7, 0], Extrapolation.CLAMP);
    const scale = interpolate(t, [0, 0.12, 0.5], [0.2, 1, 0.3], Extrapolation.CLAMP);
    const translateY = interpolate(t, [0, 0.5], [0, dy], Extrapolation.CLAMP);
    const translateX = interpolate(t, [0, 0.5], [0, dx], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateX }, { translateY }, { scale }] };
  });

  return (
    <Animated.View
      style={[styles.sparkle, { width: size, height: size, borderRadius: size / 2 }, style]}
    />
  );
}

export interface SavingsJarAnimationProps {
  accent?: string;
  walletColor?: string;
  scale?: number;
}

export function SavingsJarAnimation({
  accent = "#F97316",
  walletColor = "#FFFFFF",
  scale = 1,
}: SavingsJarAnimationProps) {
  const clock = useSharedValue(0);
  const beat = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    clock.value = withRepeat(
      withTiming(1, { duration: CYCLE, easing: Easing.linear }),
      -1,
      false
    );
    beat.value = withRepeat(
      withTiming(1, { duration: CYCLE / 2, easing: Easing.linear }),
      -1,
      false
    );
    glow.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [clock, beat, glow]);

  const walletStyle = useAnimatedStyle(() => {
    const t = beat.value;
    const scaleY = interpolate(
      t,
      [0, 0.06, 0.2, 0.36, 1],
      [1, 0.9, 1.05, 1, 1],
      Extrapolation.CLAMP
    );
    const scaleX = interpolate(
      t,
      [0, 0.06, 0.2, 0.36, 1],
      [1, 1.07, 0.97, 1, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      t,
      [0, 0.06, 0.2, 0.36, 1],
      [0, 3, -1, 0, 0],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }, { scaleX }, { scaleY }] };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0.1, 0.22]),
    transform: [{ scale: interpolate(glow.value, [0, 1], [0.92, 1.08]) }],
  }));

  const shadowStyle = useAnimatedStyle(() => {
    const t = beat.value;
    return {
      transform: [{ scaleX: interpolate(t, [0, 0.06, 0.36, 1], [1, 1.12, 1, 1], Extrapolation.CLAMP) }],
      opacity: interpolate(t, [0, 0.06, 0.36, 1], [0.22, 0.3, 0.22, 0.22], Extrapolation.CLAMP),
    };
  });

  return (
    <View
      style={[
        styles.scene,
        scale !== 1 && {
          transform: [{ scale }],
          marginVertical: (-SCENE_H * (1 - scale)) / 2,
          marginHorizontal: (-SCENE_W * (1 - scale)) / 2,
        },
      ]}
      pointerEvents="none"
    >
      <Animated.View style={[styles.glow, glowStyle]} />

      <Coin clock={clock} offset={0} x={SCENE_W / 2 - COIN / 2 - 13} accent={accent} />
      <Coin clock={clock} offset={0.5} x={SCENE_W / 2 - COIN / 2 + 11} accent={accent} />

      <Animated.View style={[styles.groundShadow, shadowStyle]} />

      <Animated.View style={[styles.walletWrap, walletStyle]}>
        <Ionicons name="wallet" size={WALLET_SIZE} color={walletColor} />
      </Animated.View>

      <View style={styles.sparkleAnchor}>
        <Sparkle beat={beat} dx={-17} dy={-14} size={5} delay={0} />
        <Sparkle beat={beat} dx={4} dy={-19} size={6} delay={0.06} />
        <Sparkle beat={beat} dx={18} dy={-12} size={4} delay={0.12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: SCENE_W,
    height: SCENE_H,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    left: SCENE_W / 2 - 40,
    top: WALLET_TOP - 12,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
  },
  walletWrap: {
    position: "absolute",
    left: SCENE_W / 2 - WALLET_SIZE / 2,
    top: WALLET_TOP,
    width: WALLET_SIZE,
    height: WALLET_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  groundShadow: {
    position: "absolute",
    left: SCENE_W / 2 - 30,
    top: SCENE_H - 12,
    width: 60,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#000000",
  },
  coinWrap: {
    position: "absolute",
    top: WALLET_TOP + 4,
    width: COIN,
    height: COIN,
  },
  coin: {
    width: COIN,
    height: COIN,
    borderRadius: COIN / 2,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  coinGlyph: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: -1,
  },
  sparkleAnchor: {
    position: "absolute",
    left: SCENE_W / 2,
    top: WALLET_TOP + 2,
    width: 0,
    height: 0,
    alignItems: "center",
  },
  sparkle: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
  },
});

export default SavingsJarAnimation;
