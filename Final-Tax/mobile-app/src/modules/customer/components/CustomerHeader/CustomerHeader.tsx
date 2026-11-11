import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../../hooks/use-theme';
import {
  styles,
  getTitleThemedStyle,
  getSubtitleThemedStyle,
} from './CustomerHeader.styles';

export const CustomerHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const colors = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, getTitleThemedStyle(colors.text)]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, getSubtitleThemedStyle(colors.textSecondary)]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default CustomerHeader;
