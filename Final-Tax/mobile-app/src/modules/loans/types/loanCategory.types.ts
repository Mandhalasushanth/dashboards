import type { ComponentProps } from "react";
import type { ImageSourcePropType } from "react-native";
import type Ionicons from "@expo/vector-icons/Ionicons";

export type LoanCategoryId =
  | "business-loan"
  | "personal-loan"
  | "home-loan"
  | "property-loan"
  | "vehicle-loan"
  | "machinery-loan"
  | "msme-loan"
  | "project-finance";

export interface LoanCategory {
  id: LoanCategoryId;
  title: string;
  description: string;
  image: ImageSourcePropType;
  icon?: ComponentProps<typeof Ionicons>["name"];
  tint?: string;
  tintBg?: string;
}
