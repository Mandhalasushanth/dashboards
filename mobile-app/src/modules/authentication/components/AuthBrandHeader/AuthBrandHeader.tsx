import React from "react";
import { Text, Image, TouchableOpacity, type StyleProp, type TextStyle } from "react-native";
import { styles } from "./AuthBrandHeader.styles";

interface AuthBrandHeaderProps {
  /** Long-press opens the server configuration modal. */
  onLongPress: () => void;
  /** Theme-dependent text colours from the screen. */
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
}

/** Finsolz logo and wordmark at the top of the authentication screen. */
export function AuthBrandHeader({ onLongPress, titleStyle, subtitleStyle }: AuthBrandHeaderProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onLongPress={onLongPress}
      delayLongPress={500}
      style={styles.header}
    >
      <Image
        source={require("../../../../../assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[styles.brandTitle, titleStyle]}>FINSOLZ</Text>
      <Text style={[styles.brandSub, subtitleStyle]}>FIN SOLUTIONS</Text>
    </TouchableOpacity>
  );
}

export default AuthBrandHeader;
