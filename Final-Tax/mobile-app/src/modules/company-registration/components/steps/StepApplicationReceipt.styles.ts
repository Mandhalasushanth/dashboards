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
    marginBottom: 16,
  },
  receiptPaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 20,
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#083B75',
    paddingBottom: 12,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#083B75',
  },
  brandSub: {
    fontSize: 11,
    color: '#64748B',
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  dataLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  dataValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  paidBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paidText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#083B75',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
  },
  downloadBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
