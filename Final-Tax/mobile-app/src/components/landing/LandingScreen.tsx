import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeroSection } from "./HeroSection";
import { ServicePills } from "./ServicePills";
import { WhyChooseSection } from "./WhyChooseSection";
import { GetStartedButton } from "./GetStartedButton";
import { landingStyles as styles } from "./landing.styles";

export function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleNavigateToLogin = () => {
    router.push("/(auth)/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F4FAFF" }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top,
            paddingBottom: Math.max(insets.bottom + 8, 28),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.cardWrapper}>
          {/* Top Hero Banner - Edge to Edge Full Width */}
          <HeroSection />

          {/* Bottom Financial Services Content */}
          <View style={styles.contentPadding}>
            {/* Main Heading */}
            <View style={styles.headingSection}>
              <Text style={styles.headingPrimary}>Your Financial Services,</Text>
              <Text style={styles.headingAccent}>Simplified</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Filing your taxes and managing business compliances shouldn't be
              complicated. Experience professional, CA-backed financial solutions
              from the comfort of your home.
            </Text>

            {/* Service Pills / Highlights */}
            <ServicePills />

            {/* Why Choose Section */}
            <WhyChooseSection />

            {/* Get Started Button */}
            <View style={styles.ctaSection}>
              <GetStartedButton onPress={handleNavigateToLogin} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default LandingScreen;
