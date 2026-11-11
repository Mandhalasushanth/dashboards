import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MissingInfoItem } from "../../itr-filing/types/itrFiling.types";
import { styles } from "./MissingInfoBanner.styles";

interface MissingInfoBannerProps {
  items: MissingInfoItem[];
  onResolve: (targetStep: number) => void;
}

export const MissingInfoBanner: React.FC<MissingInfoBannerProps> = ({
  items,
  onResolve,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="alert-circle" size={20} color="#B45309" />
        <Text style={styles.title}>
          Before we continue: {items.length} items require your attention
        </Text>
      </View>

      <Text style={styles.description}>
        Finsolz identified the following pending items for your return. Please review or confirm them prior to submission.
      </Text>

      <View style={styles.itemsList}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Ionicons
                name={item.severity === "REQUIRED" ? "close-circle" : "warning"}
                size={16}
                color={item.severity === "REQUIRED" ? "#DC2626" : "#D97706"}
              />
              <Text style={styles.itemText}>{item.title}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.resolveBtn}
              onPress={() => onResolve(item.targetStep)}
            >
              <Text style={styles.resolveBtnText}>{item.actionLabel || "Resolve"}</Text>
              <Ionicons name="chevron-forward" size={12} color="#EA580C" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};
