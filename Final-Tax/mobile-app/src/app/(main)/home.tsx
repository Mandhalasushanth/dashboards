import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Alert,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/authStore";
import { useApplicationStore } from "@/store/applicationStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useServiceAccessGuard } from "@/shared/hooks/useServiceAccessGuard";
import { isProfileComplete } from "@/shared/guards/serviceAccess";
import { SCREEN_BOTTOM_PADDING } from "@/shared/components/ScreenLayout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Spacing } from "@/shared/theme";
import {
  styles,
  getScrollGreetingThemedStyle,
  getHomeContainerThemedStyle,
  getScrollContentThemedStyle,
  getSectionTitleThemedStyle,
} from "@/styles/app/(main)/home.styles";
import type { DashboardServiceTile } from "@/types/home.types";

// ── Extracted sub-components ──────────────────────────────────────────────────
import { HomeHeader } from "@/components/screens/home/HomeHeader";
import { ApplyBannerCarousel, type ApplyBanner } from "@/components/screens/home/ApplyBannerCarousel";
import { ServicesGrid } from "@/components/screens/home/ServicesGrid";
import { DraftBanner } from "@/components/screens/home/DraftBanner";
import { HomeProfileSetupCard } from "@/components/screens/home/HomeProfileSetupCard";

// ── Types ─────────────────────────────────────────────────────────────────────

export type { DashboardServiceTile };

// ── Constants ─────────────────────────────────────────────────────────────────

const SERVICE_3D_IMAGES = {
  incorporation: require("../../../assets/images/services_3d/incorporation.png"),
  gst: require("../../../assets/images/services_3d/gst.png"),
  itr: require("../../../assets/images/services_3d/itr.png"),
  projects: require("../../../assets/images/services_3d/projects.png"),
  loans: require("../../../assets/images/services_3d/loans.png"),
  insurance: require("../../../assets/images/services_3d/insurance.png"),
  business: require("../../../assets/images/services_3d/business.png"),
};

// Standardized dual-color theme (Warm Orange and Cool Blue alternating)
const THEME_ORANGE = {
  bgColor: "#FFF8F1",
  borderColor: "#FED7AA",
  arrowColor: "#EA580C",
};

const THEME_BLUE = {
  bgColor: "#F0F7FF",
  borderColor: "#BFDBFE",
  arrowColor: "#2563EB",
};

export const DASHBOARD_SERVICES: DashboardServiceTile[] = [
  // Row 1: Orange | Blue
  { id: "incorporation", label: "Incorporation", image: SERVICE_3D_IMAGES.incorporation, route: "/service/company-registration", description: "Company\nregistration", ...THEME_ORANGE },
  { id: "gst", label: "GST", image: SERVICE_3D_IMAGES.gst, route: "/service/gst", description: "Registration,\nfiling & compliance", ...THEME_BLUE },
  // Row 2: Blue | Orange (Checkerboard)
  { id: "itr", label: "ITR", image: SERVICE_3D_IMAGES.itr, route: "/service/itr", description: "Income Tax\nFiling", ...THEME_BLUE },
  { id: "projects", label: "Projects", image: SERVICE_3D_IMAGES.projects, route: { pathname: "/service/loans", params: { category: "project-finance" } }, description: "Project\nManagement", ...THEME_ORANGE },
  // Row 3: Orange | Blue
  { id: "loans", label: "Loans", image: SERVICE_3D_IMAGES.loans, route: "/service/loans", description: "Personal, Home\n& Business Loans", ...THEME_ORANGE },
  { id: "insurance", label: "Insurance", image: SERVICE_3D_IMAGES.insurance, route: "/service/health-insurance", description: "Coverage\nfor your future", ...THEME_BLUE },
  // Row 4: Full-width bottom card
  { id: "business", label: "Business", image: SERVICE_3D_IMAGES.business, route: "/service/accounting-bookkeeping", description: "Business Solutions & Support", ...THEME_BLUE, isFullWidth: true },
];

export const APPLY_BANNERS: ApplyBanner[] = [
  { key: "b-loans", id: "LOANS", route: "/service/loans", title: "Loans", desc: "Turn your goals into reality\nwith our flexible loan solutions.", cta: "Explore Loans", icon: "wallet", tag: "Ready to help", bg: "#082B59" },
  { key: "b-gst", id: "GST", route: "/service/gst", title: "GST", desc: "Registration, filing & compliance\nfor growing businesses", cta: "Apply Now", icon: "receipt", tag: "Fast & Reliable", bg: "#082B59" },
  { key: "b-itr", id: "ITR", route: "/service/itr", title: "ITR & TDS", desc: "File returns, claim your refund\naccurately & on time", cta: "File Now", icon: "calculator", tag: "Max Refund", bg: "#082B59" },
  { key: "b-ins", id: "INSURANCE", route: "/service/health-insurance", title: "Insurance", desc: "Coverage for your future\nhealth & life cover plans", cta: "Get Quote", icon: "shield-checkmark", tag: "Total Care", bg: "#082B59" },
  { key: "b-company", id: "BUSINESS", route: "/service/company-registration", title: "Company Setup", desc: "Incorporation & registrations\nstart in 3 simple steps", cta: "Start Now", icon: "business", tag: "Fast Setup", bg: "#082B59" },
  { key: "b-acct", id: "BUSINESS", route: "/service/accounting-bookkeeping", title: "Accounting", desc: "Bookkeeping & monthly reports\nby certified experts", cta: "Know More", icon: "stats-chart", tag: "Expert CA", bg: "#082B59" },
];

