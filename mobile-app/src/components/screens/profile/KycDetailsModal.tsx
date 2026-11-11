import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "@/styles/app/(main)/profile.styles";
import { ProfileModalHeader } from "./ProfileModalHeader";

interface KycDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  colors: any;
  activePan?: string;
  activeAadhaar?: string;
  kycVerified: boolean;
  isProfileComplete?: boolean;
  onCompleteProfile?: () => void;
}

export function KycDetailsModal({
  visible,
  onClose,
  colors,
  activePan,
  activeAadhaar,
  kycVerified,
  isProfileComplete = true,
  onCompleteProfile,
}: KycDetailsModalProps) {
  const hasKycDetails = Boolean(
    isProfileComplete && (activePan || activeAadhaar)
  );

  const panDisplay = activePan
    ? `${activePan.substring(0, 5)}****${activePan.substring(9)}`
    : "Not provided";

  const aadhaarDisplay = activeAadhaar
    ? `**** **** ${activeAadhaar.substring(
        Math.max(0, activeAadhaar.length - 4)
      )}`
    : "Not provided";

  const statusColor = kycVerified ? colors.success : colors.orange;
  const statusIcon = kycVerified ? "checkmark-circle" : "time";
  // The icon already shows the tick, so the label does not repeat it.
  const statusLabel = kycVerified ? "Verified" : "Pending";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <ProfileModalHeader
            title="KYC Details"
            icon="shield-checkmark-outline"
            iconColor={colors.success}
            iconBg="#E6F5F0"
            onClose={onClose}
            colors={colors}
          />

          {!hasKycDetails ? (
            <View style={styles.incompleteModalBox}>
              <View style={[styles.incompleteIconCircle, { backgroundColor: "#FEF0E6" }]}>
                <Ionicons name="shield-checkmark-outline" size={32} color={colors.orange} />
              </View>
              <Text style={[styles.incompleteTitle, { color: colors.text }]}>
                Identity Verification (KYC)
              </Text>
              <Text style={[styles.incompleteSubtitle, { color: colors.textSecondary }]}>
                Identity verification becomes available during profile setup. Complete your profile to verify your PAN & Aadhaar details and unlock all Finsolz services.
              </Text>

              <View
                style={[
                  styles.incompleteCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.incompleteRow}>
                  <Text style={[styles.infoKey, { color: colors.textSecondary }]}>PAN Verification</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Pending Setup</Text>
                  </View>
                </View>
                <View style={styles.incompleteRow}>
                  <Text style={[styles.infoKey, { color: colors.textSecondary }]}>Aadhaar Identity</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Pending Setup</Text>
                  </View>
                </View>
                <View style={styles.incompleteRow}>
                  <Text style={[styles.infoKey, { color: colors.textSecondary }]}>KYC Status</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Setup Required</Text>
                  </View>
                </View>
              </View>

              <View style={styles.personalActions}>
                <TouchableOpacity
                  style={[
                    styles.completeActionBtn,
                    { backgroundColor: colors.orange },
                  ]}
                  onPress={onCompleteProfile}
                >
                  <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.completeActionBtnText}>Complete Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.modalBody}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoKey, { color: colors.textSecondary }]}>
                    PAN Number
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {panDisplay}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoKey, { color: colors.textSecondary }]}>
                    Aadhaar Number
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {aadhaarDisplay}
                  </Text>
                </View>

                <View style={[styles.infoRow, styles.infoRowLast]}>
                  <Text style={[styles.infoKey, { color: colors.textSecondary }]}>
                    Verification Status
                  </Text>
                  <View style={styles.statusLabelContainer}>
                    <Ionicons name={statusIcon} size={16} color={statusColor} />
                    <Text
                      style={[
                        styles.statusLabelText,
                        { color: statusColor },
                      ]}
                    >
                      {statusLabel}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.modalNote, { color: colors.textSecondary }]}>
                Status reflects the PAN and Aadhaar documents uploaded against your
                applications.
              </Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
