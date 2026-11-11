import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
  },
});

export const getThemedStyles = (colors: { backgroundElement: string }) => ({
  card: {
    backgroundColor: colors.backgroundElement,
  },
});
