import React from "react";
import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PreviousYearDocIconType } from "../../../types/document.types";
import { styles } from "./PreviousYearDocIcon.styles";

interface PreviousYearDocIconProps {
  type: PreviousYearDocIconType;
}

export const PreviousYearDocIcon: React.FC<PreviousYearDocIconProps> = ({ type }) => {
  const getIconName = () => {
    switch (type) {
      case "pan":
        return "person-circle-outline" as const;
      case "aadhaar":
        return "card-outline" as const;
      case "form16":
        return "document-text-outline" as const;
      case "ais":
        return "bar-chart-outline" as const;
      case "bank":
        return "business-outline" as const;
      case "investment":
        return "pie-chart-outline" as const;
      default:
        return "document-outline" as const;
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name={getIconName()} size={22} color="#0B1F3A" />
    </View>
  );
};
