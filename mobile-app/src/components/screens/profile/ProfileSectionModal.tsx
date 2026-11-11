import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "@/styles/app/(main)/profile.styles";
import type { Application } from "@/types/domain";
import { ProfileModalHeader } from "./ProfileModalHeader";

export type ProfileModalType = "gst" | "itr" | "loans";

interface ProfileSectionModalProps {
  visible: boolean;
  onClose: () => void;
  colors: any;
  modalType: ProfileModalType | null;
  applications: Application[];
}

interface ModalConfig {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  emptyTitle: string;
  emptySubtitle: string;
  ctaText: string;
  ctaRoute: string;
  filter: (app: Application) => boolean;
}

const CONFIGS: Record<ProfileModalType, ModalConfig> = {
  gst: {
    title: "GST Details",
    icon: "receipt-outline",
    iconColor: "#7C3AED",
    iconBg: "#F1ECFE",
    emptyTitle: "No GST Applications Yet",
    emptySubtitle:
      "GST registration details, return filing records, and compliance summaries will be available here once you apply for GST services or connect your GSTIN.",
    ctaText: "Apply for GST Registration",
    ctaRoute: "/service/gst",
    filter: (app) =>
      (app.category || "").toUpperCase() === "GST" ||
      (app.serviceId || "").toLowerCase().startsWith("gst"),
  },
  itr: {
    title: "ITR History",
    icon: "reader-outline",
    iconColor: "#EA580C",
    iconBg: "#FEF0E6",
    emptyTitle: "No ITR Filings Yet",
    emptySubtitle:
      "Your Income Tax Return history, filed returns, and acknowledgment receipts will appear here once you file your taxes.",
    ctaText: "File ITR Now",
    ctaRoute: "/service/itr",
    filter: (app) => {
      const cat = (app.category || "").toUpperCase();
      const sid = (app.serviceId || "").toLowerCase();
      return (
        cat === "ITR" ||
        [
          "itr-filing",
          "tds-refund",
          "previous-year-itr",
          "revised-itr",
          "tax-notice-assistance",
        ].includes(sid)
      );
    },
  },
  loans: {
    title: "Loan History",
    icon: "business-outline",
    iconColor: "#2563EB",
    iconBg: "#EAF1FE",
    emptyTitle: "No Loan Applications Yet",
    emptySubtitle:
      "Your applied loan products, sanction letters, and application progression will appear here once you apply for a loan.",
    ctaText: "Explore Loan Products",
    ctaRoute: "/service/loans",
    filter: (app) =>
      (app.category || "").toUpperCase() === "LOANS" ||
      (app.serviceId || "").toLowerCase().startsWith("loan"),
  },
};

export function ProfileSectionModal({
  visible,
  onClose,
  colors,
  modalType,
  applications,
}: ProfileSectionModalProps) {
  const router = useRouter();

  if (!modalType || !CONFIGS[modalType]) return null;

  const config = CONFIGS[modalType];
  const matchingApps = applications.filter(config.filter);

  const handleCta = () => {
    onClose();
    router.push(config.ctaRoute as any);
  };

  const handleViewApp = () => {
    onClose();
    router.push("/(main)/applications");
  };

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
            title={config.title}
            icon={config.icon}
            iconColor={config.iconColor}
            iconBg={config.iconBg}
            onClose={onClose}
            colors={colors}
          />

          {matchingApps.length === 0 ? (
            <View style={styles.incompleteModalBox}>
              <View
                style={[
                  styles.incompleteIconCircle,
                  { backgroundColor: config.iconBg },
                ]}
              >
                <Ionicons
                  name={config.icon}
                  size={32}
                  color={config.iconColor}
                />
              </View>
              <Text style={[styles.incompleteTitle, { color: colors.text }]}>
                {config.emptyTitle}
              </Text>
              <Text
                style={[
                  styles.incompleteSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                {config.emptySubtitle}
              </Text>

              <View style={styles.personalActions}>
                <TouchableOpacity
                  style={[
                    styles.completeActionBtn,
                    { backgroundColor: colors.orange },
                  ]}
                  onPress={handleCta}
                >
                  <Text style={styles.completeActionBtnText}>
                    {config.ctaText}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.modalScrollArea}
                showsVerticalScrollIndicator={false}
              >
                {matchingApps.map((app) => (
                  <View
                    key={app.id}
                    style={[
                      styles.incompleteCard,
                      styles.appItemCard,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.incompleteRow}>
                      <Text
                        style={[styles.infoKey, styles.flexOne, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {app.serviceName || config.title}
                      </Text>
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>{app.status}</Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.appSubText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Application #{app.id} • {app.createdAt || "Submitted"}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.personalActions}>
                <TouchableOpacity
                  style={[
                    styles.completeActionBtn,
                    { backgroundColor: colors.orange },
                  ]}
                  onPress={handleViewApp}
                >
                  <Text style={styles.completeActionBtnText}>
                    View in Applications
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
