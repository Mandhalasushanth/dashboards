import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#083B75',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7EDF2',
    backgroundColor: '#FFFFFF',
  },
  optionChipSelected: {
    borderColor: '#FF8A00',
    backgroundColor: '#FFF8F0',
    borderWidth: 1.5,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#263238',
  },
  optionChipTextSelected: {
    color: '#FF8A00',
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
});
