import React, { type ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useTheme } from "@/hooks/use-theme";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";

export const FLOATING_TAB_HEIGHT = 64;
export const FLOATING_TAB_GAP = 12;

export const SCREEN_PADDING = 16;
export const SCREEN_BOTTOM_PADDING = FLOATING_TAB_HEIGHT + FLOATING_TAB_GAP + 24;

export interface ScreenLayoutProps {
  title: string;
  children?: ReactNode;
  showBack?: boolean;
  showNotification?: boolean;
  unreadCount?: number;
  onBack?: () => void;
  onNotificationPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ScreenLayout({
  title,
  children,
  showBack = false,
  showNotification = true,
  unreadCount,
  onBack,
  onNotificationPress,
  style,
}: ScreenLayoutProps) {
  const colors = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <AppHeader
        title={title}
        showBack={showBack}
        showNotification={showNotification}
        unreadCount={unreadCount}
        onBack={onBack}
        onNotificationPress={onNotificationPress}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenLayout;
