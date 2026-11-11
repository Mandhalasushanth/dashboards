import { useEffect } from "react";
import { LogBox } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/design-system/theme";
import { AnimatedSplashOverlay } from "@/components";
import { CompleteProfileModal } from "@/shared/components/CompleteProfileModal";
import { AppUpdateBanner } from "@/core/updates";
import { ErrorBoundary } from "@/core/error-handling/ErrorBoundary";
import { RootStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { AppBootstrap } from "@/core/bootstrap/AppBootstrap";
import { logger } from "@/core/logging/logger";
import { ServiceRouteGuard } from "@/shared/components/ServiceRouteGuard";

LogBox.ignoreLogs([
  "Can't perform a React state update on a component that hasn't mounted yet",
]);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    AppBootstrap.init().catch((err) => {
      logger.error("[RootLayout] AppBootstrap initialization failed:", { error: err });
    });
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch((err) => {
        logger.debug("[RootLayout] SplashScreen hide fallback", { error: err });
      });
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          {/* Single app-wide status-bar default. Screens with dark headers use FocusAwareStatusBar. */}
          <RootStatusBar />
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="service/gst" />
          <Stack.Screen name="service/gst-registration" />
          <Stack.Screen name="service/gst-filing" />
          <Stack.Screen name="service/gst-compliance" />
          <Stack.Screen name="service/gst-compliance-success" />
          <Stack.Screen name="service/gst-amendment" />
          <Stack.Screen name="service/gst-cancellation" />
          <Stack.Screen name="service/gst-certificate" />
          <Stack.Screen name="service/itr" />
          <Stack.Screen name="service/itr-filing" />
          <Stack.Screen name="service/itr-income-info" />
          <Stack.Screen name="service/itr-deductions" />
          <Stack.Screen name="service/itr-documents" />
          <Stack.Screen name="service/itr-review" />
          <Stack.Screen name="service/itr-filed" />
          <Stack.Screen name="service/itr-success" />
          <Stack.Screen name="service/application-status" />
          <Stack.Screen name="service/tds-refund" />
          <Stack.Screen name="service/tds-form" />
          <Stack.Screen name="service/tds-checklist" />
          <Stack.Screen name="service/tds-estimate" />
          <Stack.Screen name="service/tds-payment" />
          <Stack.Screen name="service/tds-submitted" />
          <Stack.Screen name="service/tds-status" />
          <Stack.Screen name="service/previous-year-itr" />
          <Stack.Screen name="service/previous-year-itr-details" />
          <Stack.Screen name="service/previous-year-charges" />
          <Stack.Screen name="service/previous-year-documents" />
          <Stack.Screen name="service/previous-year-success" />
          <Stack.Screen name="service/previous-year-submitted" />
          <Stack.Screen name="service/revised-itr" />
          <Stack.Screen name="service/revised-itr-reason" />
          <Stack.Screen name="service/revised-itr-update" />
          <Stack.Screen name="service/revised-itr-documents" />
          <Stack.Screen name="service/revised-itr-review" />
          <Stack.Screen name="service/tax-notice-assistance" />
          <Stack.Screen name="service/tax-notice-summary" />
          <Stack.Screen name="service/tax-notice-documents" />
          <Stack.Screen name="service/tax-notice-review" />
          <Stack.Screen name="service/tax-notice-status" />
          <Stack.Screen name="service/loans" />
          <Stack.Screen name="service/[id]" />
          <Stack.Screen name="application/[id]" />
          <Stack.Screen name="payment/[id]" />
          <Stack.Screen name="chat/support" />
          <Stack.Screen name="chat/[id]" />
          <Stack.Screen name="notifications" />
          </Stack>
          <ServiceRouteGuard />
          <CompleteProfileModal />
          <AppUpdateBanner />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
