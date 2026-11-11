import React from "react";
import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TdsDocIconType } from "../../../types/tdsDocuments.types";
import { styles } from "./TdsDocIcon.styles";

interface TdsDocIconProps {
  type: TdsDocIconType;
}

export const TdsDocIcon: React.FC<TdsDocIconProps> = ({ type }) => {
  const getIconConfig = () => {
    switch (type) {
      case "pan":
        return { name: "card" as const, color: "#0284C7", style: styles.panBg };
      case "form16":
        return { name: "document-text" as const, color: "#DB2777", style: styles.form16Bg };
      case "form16a":
        return { name: "document-attach" as const, color: "#9333EA", style: styles.form16aBg };
      case "ais":
        return { name: "desktop" as const, color: "#0284C7", style: styles.aisBg };
      case "tis":
        return { name: "receipt" as const, color: "#16A34A", style: styles.tisBg };
      case "bank_statements":
        return { name: "business" as const, color: "#D97706", style: styles.bankStatementsBg };
      case "prev_itr":
        return { name: "calendar" as const, color: "#7C3AED", style: styles.prevItrBg };
      case "tds_certs":
        return { name: "shield-checkmark" as const, color: "#16A34A", style: styles.tdsCertsBg };
      case "income_proofs":
        return { name: "cash" as const, color: "#EA580C", style: styles.incomeProofsBg };
      default:
        return { name: "document-outline" as const, color: "#64748B", style: styles.defaultBg };
    }
  };

  const config = getIconConfig();

  return (
    <View style={[styles.container, config.style]}>
      <Ionicons name={config.name} size={22} color={config.color} />
    </View>
  );
};

export default TdsDocIcon;
