import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TDS_REQUIRED_DOCUMENTS } from "../../mock/tdsData";
import { TdsDocumentItem } from "../../types/tds.types";
import { styles } from "./TdsDocumentsGrid.styles";

export const TdsDocumentsGrid: React.FC = () => {
  const renderIcon = (type: TdsDocumentItem["iconType"]) => {
    switch (type) {
      case "card":
        return <Ionicons name="card-outline" size={18} color="#0B1F3A" />;
      case "aadhaar":
        return <Ionicons name="finger-print-outline" size={18} color="#0B1F3A" />;
      case "form16":
        return <Ionicons name="document-text-outline" size={18} color="#0B1F3A" />;
      case "chart":
        return <Ionicons name="bar-chart-outline" size={18} color="#0B1F3A" />;
      case "document":
        return <Ionicons name="newspaper-outline" size={18} color="#0B1F3A" />;
      case "bank":
        return <Ionicons name="business-outline" size={18} color="#0B1F3A" />;
      case "salary":
        return <Ionicons name="receipt-outline" size={18} color="#0B1F3A" />;
      case "more":
        return <Ionicons name="add-circle-outline" size={20} color="#F97316" />;
      default:
        return <Ionicons name="document-outline" size={18} color="#0B1F3A" />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Documents Required</Text>

      <View style={styles.grid}>
        {TDS_REQUIRED_DOCUMENTS.map((doc) => {
          if (doc.isMore) {
            return (
              <View key={doc.id} style={[styles.card, styles.moreCard]}>
                <View style={styles.moreIconWrapper}>
                  {renderIcon(doc.iconType)}
                </View>
                <Text style={styles.moreText}>More</Text>
              </View>
            );
          }

          return (
            <View key={doc.id} style={styles.card}>
              <View style={styles.iconBox}>
                {renderIcon(doc.iconType)}
              </View>
              <Text style={styles.docTitle} numberOfLines={2}>
                {doc.title}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
