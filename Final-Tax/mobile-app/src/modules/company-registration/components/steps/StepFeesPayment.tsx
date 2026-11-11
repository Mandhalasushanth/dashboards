import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { CompanySectionCard } from '../CompanySectionCard/CompanySectionCard';
import { styles } from './StepFeesPayment.styles';

const PAYMENT_METHODS = [
  { id: 'UPI', title: 'UPI (GPay / PhonePe / Paytm / BHIM)', icon: 'qr-code-outline' },
  { id: 'Card', title: 'Credit / Debit Card', icon: 'card-outline' },
  { id: 'NetBanking', title: 'Net Banking (All Indian Banks)', icon: 'business-outline' },
];

export const StepFeesPayment: React.FC = () => {
  const feeBreakdown = useCompanyRegistrationStore((state) => state.draft.feeBreakdown);
  const processPayment = useCompanyRegistrationStore((state) => state.processPayment);
  const setStep = useCompanyRegistrationStore((state) => state.setStep);
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePay = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Simulate submission / API delay
    setTimeout(() => {
      processPayment(selectedMethod);
      setIsSubmitting(false);
      setStep(9); // Navigate to Application Submitted Successfully screen
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Fees & Payment Breakdown</Text>
      <Text style={styles.subheading}>Review itemized MCA government filing fees and Finsolz professional charges.</Text>

      {/* Fee Itemization Card */}
      <CompanySectionCard
        iconName="receipt-outline"
        title="Fee Itemization"
        subtitle="Itemized government and professional charges"
      >
        <View style={styles.row}>
          <Text style={styles.label}>Finsolz Professional Fee</Text>
          <Text style={styles.value}>₹{feeBreakdown.professionalFee.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>GST (18%)</Text>
          <Text style={styles.value}>₹{feeBreakdown.gstAmount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Estimated / Applicable MCA Statutory Charges</Text>
          <Text style={styles.value}>₹{feeBreakdown.statutoryCharges.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total Payable Amount</Text>
          <Text style={styles.totalValue}>₹{feeBreakdown.totalAmount.toLocaleString('en-IN')}</Text>
        </View>
      </CompanySectionCard>
      <Text style={{ fontSize: 12, color: '#64748B', marginTop: -4, marginBottom: 16 }}>
        * ₹1,500 represents estimated / applicable MCA government filing fee and stamp duty charges.
      </Text>

      {/* Payment Method Selection */}
      <CompanySectionCard
        iconName="card-outline"
        title="Select Payment Method"
        subtitle="Choose your preferred payment mode"
      >
        {PAYMENT_METHODS.map((m) => {
          const isSelected = selectedMethod === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodCard, isSelected && styles.methodCardSelected]}
              onPress={() => setSelectedMethod(m.id)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name={m.icon as any} size={22} color={isSelected ? '#083B75' : '#64748B'} />
                <Text style={styles.methodTitle}>{m.title}</Text>
              </View>
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={isSelected ? '#083B75' : '#94A3B8'}
              />
            </TouchableOpacity>
          );
        })}
      </CompanySectionCard>

      {/* Pay CTA */}
      <TouchableOpacity 
        style={[styles.payBtn, isSubmitting && { opacity: 0.7 }]} 
        onPress={handlePay} 
        activeOpacity={0.8}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.payBtnText}>Pay ₹{feeBreakdown.totalAmount.toLocaleString('en-IN')} & Submit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
