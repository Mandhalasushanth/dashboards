import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  BackHandler,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import { useApplicationStore } from "@/store/applicationStore";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { SCREEN_BOTTOM_PADDING } from "@/shared/components/ScreenLayout";
import {
  styles,
  getProfileScrollStyle,
  getKycPillStyle,
  getProfileHeroThemedStyle,
} from "./ProfileScreen.styles";
import { HeaderGradientBackground } from "@/shared/components/HeaderGradientBackground/HeaderGradientBackground";

import type { IconName } from "@/types/domain";
import { useProfileManager } from "@/components/screens/profile/useProfileManager";
import { PersonalDetailsModal } from "@/components/screens/profile/PersonalDetailsModal";
import { KycDetailsModal } from "@/components/screens/profile/KycDetailsModal";
import { ProfileSectionModal, type ProfileModalType } from "@/components/screens/profile/ProfileSectionModal";
import { formatProfileCode } from "@/components/screens/profile/ProfileModalHeader";
import { useAuthStore } from "@/store/authStore";
import { isPlaceholderCustomerName } from "@/modules/authentication/store/authStore.helpers";
import { SECTIONS, type MenuRow, type RowAction } from "./profileSections.config";

const compactRupees = (value: number): string =>
  value >= 100000
    ? `₹${(value / 100000).toFixed(1)}L`
    : value >= 1000
      ? `₹${(value / 1000) % 1 === 0 ? value / 1000 : (value / 1000).toFixed(1)}K`
      : `₹${value}`;

