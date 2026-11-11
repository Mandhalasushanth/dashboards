import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { useApplicationStore } from "@/store/applicationStore";
import {
  styles,
  getSuccessHeroStyle,
  getSuccessActionsWrapStyle,
} from "./GstCancellationSuccess.styles";
import { CancellationSubmissionResult } from "../../types/gstCancellationTypes";

interface GstCancellationSuccessProps {
  submissionResult: CancellationSubmissionResult;
  gstin: string;
  cancellationDate: string;
}

export function GstCancellationSuccess({
  submissionResult,
  gstin,
  cancellationDate,
}: GstCancellationSuccessProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/(main)/home");
      return true;
    });
    return () => sub.remove();
  }, [router]);

  const successRows = [
    { k: "Application Type", v: "GST Cancellation" },
    {
      k: "ARN / Reference",
      v: submissionResult.arn,
      isPrimary: true,
    },
    { k: "GSTIN", v: gstin },
    { k: "Submission Date", v: submissionResult.date },
    { k: "Effective Date", v: cancellationDate },
    { k: "Current Status", v: "Submitted", isSuccess: true },
  ];

  return (
    <View style={styles.successContainer}>
      <FocusAwareStatusBar
        barStyle="light-content"
        backgroundColor={BrandColors.PRIMARY_BLUE}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.successScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.successHero, getSuccessHeroStyle(insets.top)]}>
          <View style={styles.successHeroIconBox}>
            <View style={styles.successHeroCheckCircle}>
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.successHeroTitle}>Cancellation Submitted</Text>
          <Text style={styles.successHeroSubtitle}>
            Your application Form REG-16 has been initiated successfully.
          </Text>
        </View>

        <View style={styles.successCard}>
          {successRows.map((row, i) => (
            <React.Fragment key={row.k}>
              {i > 0 && <View style={styles.successDivider} />}
              <View style={styles.successRow}>
                <Text style={styles.successRowKey}>{row.k}</Text>
                <Text
                  style={[
                    styles.successRowVal,
                    Boolean(row.isPrimary) && styles.successRowValPrimary,
                    Boolean(row.isSuccess) && styles.successRowValSuccess,
                  ]}
                >
                  {row.v}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={[styles.successActionsWrap, getSuccessActionsWrapStyle(insets.bottom)]}>
          <TouchableOpacity
            style={styles.successTrackBtn}
            activeOpacity={0.8}
            onPress={() => {
              if (submissionResult.appId) {
                useApplicationStore.getState().setSelectedApplicationId(submissionResult.appId);
                router.push(`/application/${submissionResult.appId}`);
              } else {
                router.push("/(main)/applications");
              }
            }}
          >
            <Text style={styles.successTrackBtnText}>Track Application Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.successHomeBtn}
            activeOpacity={0.8}
            onPress={() => router.replace("/(main)/home")}
          >
            <Text style={styles.successHomeBtnText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
