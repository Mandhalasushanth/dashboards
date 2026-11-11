import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";

import {
  BRAND,
  PARTICLES,
  styles,
  type ParticleItem,
} from "./animated-icon.styles";

function InwardParticle({ item }: { item: ParticleItem }) {
  const rad = (item.angle * Math.PI) / 180;
  const startX = Math.cos(rad) * item.startDist;
  const startY = Math.sin(rad) * item.startDist;
  const endX = Math.cos(rad) * item.endDist;
  const endY = Math.sin(rad) * item.endDist;

  const transX = useSharedValue(startX);
  const transY = useSharedValue(startY);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Subtly glide radially inward toward the center
    transX.value = withDelay(
      item.delay,
      withTiming(endX, {
        duration: 800,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      })
    );
    transY.value = withDelay(
      item.delay,
      withTiming(endY, {
        duration: 800,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      })
    );
    // Smooth fade in and fade out
    opacity.value = withDelay(
      item.delay,
      withSequence(
        withTiming(0.65, { duration: 320, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 480, easing: Easing.in(Easing.quad) })
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: transX.value },
      { translateY: transY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: item.size,
          height: item.size,
          borderRadius: item.size / 2,
          backgroundColor: item.color,
          shadowColor: item.color,
        },
        animatedStyle,
      ]}
    />
  );
}

export interface AnimatedSplashOverlayProps {
  onFinish?: () => void;
}

