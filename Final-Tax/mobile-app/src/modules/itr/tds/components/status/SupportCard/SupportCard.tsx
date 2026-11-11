import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./SupportCard.styles";

interface SupportCardProps {
  onContactExecutive?: () => void;
  onContactSupport?: () => void;
}

export const SupportCard: React.FC<SupportCardProps> = ({
  onContactExecutive,
  onContactSupport,
}) => {
  const router = useRouter();

  const handleExecutive = () => {
    if (onContactExecutive) {
      onContactExecutive();
    } else {
      router.push("/chat/support" as any);
    }
  };

  const handleSupport = () => {
    if (onContactSupport) {
      onContactSupport();
    } else {
      router.push("/chat/support" as any);
    }
  };

  return (
    <View style={styles.card}>
      {/* Left Info */}
      <View style={styles.leftGroup}>
        <View style={styles.iconCircle}>
          <Ionicons name="headset-outline" size={20} color="#0B1F3A" />
        </View>

        <View style={styles.textGroup}>
          <Text style={styles.title}>Need Help?</Text>
          <Text style={styles.subtitle}>
            Contact your assigned Tax Executive or reach our support team for assistance.
          </Text>
        </View>
      </View>

      {/* Right Buttons */}
      <View style={styles.buttonsColumn}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleExecutive}
          style={styles.executiveButton}
        >
          <Ionicons name="person-outline" size={14} color="#FFFFFF" />
          <Text style={styles.executiveText}>Contact Executive</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSupport}
          style={styles.supportButton}
        >
          <Ionicons name="headset-outline" size={14} color="#F97316" />
          <Text style={styles.supportText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
