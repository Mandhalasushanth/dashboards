import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../../../hooks/use-theme';
import { styles, getThemedStyles } from './AuthCard.styles';

export const AuthCard: React.FC<ViewProps> = ({ children, style, ...props }) => {
  const colors = useTheme();
  const themed = getThemedStyles(colors);

  return (
    <View style={[styles.card, themed.card, style]} {...props}>
      {children}
    </View>
  );
};

export default AuthCard;
