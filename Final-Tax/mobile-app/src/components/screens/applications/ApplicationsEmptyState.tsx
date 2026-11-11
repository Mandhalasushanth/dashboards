import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./ApplicationsEmptyState.styles";
import type { ApplicationEmptyStateDetails } from "@/modules/applications/utils/applicationStatusUtils";

interface ApplicationsEmptyStateProps {
  isProfileCompleted: boolean;
  hasApplications: boolean;
  emptyState: ApplicationEmptyStateDetails;
  onCompleteProfile: () => void;
  onExploreServices: () => void;
  onResetFilter: () => void;
  isDark: boolean;
  colors: {
    text: string;
    textSecondary: string;
  };
  cardBg: string;
  cardBorder: string;
}

export function ApplicationsEmptyState({
  isProfileCompleted,
  hasApplications,
  emptyState,
  onCompleteProfile,
  onExploreServices,
  onResetFilter,
  isDark,
  colors,
  cardBg,
  cardBorder,
}: ApplicationsEmptyStateProps) {
  // 1. Profile Incomplete State
  if (!isProfileCompleted) {
    return (
      <View
        style={[
          styles.emptyCardContainer,
          { backgroundColor: cardBg, borderColor: cardBorder },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="person-circle-outline" size={36} color="#EA580C" />
        </View>
        <Text style={[styles.title, { color: isDark ? colors.text : "#0F172A" }]}>
          Complete Your Profile
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          You haven't submitted any applications yet. Complete your profile first, then apply for the services you need.
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onCompleteProfile}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Complete Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Profile Complete, No Applications (Empty Store)
  if (!hasApplications) {
    return (
      <View
        style={[
          styles.emptyCardContainer,
          { backgroundColor: cardBg, borderColor: cardBorder },
        ]}
      >
        <View style={styles.iconCircleBlue}>
          <Ionicons name="document-text-outline" size={34} color="#0284C7" />
        </View>
        <Text style={[styles.title, { color: isDark ? colors.text : "#0F172A" }]}>
          No Applications Submitted
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          You haven't submitted any applications yet. Start by choosing a service that suits your needs.
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onExploreServices}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Explore Services</Text>
        </TouchableOpacity>
        <Text style={[styles.supportingText, { color: colors.textSecondary }]}>
          Your submitted applications will appear here.
        </Text>
      </View>
    );
  }

  // 3. Applications Exist in Store, but Filtered Out
  return (
    <View
      style={[
        styles.emptyCardContainer,
        { backgroundColor: cardBg, borderColor: cardBorder },
      ]}
    >
      <View style={styles.iconCircleBlue}>
        <Ionicons name="search-outline" size={32} color="#0284C7" />
      </View>
      <Text style={[styles.title, { color: isDark ? colors.text : "#0F172A" }]}>
        {emptyState.title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {emptyState.subtitle}
      </Text>
      {Boolean(emptyState.buttonText) && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onResetFilter}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>{emptyState.buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
