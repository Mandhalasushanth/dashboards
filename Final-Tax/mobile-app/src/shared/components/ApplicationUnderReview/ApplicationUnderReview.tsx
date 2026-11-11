import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { DEFAULT_NEXT_STEPS, STATUS_LABELS, formatSubmittedAt } from "./config";
import { ReviewIllustration } from "./ReviewIllustration";
import type {
  ApplicationSummaryRow,
  ApplicationUnderReviewProps,
} from "./types";
import { styles } from "./ApplicationUnderReview.styles";

/**
 * The standard final screen after any application is submitted. It confirms submission
 * and shows "Under Review" only; it never presents an approval or eligibility result.
 */
export const ApplicationUnderReview: React.FC<ApplicationUnderReviewProps> = ({
  applicationType,
  applicationReference,
  submittedAt,
  summary = [],
  status = "under_review",
  nextSteps = DEFAULT_NEXT_STEPS,
  referenceNote,
  homeLabel = "Go to Home",
  onGoHome,
  supportAction,
}) => {
  const insets = useSafeAreaInsets();

  const rows: ApplicationSummaryRow[] = [
    { label: "Application Reference", value: applicationReference ?? "—", icon: "document-text-outline" },
    { label: "Application Type", value: applicationType, icon: "layers-outline" },
    ...summary,
    { label: "Submitted On", value: formatSubmittedAt(submittedAt), icon: "calendar-outline" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <ReviewIllustration />
          <Text style={styles.title} accessibilityRole="header">
            Application Submitted
          </Text>
          <Text style={styles.headline}>Your application is under review</Text>
          <Text style={styles.body}>
            Our agent will review your application and come in contact with you soon.
          </Text>
        </View>

        <View style={styles.card}>
          {rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons
                  name={row.icon ?? "ellipse-outline"}
                  size={18}
                  color={BrandColors.PRIMARY_BLUE}
                />
              </View>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="time-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
            </View>
            <Text style={styles.rowLabel}>Current Status</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{STATUS_LABELS[status]}</Text>
            </View>
          </View>
          {referenceNote ? <Text style={styles.note}>{referenceNote}</Text> : null}
        </View>

        <View style={styles.nextCard}>
          <Text style={styles.nextTitle}>What happens next?</Text>
          {nextSteps.map((text, index) => (
            <View key={text} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={onGoHome}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={homeLabel}
        >
          <Text style={styles.homeButtonText}>{homeLabel}</Text>
          <Ionicons name="arrow-forward" size={18} color={BrandColors.WHITE} />
        </TouchableOpacity>
        {supportAction ? (
          <TouchableOpacity
            style={styles.supportButton}
            onPress={supportAction.onPress}
            accessibilityRole="button"
            accessibilityLabel={supportAction.label ?? "Contact Support"}
          >
            <Ionicons name="headset-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
            <Text style={styles.supportText}>{supportAction.label ?? "Contact Support"}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default ApplicationUnderReview;
