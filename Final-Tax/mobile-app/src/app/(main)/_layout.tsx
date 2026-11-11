import { Tabs } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { FloatingTabBar } from "@/components";

/**
 * The default tab bar is replaced by <FloatingTabBar> through the `tabBar`
 * prop, so routing still comes from expo-router / React Navigation - there is
 * no second navigation system. Screens keep their own names and paths.
 *
 * Every screen wraps its content in <ScreenLayout>, which supplies the shared
 * header and the bottom padding that clears the floating bar.
 */
export default function MainLayout() {
  const colors = useTheme();

  return (
    <Tabs
      backBehavior="initialRoute"
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Screens own their bottom clearance through SCREEN_BOTTOM_PADDING,
        // so the scene itself is full-bleed and never resizes between tabs.
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="applications" options={{ title: "My Applications" }} />
      <Tabs.Screen name="payments" options={{ title: "Payment" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      {/* Nested and secondary routes: reachable by navigation, not shown in the tab bar. */}
      <Tabs.Screen name="gst" options={{ href: null }} />
    </Tabs>
  );
}
