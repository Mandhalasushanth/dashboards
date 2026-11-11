import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles, ACCEPTED_PROOFS } from "./GstAcceptedProofs.styles";

interface GstAcceptedProofsProps {
  isProofsExpanded: boolean;
  setIsProofsExpanded: (val: boolean) => void;
}

export function GstAcceptedProofs({ isProofsExpanded, setIsProofsExpanded }: GstAcceptedProofsProps) {
  return (
    <View style={styles.acceptedProofsCard}>
      <View style={styles.acceptedProofsHeader}>
        <Ionicons
          name="information-circle"
          size={20}
          color={BrandColors.PRIMARY_ORANGE}
        />
        <Text style={styles.acceptedProofsTitle}>Accepted proofs</Text>
      </View>
      <View style={styles.acceptedProofList}>
        {(isProofsExpanded
          ? ACCEPTED_PROOFS
          : ACCEPTED_PROOFS.slice(0, 3)
        ).map((proofText, idx) => (
          <View key={idx} style={styles.acceptedProofItem}>
            <Text style={styles.acceptedProofBullet}>•</Text>
            <Text style={styles.acceptedProofText}>{proofText}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.viewMoreBtn}
        activeOpacity={0.7}
        onPress={() => setIsProofsExpanded(!isProofsExpanded)}
      >
        <Text style={styles.viewMoreText}>
          {isProofsExpanded ? "View Less" : "View More"}
        </Text>
        <Ionicons
          name={isProofsExpanded ? "chevron-up" : "chevron-down"}
          size={14}
          color={BrandColors.PRIMARY_ORANGE}
        />
      </TouchableOpacity>
    </View>
  );
}
