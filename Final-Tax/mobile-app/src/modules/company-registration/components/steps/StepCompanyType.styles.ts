import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 12,
    color: '#82909F',
    marginBottom: 16,
    lineHeight: 16,
  },
  card: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: '#FF8A00',
    backgroundColor: '#FFF8F0',
    borderWidth: 1.5,
  },
  cardUnselected: {
    borderColor: '#E7EDF2',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconContainerSelected: {
    backgroundColor: '#FFF0DB',
  },
  iconContainerUnselected: {
    backgroundColor: '#F1F5F9',
  },
  contentCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#263238',
  },
  titleSelected: {
    color: '#263238',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#FFF0DB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FF8A00',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 10,
    color: '#82909F',
    marginTop: 2,
    lineHeight: 14,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioOuterSelected: {
    borderColor: '#FF8A00',
  },
  radioOuterUnselected: {
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF8A00',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '500',
  },
});