export function AnimatedSplashOverlay({ onFinish }: AnimatedSplashOverlayProps) {
  const [visible, setVisible] = useState(true);

  // 1. Logo scale & opacity (0.7x -> 1.0x smooth spring/ease-out)
  const logoScale = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);

  // 2. Soft orange glow behind the logo that blooms and fades away
  const glowScale = useSharedValue(0.75);
  const glowOpacity = useSharedValue(0);

  // 3. Specular light sweep across the orange part of the logo
  const sheenTranslateX = useSharedValue(-200);
  const sheenOpacity = useSharedValue(0);

  // 4. Brand text "FINSOLZ" fade-up
  const titleTranslateY = useSharedValue(16);
  const titleOpacity = useSharedValue(0);

  // 5. Subtitle "FIN SOLUTIONS" fade-up
  const subtitleTranslateY = useSharedValue(14);
  const subtitleOpacity = useSharedValue(0);

  // 6. Seamless blackout transition overlay (120ms-150ms)
  const blackoutOpacity = useSharedValue(0);

  const handleComplete = () => {
    SplashScreen.hideAsync().catch(() => {});
    setVisible(false);
    onFinish?.();
  };

  useEffect(() => {
    // Step 3: Logo zooms in from 0.7x to 1.0x while fading from 0 to 1
    logoScale.value = withTiming(1.0, {
      duration: 800,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    logoOpacity.value = withTiming(1.0, {
      duration: 480,
      easing: Easing.out(Easing.quad),
    });

    // Step 4: Soft orange glow blossoms behind logo, then smoothly fades away
    glowScale.value = withDelay(
      150,
      withTiming(1.2, {
        duration: 900,
        easing: Easing.out(Easing.quad),
      })
    );
    glowOpacity.value = withDelay(
      150,
      withSequence(
        withTiming(0.42, { duration: 380, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 520, easing: Easing.in(Easing.quad) })
      )
    );

    // Step 5: Specular light sweep sheen across logo (700ms - 1300ms)
    sheenOpacity.value = withDelay(
      700,
      withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(450, withTiming(0, { duration: 150 }))
      )
    );
    sheenTranslateX.value = withDelay(
      700,
      withTiming(200, {
        duration: 600,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      })
    );

    // Step 6: "FINSOLZ" fades upward with crisp reveal (~900ms)
    titleTranslateY.value = withDelay(
      900,
      withTiming(0, {
        duration: 550,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      })
    );
    titleOpacity.value = withDelay(
      900,
      withTiming(1.0, {
        duration: 500,
        easing: Easing.out(Easing.quad),
      })
    );

    // Step 7: "FIN SOLUTIONS" appears with small fade and slight upward motion (~1100ms)
    subtitleTranslateY.value = withDelay(
      1100,
      withTiming(0, {
        duration: 500,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      })
    );
    subtitleOpacity.value = withDelay(
      1100,
      withTiming(1.0, {
        duration: 480,
        easing: Easing.out(Easing.quad),
      })
    );

    // Step 8 & 9: Hold completed brand mark for ~1s, then fade smoothly to black for 130ms (~2550ms)
    blackoutOpacity.value = withDelay(
      2550,
      withTiming(
        1.0,
        {
          duration: 130,
          easing: Easing.inOut(Easing.quad),
        },
        (finished) => {
          finished && runOnJS(handleComplete)();
        }
      )
    );

    // Failsafe timer: unconditionally dismiss splash overlay after 2.8s
    const failsafe = setTimeout(() => {
      handleComplete();
    }, 2800);

    return () => clearTimeout(failsafe);
  }, []);

  // Animated Styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const sheenAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: sheenTranslateX.value },
      { rotate: "25deg" },
    ],
    opacity: sheenOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
    opacity: titleOpacity.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: subtitleTranslateY.value }],
    opacity: subtitleOpacity.value,
  }));

  const blackoutAnimatedStyle = useAnimatedStyle(() => ({
    opacity: blackoutOpacity.value,
  }));

  return !visible ? null : (
    <View
      style={styles.splashOverlay}
      onLayout={() => {
        SplashScreen.hideAsync().catch(() => {});
      }}
      pointerEvents="auto"
    >
      {/* 1. Center Anchor Container */}
      <View style={styles.centerContainer}>
        {/* 2. Inward Converging Light Streaks & Particles */}
        <View style={styles.particlesContainer} pointerEvents="none">
          {PARTICLES.map((item) => (
            <InwardParticle key={item.id} item={item} />
          ))}
        </View>

        {/* 3. Soft Orange Glow Behind Logo (fades away completely) */}
        <Animated.View
          style={[styles.softOrangeGlow, glowAnimatedStyle]}
          pointerEvents="none"
        />

        {/* 4. Centered Brand Lockup: TF Logo + FINSOLZ + FIN SOLUTIONS */}
        <View style={styles.mainCluster}>
          {/* Official TF Logo with Specular Light Sweep */}
          <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
            <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.logoImage}
              contentFit="contain"
              priority="high"
            />

            {/* Diagonal Light Sweep Across Logo */}
            <Animated.View
              style={[styles.sheenOverlay, sheenAnimatedStyle]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0)",
                  "rgba(255, 255, 255, 0.08)",
                  "rgba(255, 255, 255, 0.60)",
                  "rgba(255, 255, 255, 0.08)",
                  "rgba(255, 255, 255, 0)",
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </Animated.View>

          {/* Typography Lockup */}
          <View style={styles.typographyContainer}>
            <Animated.View style={titleAnimatedStyle}>
              <Text style={styles.brandTitle}>FINSOLZ</Text>
            </Animated.View>
            <Animated.View style={subtitleAnimatedStyle}>
              <Text style={styles.subtitle}>FIN SOLUTIONS</Text>
            </Animated.View>
          </View>
        </View>
      </View>

      {/* 5. Smooth Fade-to-Black Overlay for Final Transition (120-150ms) */}
      <Animated.View
        style={[styles.blackoutOverlay, blackoutAnimatedStyle]}
        pointerEvents="none"
      />
    </View>
  );
}

// Fallback AnimatedIcon export for component compatibility
export function AnimatedIcon() {
  return (
    <View style={styles.iconFallbackContainer}>
      <Image
        style={styles.iconFallbackImage}
        source={require("../../../assets/images/logo.png")}
        contentFit="contain"
      />
    </View>
  );
}
