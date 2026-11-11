import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { useNotificationStore } from "@/store/notificationStore";
import { AppHeader } from "@/shared/components/AppHeader";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, getThemedStyles } from "./NotificationsScreen.styles";
import type { IconName, NotificationType } from "@/types/domain";
import { formatRelativeTime, parseTimestamp } from "@/shared/formatters/dateFormatter";

export function NotificationsScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const themedStyles = getThemedStyles(colors, insets);
  const { notifications, markAllAsRead } = useNotificationStore();

  // Automatically mark all notifications as read when the screen is opened
  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  // Re-render once a minute so "5 min ago" style labels stay current.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Newest first by the raw creation time (never by the display string).
  // Items without a creation time keep their stored order, after dated ones.
  const sortedNotifications = useMemo(() => {
    const time = (createdAt?: string) => parseTimestamp(createdAt)?.getTime() ?? -Infinity;
    return notifications
      .map((n, index) => ({ n, index }))
      .sort((a, b) => time(b.n.createdAt) - time(a.n.createdAt) || a.index - b.index)
      .map(({ n }) => n);
  }, [notifications]);

  const getIcon = (
    type: NotificationType,
  ): { name: IconName; color: string } => {
    switch (type) {
      case "gst":
        return { name: "receipt-outline", color: colors.primary };
      case "itr":
        return { name: "cash-outline", color: colors.primaryDark };
      case "loans":
        return { name: "business-outline", color: colors.orange };
      case "insurance":
        return { name: "shield-checkmark-outline", color: colors.success };
      case "payment":
        return { name: "card-outline", color: colors.success };
      case "document":
        return { name: "document-text-outline", color: colors.error };
      default:
        return { name: "notifications-outline", color: colors.textSecondary };
    }
  };

  return (
    <View style={[styles.container, themedStyles.container]}>
      <AppHeader title="Notifications" showBack showNotification={false} />

      <FlatList
        data={sortedNotifications}
        extraData={now}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          themedStyles.listContent,
          notifications.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, themedStyles.emptyIconContainer]}>
              <Ionicons
                name="notifications-outline"
                size={40}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.emptyText, themedStyles.emptyText]}>
              No Notifications Yet
            </Text>
            <Text style={[styles.emptySub, themedStyles.emptySub]}>
              Notifications about your applications, payments, document requests, approvals, and reminders will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const icon = getIcon(item.type);
          return (
            <View
              style={[
                styles.notifCard,
                themedStyles.notifCard,
              ]}
            >
              <View
                style={[
                  styles.iconBg,
                  themedStyles.iconBg,
                ]}
              >
                <Ionicons name={icon.name} size={20} color={icon.color} />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                  <Text style={[styles.notifTitle, themedStyles.notifTitle]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.notifTime,
                      themedStyles.notifTime,
                    ]}
                  >
                    {formatRelativeTime(item.createdAt, now)}
                  </Text>
                </View>
                <Text
                  style={[styles.notifBody, themedStyles.notifBody]}
                >
                  {item.body}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

export default NotificationsScreen;
