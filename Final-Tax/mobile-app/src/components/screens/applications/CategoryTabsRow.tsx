/**
 * CategoryTabsRow
 * The horizontal tab strip (All / GST / ITR / Loans) inside the navy
 * header card on the Applications screen.
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles as appStyles } from "@/styles/app/(main)/applications.styles";
import { CategoryTabIcon } from "./ApplicationIcons";
import type { ServiceCategoryId } from "@/types/domain";

const styles = appStyles as any;
const getCategoryTabLabelStyle = (isActive: boolean) => ({
  color: isActive ? "#FF5722" : "#94A3B8",
});

export const CATEGORY_TABS: { id: "ALL" | ServiceCategoryId; label: string }[] = [
  { id: "ALL",   label: "All"   },
  { id: "GST",   label: "GST"   },
  { id: "ITR",   label: "ITR"   },
  { id: "LOANS", label: "Loans" },
];

interface CategoryTabsRowProps {
  selected: "ALL" | ServiceCategoryId;
  onSelect: (id: "ALL" | ServiceCategoryId) => void;
}

export function CategoryTabsRow({ selected, onSelect }: CategoryTabsRowProps) {
  return (
    <View style={styles.categoryCardWrapper}>
      <View style={styles.categoryTabsRow}>
        {CATEGORY_TABS.map((tab) => {
          const isActive = selected === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => onSelect(tab.id)}
              style={styles.categoryTabItem}
            >
              <View
                style={[
                  styles.categoryIconWrap,
                  isActive && styles.activeCategoryIconWrap,
                ]}
              >
                <CategoryTabIcon id={tab.id} isActive={isActive} />
              </View>
              <Text
                style={[styles.categoryTabLabel, getCategoryTabLabelStyle(isActive)]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {tab.label}
              </Text>
              <View
                style={
                  isActive
                    ? styles.activeTabIndicator
                    : styles.inactiveTabIndicator
                }
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
