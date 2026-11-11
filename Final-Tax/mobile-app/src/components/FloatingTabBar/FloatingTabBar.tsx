import React from "react";
import { Pressable, View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Href } from "expo-router";
import type {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from "expo-router/js-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/use-theme";

import {
  FLOATING_TAB_HEIGHT,
  ACTIVE_ICON_COLOR,
  HIDDEN_FROM_BAR,
  INACTIVE_ICON_COLOR,
  SPRING,
  TAB_META,
  metaFor,
  styles,
  getBackdropGradientThemedStyle,
  getFloatingWrapperThemedStyle,
  type TabMeta,
} from "./FloatingTabBar.styles";

export {
  FLOATING_TAB_HEIGHT,
  FLOATING_TAB_GAP,
  type TabMeta,
} from "./FloatingTabBar.styles";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type TabRoute = BottomTabBarProps["state"]["routes"][number];

interface TabItemProps {
  route: TabRoute;
  isFocused: boolean;
  label: string;
  meta: TabMeta;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({
  route,
  isFocused,
  label,
  meta,
  onPress,
  onLongPress,
}: TabItemProps) {
  const pressed = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1 - pressed.value * 0.08, SPRING) }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      testID={`tab-${route.name}`}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        pressed.value = 1;
      }}
      onPressOut={() => {
        pressed.value = 0;
      }}
      style={[styles.tabItem, pressStyle]}
    >
      {isFocused ? (
        <View style={styles.activePill}>
          <Ionicons name={meta.icon} size={20} color={ACTIVE_ICON_COLOR} />
          <Text style={styles.activeLabel} numberOfLines={1}>
            {meta.label}
          </Text>
        </View>
      ) : (
        <View style={styles.inactivePill}>
          <Ionicons
            name={meta.iconOutline}
            size={20}
            color={INACTIVE_ICON_COLOR}
          />
          <Text style={styles.inactiveLabel} numberOfLines={1}>
            {meta.label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

export function FloatingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useTheme();

  const bottomOffset = Math.max(insets.bottom, 10);
  const backdropHeight = FLOATING_TAB_HEIGHT + bottomOffset + 24;
  const isDark = Boolean(colors?.isDark);

  const backdropColors = (isDark
    ? [
        "rgba(15, 23, 42, 0)",
        "rgba(15, 23, 42, 0.75)",
        "rgba(15, 23, 42, 0.95)",
        "#0F172A",
      ]
    : [
        "rgba(248, 250, 252, 0)",
        "rgba(248, 250, 252, 0.75)",
        "rgba(248, 250, 252, 0.95)",
        "#F8FAFC",
      ]) as readonly [string, string, ...string[]];

  return (
    <View style={styles.navBarContainer} pointerEvents="box-none">
      <LinearGradient
        colors={backdropColors}
        locations={[0, 0.28, 0.65, 1]}
        style={[styles.backdropGradient, getBackdropGradientThemedStyle(backdropHeight)]}
        pointerEvents="none"
      />
      <View
        style={[styles.floatingWrapper, getFloatingWrapperThemedStyle(bottomOffset)]}
        pointerEvents="box-none"
      >
        <View style={styles.capsuleContainer}>
          {state.routes
            .filter((route) => {
              const options = descriptors[route.key].options as
                | (BottomTabNavigationOptions & { href?: Href | null })
                | undefined;
              const routeBase = route.name.split("/")[0];
              return (
                !route.name.includes("styles") &&
                !route.name.endsWith(".styles") &&
                !HIDDEN_FROM_BAR.has(routeBase) &&
                Boolean(TAB_META[route.name] ?? TAB_META[routeBase]) &&
                options?.href !== null
              );
            })
            .map((route) => {
              const options = descriptors[route.key]
                .options as BottomTabNavigationOptions & { href?: Href | null };
              const meta = metaFor(route.name);
              const isFocused =
                state.routes[state.index]?.key === route.key;
              const label = meta.label ?? options.title ?? route.name;

              const onPress = () => {
                const event = emitter.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigateToTab(route.key);
                }
              };

              const onLongPress = () => {
                emitter.emit({ type: "tabLongPress", target: route.key });
              };

              return (
                <TabItem
                  key={route.key}
                  route={route}
                  meta={meta}
                  label={label}
                  isFocused={isFocused}
                  onPress={onPress}
                  onLongPress={onLongPress}
                />
              );
            })}
        </View>
      </View>
    </View>
  );
}
