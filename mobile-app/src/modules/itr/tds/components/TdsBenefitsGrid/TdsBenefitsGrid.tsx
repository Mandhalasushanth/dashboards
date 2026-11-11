import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TDS_BENEFITS } from "../../mock/tdsData";
import { styles } from "./TdsBenefitsGrid.styles";

export const TdsBenefitsGrid: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Why choose Finsolz?</Text>

      <View style={styles.grid}>
        {TDS_BENEFITS.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.iconName} size={20} color="#0B1F3A" />
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
