import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
  BackHandler,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useResponsive } from "@/hooks/use-responsive";
import { useApplicationStore } from "@/store/applicationStore";
import { SCREEN_BOTTOM_PADDING } from "@/shared/components/ScreenLayout";
import type { Application } from "@/types/domain";
import {
  styles,
  getActiveApplicationsContainerThemedStyle,
  getNavyHeaderThemedStyle,
  getCategoryPillThemedStyle,
  getCategoryPillTextThemedStyle,
  getScrollContentThemedStyle,
  getThemedTextColorStyle,
  getErrorContainerThemedStyle,
  getErrorTitleThemedStyle,
} from "./ActiveApplicationsScreen.styles";
import { ApplicationCardItem } from "@/components/screens/applications/ApplicationCardItem";
import { OverviewCard, type StatusFilterType, type OverviewItem } from "@/components/screens/applications/OverviewCard";
import { CategoryFilterModal, CATEGORY_FILTER_OPTIONS } from "@/components/screens/applications/CategoryFilterModal";
import { ApplicationsEmptyState } from "@/components/screens/applications/ApplicationsEmptyState";
import { HeaderGradientBackground } from "@/shared/components/HeaderGradientBackground/HeaderGradientBackground";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { isProfileComplete } from "@/shared/guards/serviceAccess";
import {
  normalizeApplicationStatus,
  matchesStatusFilter,
  matchesCategoryFilter,
  matchesSearchQuery,
  getResumeRoute,
  deduplicateApplications,
  getApplicationEmptyState,
} from "@/modules/applications/utils/applicationStatusUtils";
import { toHref } from "@/shared/utils/navigation";
import { logger } from "@/core/logging/logger";

