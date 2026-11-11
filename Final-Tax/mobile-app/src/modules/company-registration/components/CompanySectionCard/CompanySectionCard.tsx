import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { styles } from './CompanySectionCard.styles';

export interface CompanySectionCardProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  title?: string;
  subtitle?: string;
  description?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CompanySectionCard: React.FC<CompanySectionCardProps> = ({
  iconName,
  title,
  subtitle,
  description,
  headerRight,
  children,
  style,
}) => {
  const displaySubtitle = subtitle || description;

  return (
    <View style={[styles.sectionCard, style]}>
      {(title || iconName) && (
        <View style={styles.sectionHeader}>
          {iconName && (
            <View style={styles.sectionIconBox}>
              <Ionicons name={iconName} size={18} color="#FF8A00" />
            </View>
          )}
          <View style={styles.sectionTitleWrap}>
            {title ? <Text style={styles.sectionMainTitle}>{title}</Text> : null}
            {displaySubtitle ? <Text style={styles.sectionSubtitle}>{displaySubtitle}</Text> : null}
          </View>
          {headerRight}
        </View>
      )}
      {children}
    </View>
  );
};

export default CompanySectionCard;
