import { StyleSheet } from "react-native";

export const landingStyles = StyleSheet.create({
  // LandingScreen styles
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    flex: 1,
    justifyContent: "space-between",
  },
  contentPadding: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: "space-between",
  },
  headingSection: {
    marginTop: 10,
    marginBottom: 4,
  },
  headingPrimary: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0C2340",
    letterSpacing: -0.4,
    lineHeight: 29,
  },
  headingAccent: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0052FF",
    letterSpacing: -0.4,
    lineHeight: 29,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 18.5,
    color: "#5A6E85",
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  ctaSection: {
    marginTop: 14,
    width: "100%",
  },

  // HeroSection styles
  heroContainer: {
    width: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  heroImage: {
    width: "100%",
    aspectRatio: 473 / 410,
  },

  // ServicePills styles
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    width: "100%",
  },
  pill: {
    backgroundColor: "#E6F4FE",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    alignSelf: "flex-start",
  },
  pillText: {
    color: "#0052FF",
    fontSize: 12.5,
    fontWeight: "600",
    letterSpacing: -0.1,
  },

  // WhyChooseSection styles
  whyChooseContainer: {
    width: "100%",
    marginTop: 14,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D0E3FA",
  },
  dividerText: {
    color: "#0052FF",
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginHorizontal: 8,
  },
  benefitsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    width: "100%",
  },
  benefitCard: {
    flex: 1,
    backgroundColor: "#EEF6FE",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  benefitTextWrapper: {
    flexShrink: 1,
  },
  benefitText: {
    color: "#0052FF",
    fontSize: 10.5,
    fontWeight: "700",
    lineHeight: 13.5,
  },

  // GetStartedButton styles
  getStartedButton: {
    backgroundColor: "#F97316",
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  getStartedButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  arrowContainer: {
    position: "absolute",
    right: 18,
  },
});

export default landingStyles;
