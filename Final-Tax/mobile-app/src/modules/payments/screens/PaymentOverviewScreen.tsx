import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  BackHandler,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useTheme } from "@/hooks/use-theme";
import { useApplicationStore } from "@/store/applicationStore";
import { SCREEN_BOTTOM_PADDING } from "@/shared/components/ScreenLayout";
import { styles, getPaymentHeaderThemedStyle } from "./PaymentOverviewScreen.styles";
import { HeaderGradientBackground } from "@/shared/components/HeaderGradientBackground/HeaderGradientBackground";
import type { Application } from "@/types/domain";

export function PaymentOverviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useTheme();

  const applications = useApplicationStore((s) => s.applications);
  const loadApplications = useApplicationStore((s) => s.loadApplications);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(main)/home");
        return true;
      };

      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, [router])
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadApplications();
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [loadApplications]);

  // Calculations
  const paidApps = applications.filter((app) => app.paymentStatus === "Paid");
  const pendingApps = applications.filter(
    (app) => app.paymentStatus === "Pending" && Number(app.paymentAmount) > 0
  );

  const totalPaid = paidApps.reduce(
    (sum, app) => sum + (Number(app.paymentAmount) || 0),
    0
  );
  const pendingAmount = pendingApps.reduce(
    (sum, app) => sum + (Number(app.paymentAmount) || 0),
    0
  );
  const totalTransactions = paidApps.length + pendingApps.length;

  const handlePayNow = (app: Application) => {
    router.push({
      pathname: `/payment/${app.id}` as any,
    });
  };

  const handleQuickLink = (linkType: "history" | "receipts") => {
    if (linkType === "history") {
      if (paidApps.length === 0) {
        Alert.alert(
          "Payment History",
          "You have no completed payments yet. Once you make a payment, your full transaction history will appear here."
        );
      } else {
        Alert.alert(
          "Payment History",
          `You have ${paidApps.length} completed transactions totaling ₹${totalPaid.toLocaleString("en-IN")}.`
        );
      }
    } else {
      if (paidApps.length === 0) {
        Alert.alert(
          "Invoices & Receipts",
          "No invoices or payment receipts are available yet. Invoices are generated automatically upon successful payment."
        );
      } else {
        Alert.alert(
          "Invoices & Receipts",
          `${paidApps.length} tax invoice receipts are available for download.`
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
      />

      {/* ── Navy Curved Header Matching My Applications ── */}
      <View style={[styles.navyHeader, getPaymentHeaderThemedStyle(insets.top)]}>
        <HeaderGradientBackground />
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Payments</Text>
            <Text style={styles.headerSubtitle}>
              View dues, payments and receipts in one place.
            </Text>
          </View>
        </View>

        {/* ── Payment Overview Card (Inside Navy Header) ── */}
        <View style={styles.overviewCardWrapper}>
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeaderRow}>
              <View style={styles.overviewIconBox}>
                <Ionicons name="card" size={18} color="#0284C7" />
              </View>
              <Text style={styles.overviewTitle}>Payment Overview</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Total Paid</Text>
                <Text style={styles.statValue}>
                  ₹{totalPaid.toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={[styles.statCol, styles.statColDivider]}>
                <Text style={styles.statLabel}>Pending</Text>
                <Text
                  style={[
                    styles.statValue,
                    pendingAmount > 0 ? styles.statValuePending : null,
                  ]}
                >
                  ₹{pendingAmount.toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={[styles.statCol, styles.statColDivider]}>
                <Text style={styles.statLabel}>Transactions</Text>
                <Text style={styles.statValue}>{totalTransactions}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: SCREEN_BOTTOM_PADDING },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* 2. Dues Section: Pending Applications or "No payments yet" */}
        {pendingApps.length === 0 ? (
          <View style={styles.emptyDuesCard}>
            <View style={styles.emptyDuesRow}>
              <View style={styles.receiptIconCircle}>
                <Ionicons name="receipt" size={24} color="#EA580C" />
              </View>
              <View style={styles.emptyDuesTextCol}>
                <Text style={styles.emptyDuesTitle}>No payments yet</Text>
                <Text style={styles.emptyDuesSubtitle}>
                  Your service payments and receipts will appear here after you
                  apply for a service.
                </Text>
                <TouchableOpacity
                  style={styles.exploreServicesBtn}
                  activeOpacity={0.8}
                  onPress={() => router.push("/(main)/home")}
                >
                  <Text style={styles.exploreServicesBtnText}>
                    Explore Services
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#0B2545" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.pendingContainer}>
            <View style={styles.pendingSectionHeader}>
              <Text style={styles.sectionHeading}>Pending Payments</Text>
            </View>
            {pendingApps.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={styles.pendingCard}
                activeOpacity={0.85}
                onPress={() => handlePayNow(app)}
              >
                <View style={styles.pendingCardHeader}>
                  <Text style={styles.pendingServiceName} numberOfLines={1}>
                    {app.serviceName || "Service Application"}
                  </Text>
                  <View style={styles.dueBadge}>
                    <Text style={styles.dueBadgeText}>Payment Due</Text>
                  </View>
                </View>

                <Text style={styles.pendingAppId}>
                  Application #{app.id} • {app.createdAt || "Recently submitted"}
                </Text>

                <View style={styles.pendingCardFooter}>
                  <View>
                    <Text style={styles.pendingAmountLabel}>Amount Due</Text>
                    <Text style={styles.pendingAmountValue}>
                      ₹{Number(app.paymentAmount).toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.payNowBtn}
                    activeOpacity={0.8}
                    onPress={() => handlePayNow(app)}
                  >
                    <Text style={styles.payNowBtnText}>Pay Now</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 3. Payment Activity Section */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionHeading}>Payment Activity</Text>

          {paidApps.length === 0 ? (
            <View style={styles.emptyActivityBox}>
              <View style={styles.emptyActivityIconCircle}>
                <Ionicons name="receipt-outline" size={32} color="#0284C7" />
              </View>
              <Text style={styles.emptyActivityTitle}>Nothing to show yet</Text>
              <Text style={styles.emptyActivitySubtitle}>
                Completed and pending payments will appear here.
              </Text>
            </View>
          ) : (
            paidApps.map((app) => (
              <View key={app.id} style={styles.activityCard}>
                <View style={styles.activityLeft}>
                  <Text style={styles.activityTitle}>
                    {app.serviceName || "Finsolz Service"}
                  </Text>
                  <Text style={styles.activityDate}>
                    App #{app.id} • {app.createdAt || "Paid"}
                  </Text>
                </View>
                <View style={styles.activityRight}>
                  <Text style={styles.activityAmount}>
                    ₹{Number(app.paymentAmount).toLocaleString("en-IN")}
                  </Text>
                  <Text style={styles.activityStatus}>Paid ✓</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* 4. Quick Links Section */}
        <View style={styles.quickLinksSection}>
          <Text style={styles.sectionHeading}>Quick Links</Text>

          <View style={styles.quickLinksCard}>
            <TouchableOpacity
              style={styles.quickLinkRow}
              activeOpacity={0.7}
              onPress={() => handleQuickLink("history")}
            >
              <View style={styles.quickLinkIconBox}>
                <Ionicons name="time-outline" size={20} color="#0284C7" />
              </View>
              <Text style={styles.quickLinkText}>Payment History</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.quickLinkDivider} />

            <TouchableOpacity
              style={styles.quickLinkRow}
              activeOpacity={0.7}
              onPress={() => handleQuickLink("receipts")}
            >
              <View style={styles.quickLinkIconBox}>
                <Ionicons name="document-text-outline" size={20} color="#0284C7" />
              </View>
              <Text style={styles.quickLinkText}>Invoices & Receipts</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default PaymentOverviewScreen;