export default function HomeScreen() {
  const router = useRouter();
  const colors = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.authenticatedUser);
  const customer = useAuthStore((s) => s.customer);
  const profileCompleted = useAuthStore((s) => s.profileCompleted);
  const isExistingUser = useAuthStore((s) => s.isExistingUser);
  const customerExists = useAuthStore((s) => s.customerExists);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const loadApplications = useApplicationStore((s) => s.loadApplications);

  const gstDraft = useApplicationStore((s) => s.gstDraft);
  const gstFilingDraft = useApplicationStore((s) => s.gstFilingDraft);
  const itrDraft = useApplicationStore((s) => s.itrDraft);

  const isProfileCompleted = isProfileComplete({
    profileCompleted,
    isExistingUser,
    customerExists,
    customer,
    authenticatedUser: user,
  });

  const { accessService } = useServiceAccessGuard();

  useFocusEffect(
    useCallback(() => {
      try {
        loadApplications().catch(() => {});
      } catch {
        // Fallback silently if synchronous error occurs
      }
    }, [loadApplications])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert("Exit App", "Are you sure you want to exit?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, [])
  );

  const displayName = customer?.name || user?.name || "User";
  const greetingTitle = isProfileCompleted
    ? `Hello, ${displayName} 👋`
    : "Hello, User 👋";

  const handleBannerSelect = (banner: ApplyBanner) => {
    accessService(banner.route);
  };

  const openTile = (tile: DashboardServiceTile) => {
    if (tile.route) accessService(tile.route);
  };

  const handleCompleteProfile = () => {
    router.push("/(auth)/createprofile");
  };

  const handleHelpPress = () => {
    router.push("/chat/support");
  };

  const handleNotificationsPress = () => {
    router.push("/notifications");
  };

  return (
    <View style={[styles.container, getHomeContainerThemedStyle(colors.background)]}>
      <FocusAwareStatusBar barStyle="light-content" />

      {/* Single Unified Fixed Header */}
      <HomeHeader
        greetingTitle={greetingTitle}
        unreadCount={unreadCount}
        topInset={insets.top}
        onNotificationsPress={handleNotificationsPress}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentThemedStyle(SCREEN_BOTTOM_PADDING),
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Before completing the create account, show Complete Profile card */}
        {!isProfileCompleted && (
          <View style={styles.homeBodyContainer}>
            <HomeProfileSetupCard
              onComplete={handleCompleteProfile}
              completionPercentage={60}
            />
          </View>
        )}

        {/* Carousel banner with white space on left and right */}
        <ApplyBannerCarousel
          banners={APPLY_BANNERS}
          colors={colors}
          onSelect={handleBannerSelect}
        />

        {/* Services & Rest of Page on Plain Single Screen */}
        <View style={styles.homeBodyContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, getSectionTitleThemedStyle(colors.text)]}>
              Services
            </Text>
          </View>

          <ServicesGrid
            services={DASHBOARD_SERVICES}
            isDark={isDark}
            colors={colors}
            onPress={openTile}
          />

          {/* In-progress draft banners */}
          {gstDraft && (
            <DraftBanner
              updatedAt={gstDraft.updatedAt}
              stepIndex={gstDraft.stepIndex || 0}
              totalSteps="4"
              accentColor={colors.orange}
              lightBg="#FEF0E6"
              lightBorder="#FFD8BF"
              tagLabel="INCOMPLETE APPLICATION"
              title="GST Registration"
              subtitle="Pick up right where you left off"
              resumeLabel="Resume Application"
              isDark={isDark}
              colors={colors}
              onPress={() => accessService("/service/gst-registration")}
            />
          )}
          {gstFilingDraft && (
            <DraftBanner
              updatedAt={gstFilingDraft.updatedAt}
              stepIndex={gstFilingDraft.stepIndex || 0}
              totalSteps="4"
              accentColor={colors.primary}
              lightBg="#EAF1FE"
              lightBorder="#BFDBFE"
              tagLabel="INCOMPLETE FILING"
              title={`GST Return Filing (${gstFilingDraft.periodData?.filingMonth || "Current Period"})`}
              subtitle="Continue your return filing"
              resumeLabel="Resume Filing"
              isDark={isDark}
              colors={colors}
              onPress={() => accessService("/service/gst-filing")}
            />
          )}
          {itrDraft && (
            <DraftBanner
              updatedAt={itrDraft.updatedAt}
              stepIndex={itrDraft.stepIndex || 0}
              totalSteps="5"
              accentColor={colors.orange}
              lightBg="#FEF0E6"
              lightBorder="#FFD8BF"
              tagLabel="INCOMPLETE APPLICATION"
              title={`ITR Filing - ${itrDraft.categoryTitle || "Income Tax Return"}`}
              subtitle="Pick up right where you left off"
              resumeLabel="Resume Application"
              isDark={isDark}
              colors={colors}
              onPress={() => accessService("/service/itr-filing")}
            />
          )}

          {/* Need help */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleHelpPress}
            style={styles.helpCard}
          >
            <View style={styles.helpIcon}>
              <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpDesc}>Our experts are available 24/7</Text>
            </View>
            <View style={styles.helpBtn}>
              <Text style={styles.helpBtnText}>Chat</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
