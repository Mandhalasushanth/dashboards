import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { styles } from './StepApplicationReceipt.styles';

export const StepApplicationReceipt: React.FC = () => {
  const draft = useCompanyRegistrationStore((state) => state.draft);
  const receipt = draft.receipt || {
    applicationId: draft.id,
    companyName: draft.company.proposedName1,
    companyType: draft.company.companyType,
    appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    totalAmount: draft.feeBreakdown.totalAmount,
    paymentStatus: 'Paid' as const,
    paymentMethod: 'UPI',
    transactionId: 'TXN-84920194',
  };

  const handleDownloadPdf = () => {
    Alert.alert('Download Receipt', `Application receipt PDF for ${receipt.applicationId} saved to downloads.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Finsolz Application & Payment Receipt</Text>
      <Text style={styles.subheading}>This receipt confirms successful submission to Finsolz and payment received for application processing.</Text>

      {/* Printable Receipt Paper Card */}
      <View style={styles.receiptPaper}>
        <View style={styles.logoRow}>
          <View>
            <Text style={styles.brandName}>Finsolz Finsolz</Text>
            <Text style={styles.brandSub}>Corporate Incorporation Desk</Text>
          </View>
          <Text style={styles.receiptTitle}>RECEIPT</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Application Reference ID</Text>
          <Text style={styles.dataValue}>{receipt.applicationId}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Proposed Company Name</Text>
          <Text style={styles.dataValue}>{receipt.companyName}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Company Legal Structure</Text>
          <Text style={styles.dataValue}>{receipt.companyType}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Application Date</Text>
          <Text style={styles.dataValue}>{receipt.appliedDate}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Transaction ID</Text>
          <Text style={styles.dataValue}>{receipt.transactionId}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Payment Mode</Text>
          <Text style={styles.dataValue}>{receipt.paymentMethod}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { fontWeight: '700' }]}>Total Amount Paid</Text>
          <Text style={[styles.dataValue, { fontSize: 16, color: '#083B75' }]}>
            ₹{receipt.totalAmount.toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={[styles.dataRow, { marginTop: 6 }]}>
          <Text style={styles.dataLabel}>Payment Status</Text>
          <View style={styles.paidBadge}>
            <Text style={styles.paidText}>{receipt.paymentStatus}</Text>
          </View>
        </View>
      </View>

      {/* Download PDF Action */}
      <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadPdf} activeOpacity={0.8}>
        <Ionicons name="download-outline" size={20} color="#FFFFFF" />
        <Text style={styles.downloadBtnText}>Download PDF Receipt</Text>
      </TouchableOpacity>
    </View>
  );
};
