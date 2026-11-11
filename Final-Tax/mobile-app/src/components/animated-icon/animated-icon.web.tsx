import React, { useEffect } from "react";
import { View, Image } from "react-native";
import { styles } from "./animated-icon.web.styles";

export interface AnimatedSplashOverlayProps {
  onFinish?: () => void;
}

export function AnimatedSplashOverlay({ onFinish }: AnimatedSplashOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish?.();
    }, 2650);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return null;
}

export function AnimatedIcon() {
  return (
    <View style={styles.iconFallbackContainer}>
      <Image
        style={styles.iconFallbackImage}
        source={require("../../../assets/images/logo.png")}
        resizeMode="contain"
      />
    </View>
  );
}