export function ActiveApplicationsScreen() {
  const colors = useTheme();
  const isDark = useColorScheme() === "dark";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useResponsive();

  const applications = useApplicationStore((s) => s.applications);
  const isLoading = useApplicationStore((s) => s.isLoading);
  const error = useApplicationStore((s) => s.error);
  const loadApplications = useApplicationStore((s) => s.loadApplications);

  const authCustomer = useAuthStore((s) => s.customer);
  const authUser = useAuthStore((s) => s.authenticatedUser);
  const authProfileCompleted = useAuthStore((s) => s.profileCompleted);
  const authIsExistingUser = useAuthStore((s) => s.isExistingUser);
  const authCustomerExists = useAuthStore((s) => s.customerExists);

  const isProfileCompleted = useMemo(
    () =>
      isProfileComplete({
        profileCompleted: authProfileCompleted,
        isExistingUser: authIsExistingUser,
        customerExists: authCustomerExists,
        customer: authCustomer,
        authenticatedUser: authUser,
      }),
    [authCustomer, authUser, authProfileCompleted, authIsExistingUser, authCustomerExists]
  );

  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterKey, setSelectedFilterKey] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL");
  const [showCategoryFilterModal, setShowCategoryFilterModal] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      await loadApplications();
    } catch (err) {
      logger.warn("[ActiveApplications] Failed to fetch applications:", { error: err });
    } finally {
      setHasLoadedOnce(true);
    }
  }, [loadApplications]);


  useFocusEffect(
    useCallback(() => {
      fetchApplications();

      const onBackPress = () => {
        router.replace("/(main)/home");
        return true;
      };

      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, [fetchApplications, router])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadApplications();
    } catch (err) {
      logger.warn("[ActiveApplications] Failed to refresh applications:", { error: err });
    } finally {
      setRefreshing(false);
    }
  }, [loadApplications]);

  // Stable deduplicated applications to guarantee consistent counts
  const uniqueApplications = useMemo(
    () => deduplicateApplications(applications),
    [applications]
  );

  // Derived counts calculated strictly from real store records
  const totalCount = uniqueApplications.length;
  const inProgressCount = useMemo(
    () =>
      uniqueApplications.filter(
        (a) => normalizeApplicationStatus(a.status) === "IN_PROGRESS"
      ).length,
    [uniqueApplications]
  );
  const completedCount = useMemo(
    () =>
      uniqueApplications.filter(
        (a) => normalizeApplicationStatus(a.status) === "COMPLETED"
      ).length,
    [uniqueApplications]
  );
  const underVerificationCount = useMemo(
    () =>
      uniqueApplications.filter(
        (a) => normalizeApplicationStatus(a.status) === "UNDER_VERIFICATION"
      ).length,
    [uniqueApplications]
  );

  const filteredApplications = useMemo(
    () =>
      uniqueApplications
        .filter(
          (app) =>
            matchesCategoryFilter(app, selectedFilterKey) &&
            matchesStatusFilter(app.status, statusFilter) &&
            matchesSearchQuery(app, searchQuery)
        )
        .sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        }),
    [uniqueApplications, selectedFilterKey, statusFilter, searchQuery]
  );

  const overviewItems: OverviewItem[] = [
    { key: "ALL", count: totalCount, label: "Total\nApplications", color: isDark ? colors.text : "#083B75", isAll: true },
    { key: "IN_PROGRESS", count: inProgressCount, label: "In Progress", color: "#EA580C" },
    { key: "COMPLETED", count: completedCount, label: "Completed", color: isDark ? colors.text : "#083B75" },
    { key: "UNDER_VERIFICATION", count: underVerificationCount, label: "Under\nVerification", color: "#EA580C" },
  ];

  const handleApplicationPress = useCallback(
    (item: Application) => {
      const isDraft = item.status === "Draft" || Boolean(item.formData?.isDraft);
      if (isDraft) {
        router.push(toHref(getResumeRoute(item)));
      } else {
        useApplicationStore.getState().setSelectedApplicationId(item.id);
        router.push(`/application/${item.id}`);
      }
    },
    [router]
  );

  const cardBg = isDark ? colors.backgroundElement : "#FFFFFF";
  const cardBorder = isDark ? colors.border : "#E2E8F0";

  const emptyState = getApplicationEmptyState(
    uniqueApplications.length,
    statusFilter,
    searchQuery
  );

  const handleEmptyReset = useCallback(() => {
    if (emptyState.resetType === "STATUS") {
      setStatusFilter("ALL");
    } else if (emptyState.resetType === "SEARCH") {
      setSearchQuery("");
    } else if (emptyState.resetType === "ALL") {
      setStatusFilter("ALL");
      setSelectedFilterKey("ALL");
      setSearchQuery("");
    }
  }, [emptyState.resetType]);

  return (
    <View style={[styles.container, getActiveApplicationsContainerThemedStyle(isDark, colors.background)]}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A2346" />

      {/* ── Navy Header with KPI Overview Card ── */}
      <View style={[styles.navyHeader, getNavyHeaderThemedStyle(insets.top)]}>
        <HeaderGradientBackground />
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>My Applications</Text>
            <Text style={styles.headerSubtitle}>Track all your service applications</Text>
          </View>
        </View>

        {/* ── 4-Column Overview KPI Card (Inside Navy Header) ── */}
        <View style={styles.overviewCardWrapper}>
          <OverviewCard
            items={overviewItems}
            statusFilter={statusFilter}
            selectedCategory={selectedFilterKey}
            isDark={isDark}
            colors={colors}
            onSelect={setStatusFilter}
            onOpenCategoryFilter={() => setShowCategoryFilterModal(true)}
            cardBg={cardBg}
            cardBorder={cardBorder}
          />
        </View>
      </View>

      {/* ── Full-Width Search Bar (Immediately below curved navy header) ── */}
      <View style={styles.searchRow}>
        <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            style={[styles.searchInput, isDark && styles.searchInputDark]}
            placeholder="Search by application ID or service..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearSearchBtn}
            >
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category Filter Pills ── */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsScroll}
        >
          {CATEGORY_FILTER_OPTIONS.map((opt) => {
            const isActive = selectedFilterKey === opt.filterKey;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setSelectedFilterKey(opt.filterKey)}
                style={[
                  styles.categoryPill,
                  isActive && styles.activeCategoryPill,
                  isDark && getCategoryPillThemedStyle(isActive, colors.backgroundElement, colors.border),
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isActive && styles.activeCategoryPillText,
                    getCategoryPillTextThemedStyle(isDark, isActive, colors.textSecondary),
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Applications List ── */}
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentThemedStyle(SCREEN_BOTTOM_PADDING),
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF5722"
            colors={["#FF5722"]}
          />
        }
        ListEmptyComponent={
          (!hasLoadedOnce || isLoading) && applications.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF5722" />
              <Text style={[styles.loadingText, getThemedTextColorStyle(colors.textSecondary)]}>
                Loading applications...
              </Text>
            </View>
          ) : isProfileCompleted && Boolean(error) && applications.length === 0 ? (
            <View style={[styles.errorContainer, getErrorContainerThemedStyle(cardBg, isDark, colors.border)]}>
              <Ionicons name="alert-circle-outline" size={44} color="#EA580C" />
              <Text style={[styles.errorTitle, getErrorTitleThemedStyle(isDark, colors.text)]}>
                Failed to load applications
              </Text>
              <Text style={[styles.errorText, getThemedTextColorStyle(colors.textSecondary)]}>{error}</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={fetchApplications} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ApplicationsEmptyState
              isProfileCompleted={isProfileCompleted}
              hasApplications={uniqueApplications.length > 0}
              emptyState={emptyState}
              onCompleteProfile={() => router.push("/(auth)/createprofile")}
              onExploreServices={() => router.push("/(main)/home")}
              onResetFilter={handleEmptyReset}
              isDark={isDark}
              colors={colors}
              cardBg={cardBg}
              cardBorder={cardBorder}
            />
          )
        }
        renderItem={({ item }) => (
          <ApplicationCardItem
            item={item}
            isDark={isDark}
            textColor={isDark ? colors.text : "#0F172A"}
            borderColor={cardBorder}
            bgColor={cardBg}
            onPress={handleApplicationPress}
          />
        )}
      />

      <CategoryFilterModal
        visible={showCategoryFilterModal}
        selectedFilterKey={selectedFilterKey}
        onSelect={setSelectedFilterKey}
        onClose={() => setShowCategoryFilterModal(false)}
      />
    </View>
  );
}

export default ActiveApplicationsScreen;
