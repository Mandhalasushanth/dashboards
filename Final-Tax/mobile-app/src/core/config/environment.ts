export interface EnvironmentConfig {
  apiUrl: string;
  environment: "development" | "staging" | "production";
  enableAnalytics: boolean;
  enableLogging: boolean;
  timeoutMs: number;
}

export const Environment: EnvironmentConfig = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL?.trim() || "",

  environment: (process.env.NODE_ENV as any) || "development",
  enableAnalytics: process.env.NODE_ENV === "production",
  enableLogging: process.env.NODE_ENV !== "production",
  timeoutMs: 15000,
};

export default Environment;
