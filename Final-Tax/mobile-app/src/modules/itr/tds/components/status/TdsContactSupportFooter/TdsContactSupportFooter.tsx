import React from "react";
import { View, Text, TouchableOpacity, Alert, Linking, ViewStyle } from "react-native";
import { styles } from "./TdsContactSupportFooter.styles";

interface TdsContactSupportFooterProps {
  style?: ViewStyle;
  onPressSupport?: () => void;
}

export const TdsContactSupportFooter: React.FC<TdsContactSupportFooterProps> = ({
  style,
  onPressSupport,
}) => {
  const handleSupportPress = () => {
    if (onPressSupport) {
      onPressSupport();
      return;
    }

    Alert.alert(
      "Contact Support",
      "Our dedicated CA assistance team is available 9 AM - 8 PM IST.",
      [
        {
          text: "Call Support",
          onPress: () => Linking.openURL("tel:9347074726").catch(() => { }),
        },
        {
          text: "WhatsApp Chat",
          onPress: () =>
            Linking.openURL("https://wa.me/919347074726").catch(() => { }),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSupportPress}
        style={styles.supportButton}
      >
        <Text style={styles.supportButtonText}>Contact Support</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TdsContactSupportFooter;
