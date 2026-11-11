import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { LoanKycVerificationStatus } from "../../types/loanKyc.types";
import { styles } from "./KycStatusBanner.styles";

interface KycStatusBannerProps {
  status: LoanKycVerificationStatus;
  isProfilePrefilled?: boolean;
}

export const KycStatusBanner: React.FC<KycStatusBannerProps> = ({
  status,
  isProfilePrefilled,
}) => {
  const isVerified = status === "verified";
  const isPending = status === "pending";

  const getContainerStyle = () => {
    if (isVerified) return styles.verifiedContainer;
    if (isPending) return styles.pendingContainer;
    return styles.notConnectedContainer;
  };

  const getIconBoxStyle = () => {
    if (isVerified) return styles.verifiedIconBox;
    if (isPending) return styles.pendingIconBox;
    return styles.notConnectedIconBox;
  };

  const getTagStyle = () => {
    if (isVerified) return styles.verifiedTag;
    if (isPending) return styles.pendingTag;
    return styles.notConnectedTag;
  };

  const getStatusLabel = () => {
    if (isVerified) return "Verified ✓";
    if (isPending) return "Verification Pending";
    return "Provider Not Connected";
  };

  const getTitle = () => {
    if (isVerified) return "Identity Verified";
    return "Customer Verification";
  };

  const getDescription = () => {
    if (isVerified) {
      return "Identity verified by accredited KYC provider.";
    }
    if (isProfilePrefilled) {
      return "Details pre-filled from your profile for review. Official KYC verification through an approved provider is required by lenders.";
    }
    return "Enter your legal KYC details. Real-time verification requires an active KYC provider connection.";
  };

  return (
    <View style={[styles.container, getContainerStyle()]}>
      <View style={[styles.iconBox, getIconBoxStyle()]}>
        <Ionicons
          name={isVerified ? "shield-checkmark" : "shield-outline"}
          size={20}
          color={isVerified ? "#15803D" : isPending ? "#0369A1" : "#475569"}
        />
      </View>
      <View style={styles.textBox}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={[styles.statusTag, getTagStyle()]}>
            {getStatusLabel()}
          </Text>
        </View>
        <Text style={styles.description}>{getDescription()}</Text>
      </View>
    </View>
  );
};

export default KycStatusBanner;

