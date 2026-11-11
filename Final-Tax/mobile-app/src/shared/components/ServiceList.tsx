import React from "react";
import { StyleSheet, FlatList, ViewStyle, StyleProp } from "react-native";
import { Spacing } from "@/shared/theme";
import { ServiceCard, ServiceCardData } from "./ServiceCard";

interface ServiceListProps {
  items: ServiceCardData[];
  onItemPress?: (item: ServiceCardData) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  ListHeaderComponent?: React.ReactElement | null;
}

export const ServiceList: React.FC<ServiceListProps> = ({
  items,
  onItemPress,
  style,
  contentContainerStyle,
  ListHeaderComponent,
}) => {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      style={[styles.list, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      renderItem={({ item }) => (
        <ServiceCard item={item} onPress={onItemPress} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
});
