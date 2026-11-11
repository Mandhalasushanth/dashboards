import { StyleSheet } from "react-native";

// Brand Color Palette
export const BRAND = {
  navy: "#0F1D36",
  orange: "#F58220",
  white: "#FFFFFF",
  streakBlue: "#7FB3FF",
} as const;

export interface ParticleItem {
  id: number;
  angle: number;
  startDist: number;
  endDist: number;
  size: number;
  color: string;
  delay: number;
}

// Inward converging particles and subtle light streaks
export const PARTICLES: ParticleItem[] = [
  { id: 1, angle: 20, startDist: 220, endDist: 65, size: 3.0, color: BRAND.orange, delay: 0 },
  { id: 2, angle: 60, startDist: 250, endDist: 85, size: 2.2, color: BRAND.white, delay: 50 },
  { id: 3, angle: 105, startDist: 200, endDist: 60, size: 3.2, color: BRAND.streakBlue, delay: 20 },
  { id: 4, angle: 150, startDist: 270, endDist: 95, size: 2.4, color: BRAND.orange, delay: 80 },
  { id: 5, angle: 190, startDist: 230, endDist: 75, size: 2.0, color: BRAND.white, delay: 40 },
  { id: 6, angle: 230, startDist: 260, endDist: 90, size: 3.4, color: BRAND.streakBlue, delay: 70 },
  { id: 7, angle: 275, startDist: 210, endDist: 70, size: 2.0, color: BRAND.orange, delay: 15 },
  { id: 8, angle: 320, startDist: 280, endDist: 100, size: 2.8, color: BRAND.white, delay: 65 },
  { id: 9, angle: 40, startDist: 190, endDist: 50, size: 2.0, color: BRAND.streakBlue, delay: 90 },
  { id: 10, angle: 130, startDist: 240, endDist: 80, size: 2.6, color: BRAND.white, delay: 45 },
  { id: 11, angle: 210, startDist: 185, endDist: 55, size: 3.0, color: BRAND.orange, delay: 100 },
  { id: 12, angle: 300, startDist: 235, endDist: 75, size: 2.2, color: BRAND.streakBlue, delay: 35 },
  { id: 13, angle: 80, startDist: 265, endDist: 105, size: 2.4, color: BRAND.white, delay: 75 },
  { id: 14, angle: 255, startDist: 215, endDist: 65, size: 2.0, color: BRAND.orange, delay: 55 },
];

export const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BRAND.navy, // Solid #0F1D36
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  particlesContainer: {
    position: "absolute",
    width: 0,
    height: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  particle: {
    position: "absolute",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
  },
  softOrangeGlow: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(245, 130, 32, 0.22)",
    shadowColor: BRAND.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 36,
    elevation: 8,
  },
  mainCluster: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: 155,
    height: 155,
  },
  sheenOverlay: {
    position: "absolute",
    top: -50,
    bottom: -50,
    width: 85,
  },
  typographyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  brandTitle: {
    color: BRAND.white,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    textAlign: "center",
  },
  subtitle: {
    color: BRAND.orange,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 5.5,
    textTransform: "uppercase",
    marginTop: 6,
    textAlign: "center",
    opacity: 0.95,
  },
  blackoutOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000000",
  },
  iconFallbackContainer: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  iconFallbackImage: {
    width: 60,
    height: 60,
  },
});
