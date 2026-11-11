import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "@/styles/app/application/[id].styles";

export type DetailTab = "OVERVIEW" | "STATUS" | "DOCUMENTS" | "PAYMENTS" | "CHAT";

export const TABS: { id: DetailTab; label: string }[] = [
  { id: "OVERVIEW", label: "Overview" },
  { id: "STATUS", label: "Status" },
  { id: "DOCUMENTS", label: "Documents" },
  { id: "PAYMENTS", label: "Payments" },
  { id: "CHAT", label: "Chat with CA" },
];

interface ApplicationHeaderProps {
  topInset: number;
  serviceName: string;
  activeTab: DetailTab;
  setActiveTab: (tab: DetailTab) => void;
  onBack: () => void;
  onSettings?: () => void;
}

export function ApplicationHeader({
  topInset,
  serviceName,
  activeTab,
  setActiveTab,
  onBack,
  onSettings,
}: ApplicationHeaderProps) {
  return (
    <>
      {/* ── Navy Blue Header with Application Details & Selected Application Name ── */}
      <View style={[styles.navyHeader, { paddingTop: topInset + 8 }]}>
        <View style={styles.topNavRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.navTitle}>Application Details</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSettings}
            style={styles.settingsButton}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerTextWrap}>
          <Text style={styles.navAppName}>
            {serviceName}
          </Text>
        </View>
      </View>

      {/* ── 5 Horizontal Tabs (Overview, Status, Documents, Payments, Chat with CA) ── */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.75}
                onPress={() => setActiveTab(tab.id)}
                style={styles.tabItem}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? "#EA580C" : "#64748B",
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                <View
                  style={
                    isActive
                      ? styles.activeTabIndicator
                      : styles.inactiveTabIndicator
                  }
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
}
