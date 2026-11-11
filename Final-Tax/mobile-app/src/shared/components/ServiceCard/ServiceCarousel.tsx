import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import type { ServiceCategory, ServiceCategoryId } from "@/shared/types/domain";

const { width } = Dimensions.get("window");
export const CARD_WIDTH = width - 40;

const DEFAULT_CATEGORIES: ServiceCategory[] = [
  { id: "GST", name: "GST Services", icon: "receipt-outline", count: 6, color: "#083B75" },
  { id: "ITR", name: "Income Tax", icon: "document-text-outline", count: 5, color: "#0B5ED7" },
  { id: "LOANS", name: "Loan Services", icon: "cash-outline", count: 5, color: "#059669" },
  { id: "INSURANCE", name: "Insurance", icon: "shield-checkmark-outline", count: 5, color: "#FF7A00" },
  { id: "BUSINESS", name: "Business Setup", icon: "business-outline", count: 5, color: "#7C3AED" },
];

export interface ServiceCarouselProps {
  onExplore: (categoryId: ServiceCategoryId) => void;
  categories?: ServiceCategory[];
}

export function ServiceCarousel({ onExplore, categories = DEFAULT_CATEGORIES }: ServiceCarouselProps) {
  const colors = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<ServiceCategory>>(null);

  const getSubServices = (catId: ServiceCategoryId): string[] => {
    switch (catId) {
      case "GST":
        return ["Registration", "Filing", "Compliance", "Amendment", "Certificate"];
      case "ITR":
        return ["ITR Filing", "TDS Refund", "Previous Year ITR", "Revised ITR", "Tax Notice Assistance"];
      case "LOANS":
        return ["Business Loan", "Personal Loan", "Home Loan", "Property Loan", "Vehicle Loan"];
      case "INSURANCE":
        return ["Health Insurance", "Life Insurance", "Motor Insurance", "Home Insurance", "Business Insurance"];
      case "BUSINESS":
        return ["Business Registration", "Company / LLP Incorporation", "Udyam / MSME Registration", "ROC Compliance", "Accounting & Bookkeeping"];
      default:
        return [];
    }
  };

  const getSubTitleText = (catId: ServiceCategoryId): string => {
    switch (catId) {
      case "GST":
        return "GST Registration & Filing Services";
      case "ITR":
        return "Income Tax Services";
      case "LOANS":
        return "Personal & Business Loans";
      case "INSURANCE":
        return "Personal & Commercial";
      case "BUSINESS":
        return "Business & Compliance";
      default:
        return "";
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / (width - 24));
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={categories}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <View style={[styles.cardHeader, { backgroundColor: colors.primary }]}>
              <View style={styles.iconBg}>
                <Ionicons name={item.icon} size={28} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>{item.id}</Text>
              <Text style={styles.cardSubTitle}>{getSubTitleText(item.id)}</Text>
            </View>

            <View style={styles.body}>
              {getSubServices(item.id).map((service, idx) => (
                <View key={idx} style={styles.checkRow}>
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                  <Text style={[styles.bulletItem, { color: colors.text }]}>
                    {service}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onExplore(item.id)}
              style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.exploreText}>Explore</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.indicatorContainer}>
        {categories.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicatorDot,
              {
                backgroundColor: activeIndex === index ? colors.orange : colors.border,
                width: activeIndex === index ? 16 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  cardHeader: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  cardSubTitle: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  body: {
    padding: 20,
    gap: 8,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bulletItem: {
    fontSize: 14,
    fontWeight: "600",
  },
  exploreBtn: {
    height: 44,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  exploreText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    gap: 6,
  },
  indicatorDot: {
    height: 8,
    borderRadius: 4,
  },
});

export default ServiceCarousel;
