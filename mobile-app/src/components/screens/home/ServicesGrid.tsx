/**
 * ServicesGrid
 * Redesigned Services section displaying 2-column alternating pastel 3D cards
 * matching the Finsolz reference design (Incorporation, GST, ITR, Projects, Loans, Insurance).
 */

import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import {
  styles,
  getServiceCardBorderThemedStyle,
  getServiceLabelThemedStyle,
  getServiceDescThemedStyle,
  getServiceArrowBtnThemedStyle,
} from "@/styles/app/(main)/home.styles";
import type { DashboardServiceTile } from "@/types/home.types";

const PEACH_GRADIENT_LIGHT = ["#FFFFFF", "#FFF7F0", "#FFEAD8"] as const;
const PEACH_GRADIENT_DARK = ["#261E1A", "#33241A", "#3D2B1F"] as const;

const BLUE_GRADIENT_LIGHT = ["#FFFFFF", "#F5F8FF", "#DEEDFE"] as const;
const BLUE_GRADIENT_DARK = ["#1A2233", "#1E2A42", "#24324F"] as const;

const PEACH_SERVICES = new Set(["incorporation", "projects", "loans"]);

function getServiceGradient(id: string, isDark: boolean): readonly [string, string, string] {
  const isPeach = PEACH_SERVICES.has(id);
  if (isDark) {
    return isPeach ? PEACH_GRADIENT_DARK : BLUE_GRADIENT_DARK;
  }
  return isPeach ? PEACH_GRADIENT_LIGHT : BLUE_GRADIENT_LIGHT;
}

interface ServiceCardProps {
  service: DashboardServiceTile;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>;
  onPress: (tile: DashboardServiceTile) => void;
}

export function ServiceCard({
  service,
  isDark,
  colors,
  onPress,
}: ServiceCardProps) {
  const isFull = Boolean(service.isFullWidth);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(service)}
      testID={`service-card-${service.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${service.label}: ${service.description.replace(/\n/g, " ")}`}
      style={[
        isFull ? styles.serviceCardFullWidth : styles.serviceCard2Col,
        getServiceCardBorderThemedStyle(
          isDark,
          colors,
          service.borderColor
        ),
      ]}
    >
      <LinearGradient
        colors={getServiceGradient(service.id, isDark)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.serviceCardGradient}
      />
      <View
        style={
          isFull
            ? styles.serviceCardContentFull
            : styles.serviceCardContent2Col
        }
      >
        <View>
          <Text
            style={[
              styles.serviceTitle,
              getServiceLabelThemedStyle(isDark, colors),
            ]}
            numberOfLines={1}
          >
            {service.label}
          </Text>
          <Text
            style={[
              styles.serviceDesc,
              getServiceDescThemedStyle(isDark, colors),
            ]}
            numberOfLines={isFull ? 1 : 2}
          >
            {service.description}
          </Text>
        </View>

        <View
          style={[
            styles.serviceArrowBtn,
            getServiceArrowBtnThemedStyle(isDark, colors),
          ]}
        >
          <Ionicons
            name="arrow-forward"
            size={14}
            color={service.arrowColor}
          />
        </View>
      </View>

      <Image
        source={service.image}
        style={
          isFull
            ? styles.serviceIllustrationFull
            : styles.serviceIllustration2Col
        }
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

interface ServicesGridProps {
  services: DashboardServiceTile[];
  isDark: boolean;
  colors: ReturnType<typeof useTheme>;
  onPress: (tile: DashboardServiceTile) => void;
}

export function ServicesGrid({
  services,
  isDark,
  colors,
  onPress,
}: ServicesGridProps) {
  const twoColItems = services.filter((s) => !s.isFullWidth);
  const fullWidthItems = services.filter((s) => s.isFullWidth);

  // Pure functional chunking without imperative for/while loops (Rule 2)
  const rows = twoColItems.reduce<DashboardServiceTile[][]>((acc, item, index) => {
    if (index % 2 === 0) {
      acc.push([item]);
    } else {
      acc[acc.length - 1].push(item);
    }
    return acc;
  }, []);

  return (
    <View style={styles.servicesContainer}>
      {rows.map((row, rowIndex) => (
        <View key={`services-row-${rowIndex}`} style={styles.servicesRow}>
          {row.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isDark={isDark}
              colors={colors}
              onPress={onPress}
            />
          ))}
        </View>
      ))}

      {fullWidthItems.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          isDark={isDark}
          colors={colors}
          onPress={onPress}
        />
      ))}
    </View>
  );
}