export function ProfileScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const applications = useApplicationStore((state) => state.applications);

  const {
    customer,
    pickingPhoto,
    showKycModal,
    setShowKycModal,
    showPersonalModal,
    setShowPersonalModal,
    fetchingPersonal,
    personalDetails,
    isEditingPersonal,
    setIsEditingPersonal,
    savingPersonal,
    personalErrors,
    setPersonalErrors,
    personalForm,
    fetchPersonalDetails,
    updatePersonalField,
    handleSavePersonal,
    closePersonalModal,
    handleChangePhoto,
    handleLogout,
  } = useProfileManager();

  const profileCompleted = useAuthStore((state) => state.profileCompleted);
  const isProfileComplete = Boolean(
    profileCompleted &&
    customer?.profileCompleted !== false &&
    customer?.name &&
    !isPlaceholderCustomerName(customer.name)
  );

  const [activeProfileModal, setActiveProfileModal] = useState<ProfileModalType | null>(null);

  /* Stats */
  const activeCount = applications.filter((app) => app.status !== "Completed").length;
  const completedCount = applications.filter((app) => app.status === "Completed").length;
  const totalPaid = applications
    .filter((app) => app.paymentStatus === "Paid")
    .reduce((sum, app) => sum + app.paymentAmount, 0);

  const activePan = isProfileComplete ? personalDetails?.pan || customer?.pan : undefined;
  const activeAadhaar = isProfileComplete ? personalDetails?.aadhaar || customer?.aadhaar : undefined;
  const allDocuments = applications.flatMap((app) => app.documents);
  const hasUploaded = (keyword: string) =>
    allDocuments.some(
      (doc) => doc.name.toLowerCase().includes(keyword) && doc.status === "Uploaded"
    );
  const kycVerified = (hasUploaded("pan") && hasUploaded("aadhaar")) || Boolean(activePan && activeAadhaar);
  const kycPillStyle = getKycPillStyle(kycVerified, colors);

  const ACTION_HANDLERS: Record<string, (action: RowAction, label: string) => void> = {
    route: (act) => act.kind === "route" && router.push(act.href),
    modal: (act) => {
      if (act.kind === "modal") {
        if (act.modal === "kyc") {
          setShowKycModal(true);
        } else if (act.modal === "personal") {
          setShowPersonalModal(true);
          fetchPersonalDetails();
        } else {
          setActiveProfileModal(act.modal as ProfileModalType);
        }
      }
    },
    soon: (_, label) => Alert.alert(label, "This section isn't available yet."),
  };

  const runAction = (row: MenuRow) => {
    ACTION_HANDLERS[row.action.kind]?.(row.action, row.label);
  };

  const statItems = [
    { value: `${activeCount}`, label: "Active Apps", color: colors.primary },
    { value: `${completedCount}`, label: "Completed", color: colors.success },
    { value: compactRupees(totalPaid), label: "Total Paid", color: colors.orange },
  ];

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.replace("/(main)/home");
        return true;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, [router])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <ScrollView
        contentContainerStyle={getProfileScrollStyle(SCREEN_BOTTOM_PADDING)}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View
          style={[
            styles.hero,
            getProfileHeroThemedStyle(colors.primaryDark, insets.top),
          ]}
        >
          <HeaderGradientBackground />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleChangePhoto}
            style={styles.avatarWrap}
          >
            <View style={styles.avatarBg}>
              {customer?.avatarUri ? (
                <Image source={{ uri: customer.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Ionicons name="person" size={38} color="#FFFFFF" />
              )}
              {pickingPhoto ? (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              ) : null}
            </View>
            <View style={[styles.editBadge, { backgroundColor: colors.orange }]}>
              <Ionicons name="pencil" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.heroName}>
            {isProfileComplete
              ? (personalDetails?.name || customer?.name || "Customer Profile")
              : (customer?.mobile
                ? `User (+91 ${String(customer.mobile).replace(/\D/g, "").slice(-10)})`
                : "Finsolz Customer")}
          </Text>
          <Text style={styles.heroId}>
            {isProfileComplete
              ? `Customer ID: ${personalDetails?.custId || personalDetails?.customerId || customer?.customerId || "N/A"
              }`
              : (customer?.mobile
                ? `Customer ID: TX-${String(customer.mobile).replace(/\D/g, "").slice(-6)}`
                : "Profile setup pending")}
          </Text>

          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {isProfileComplete
                  ? (formatProfileCode(personalDetails?.customerType || customer?.customerType) || "Individual")
                  : "Profile Incomplete"}
              </Text>
            </View>
            <View style={[styles.pill, styles.pillOutline, { borderColor: kycPillStyle.borderColor }]}>
              <Text style={[styles.pillText, { color: kycPillStyle.color }]}>
                {kycVerified ? "KYC Verified ✓" : "KYC Pending"}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          {statItems.map((stat) => (
            <View key={stat.label} style={styles.statCell}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Incomplete Profile Action Banner */}
        {!isProfileComplete && (
          <View
            style={[
              styles.completeProfileBanner,
              { backgroundColor: colors.backgroundElement, borderColor: colors.orange },
            ]}
          >
            <View style={styles.bannerHeader}>
              <View style={[styles.bannerIconCircle, { backgroundColor: "#FEF0E6" }]}>
                <Ionicons name="person-add" size={20} color={colors.orange} />
              </View>
              <View style={styles.bannerHeaderText}>
                <Text style={[styles.bannerTitle, { color: colors.text }]}>Complete Your Profile</Text>
                <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>
                  Set up your personal and KYC details to unlock loans, GST, ITR, and financial services.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.bannerBtn, { backgroundColor: colors.orange }]}
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/createprofile")}
            >
              <Text style={styles.bannerBtnText}>Complete Profile Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuArea}>
          {SECTIONS.map((section) => (
            <View key={section.title}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                {section.title.toUpperCase()}
              </Text>

              <View
                style={[
                  styles.sectionCard,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                ]}
              >
                {section.rows.map((row, index) => (
                  <TouchableOpacity
                    key={row.label}
                    activeOpacity={0.75}
                    onPress={() => runAction(row)}
                    style={[
                      styles.row,
                      index > 0 ? [styles.rowBorderTop, { borderTopColor: colors.border }] : null,
                    ]}
                  >
                    <View style={[styles.rowIcon, { backgroundColor: row.tintBg }]}>
                      <Ionicons name={row.icon} size={17} color={row.tint} />
                    </View>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>{row.label}</Text>
                    <Ionicons name="chevron-forward" size={17} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            style={[
              styles.logoutBtn,
              { borderColor: colors.error, backgroundColor: colors.backgroundElement },
            ]}
          >
            <Ionicons name="log-out-outline" size={19} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Personal Information Modal */}
      <PersonalDetailsModal
        visible={showPersonalModal}
        onClose={closePersonalModal}
        colors={colors}
        fetchingPersonal={fetchingPersonal}
        isEditingPersonal={isEditingPersonal}
        setIsEditingPersonal={setIsEditingPersonal}
        savingPersonal={savingPersonal}
        personalDetails={personalDetails}
        customer={customer}
        personalForm={personalForm}
        personalErrors={personalErrors}
        updatePersonalField={updatePersonalField}
        handleSavePersonal={handleSavePersonal}
        onCancelEdit={() => {
          setIsEditingPersonal(false);
          setPersonalErrors({});
        }}
        isProfileComplete={isProfileComplete}
        onCompleteProfile={() => {
          closePersonalModal();
          router.push("/(auth)/createprofile");
        }}
      />

      {/* KYC Details Modal */}
      <KycDetailsModal
        visible={showKycModal}
        onClose={() => setShowKycModal(false)}
        colors={colors}
        activePan={activePan}
        activeAadhaar={activeAadhaar}
        kycVerified={kycVerified}
        isProfileComplete={isProfileComplete}
        onCompleteProfile={() => {
          setShowKycModal(false);
          router.push("/(auth)/createprofile");
        }}
      />

      {/* Profile Section Modal (GST Details, ITR History, Loan History) */}
      <ProfileSectionModal
        visible={Boolean(activeProfileModal)}
        onClose={() => setActiveProfileModal(null)}
        colors={colors}
        modalType={activeProfileModal}
        applications={applications}
      />
    </View>
  );
}

export default ProfileScreen;
