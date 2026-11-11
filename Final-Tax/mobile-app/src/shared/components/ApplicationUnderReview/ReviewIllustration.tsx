import React, { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./ReviewIllustration.styles";

const LOOP_MS = 2600;

/**
 * A reviewer reading a document with a magnifying glass. The motion is a gentle loop
 * (document floats, magnifier sweeps, badge pulses) and stops when the device asks for
 * reduced motion.
 */
export const ReviewIllustration: React.FC = () => {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (cancelled || reduceMotion) return;
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(progress, {
              toValue: 1,
              duration: LOOP_MS,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(progress, {
              toValue: 0,
              duration: LOOP_MS,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        loop.start();
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [progress]);

  const documentFloat = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });
  const magnifierX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -22],
  });
  const magnifierY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 14],
  });
  const personSway = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["-2deg", "2deg"],
  });
  const badgeScale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.92, 1.08, 0.92],
  });
  const sparkleOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <View
      style={styles.stage}
      accessible
      accessibilityLabel="An agent reviewing your application documents"
      accessibilityRole="image"
    >
      <View style={styles.backdrop} />
      <Animated.View
        style={[styles.person, { transform: [{ rotate: personSway }] }]}
      >
        <Ionicons name="person" size={92} color={BrandColors.PRIMARY_BLUE} />
      </Animated.View>
      <Animated.View
        style={[styles.document, { transform: [{ translateY: documentFloat }] }]}
      >
        <Ionicons name="document-text" size={64} color={BrandColors.PRIMARY_BLUE_ACCENT} />
      </Animated.View>
      <Animated.View
        style={[
          styles.magnifier,
          { transform: [{ translateX: magnifierX }, { translateY: magnifierY }] },
        ]}
      >
        <Ionicons name="search" size={56} color={BrandColors.PRIMARY_ORANGE} />
      </Animated.View>
      <Animated.View style={[styles.badge, { transform: [{ scale: badgeScale }] }]}>
        <Ionicons name="checkmark-circle" size={30} color={BrandColors.PRIMARY_ORANGE} />
      </Animated.View>
      <Animated.View style={[styles.sparkle, { opacity: sparkleOpacity }]}>
        <Ionicons name="sparkles" size={18} color={BrandColors.PRIMARY_ORANGE} />
      </Animated.View>
    </View>
  );
};

export default ReviewIllustration;
