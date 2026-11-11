import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { ItrCategoryType } from "../../types/itrFiling.types";
import {
  ALL_CATEGORIES,
  CategoryOption,
} from "../../constants/itrCategories";
import { styles } from "./Step0CategorySelect.styles";

export { ALL_CATEGORIES, CategoryOption };

interface Step0CategorySelectProps {
  selectedCategory: ItrCategoryType | null;
  accountType?: string;
  onSelectCategory: (category: ItrCategoryType) => void;
  onStartApplication: () => void;
}

export const Step0CategorySelect: React.FC<Step0CategorySelectProps> = ({
  selectedCategory,
  onSelectCategory,
  onStartApplication,
}) => {
  const currentSelected = useMemo(() => {
    if (selectedCategory && ALL_CATEGORIES.some((c) => c.id === selectedCategory)) {
      return selectedCategory;
    }
    return null;
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerIconBox}>
              <Ionicons name="calculator-outline" size={24} color={BrandColors.PRIMARY_ORANGE} />
            </View>
            <View style={styles.headerTitleCol}>
              <Text style={styles.headerTitle}>ITR Filing</Text>
              <Text style={styles.headerCategoryTag}>Select Primary Income</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Select your main source of income. We will automatically determine the applicable ITR form for you.
          </Text>
        </View>

        {/* 2-Column Grid */}
        <View style={styles.gridContainer}>
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = currentSelected === cat.id;

            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.8}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => onSelectCategory(cat.id)}
              >
                {isSelected && (
                  <View style={styles.cardCheckmarkBox}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>
                )}

                <View
                  style={[
                    styles.cardIconBox,
                    isSelected && styles.cardIconBoxSelected,
                  ]}
                >
                  <Ionicons
                    name={cat.iconName as any}
                    size={20}
                    color={isSelected ? BrandColors.PRIMARY_ORANGE : "#083B75"}
                  />
                </View>

                <View>
                  <Text
                    style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}
                    numberOfLines={1}
                  >
                    {cat.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardSubtitle,
                      isSelected && styles.cardSubtitleSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {cat.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Start Application Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!selectedCategory}
          style={[styles.startBtn, !selectedCategory && styles.startBtnDisabled]}
          onPress={() => {
            if (selectedCategory) {
              onStartApplication();
            }
          }}
        >
          <Text style={[styles.startBtnText, !selectedCategory && styles.startBtnTextDisabled]}>
            Start Application
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Step0CategorySelect;
