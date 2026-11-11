import React, { useEffect, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { CompanySectionCard } from '../CompanySectionCard/CompanySectionCard';
import {
  validateCapitalNumeric,
  EMOJI_REGEX,
  UNSUPPORTED_CHARS_MSG,
  isOpcCompanyType,
} from '../../validation/companySchema';
import { styles } from './StepCapitalShareholding.styles';

export const StepCapitalShareholding: React.FC = () => {
  const company = useCompanyRegistrationStore((state) => state.draft.company);
  const directors = useCompanyRegistrationStore((state) => state.draft.directors);
  const updateDetails = useCompanyRegistrationStore((state) => state.updateCompanyDetails);
  const updateDirector = useCompanyRegistrationStore((state) => state.updateDirector);
  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);
  const setFieldErrors = useCompanyRegistrationStore((state) => state.setFieldErrors);

  const [rawAuthCapital, setRawAuthCapital] = useState<string | undefined>(undefined);
  const [rawFaceValue, setRawFaceValue] = useState<string | undefined>(undefined);
  const [rawShares, setRawShares] = useState<Record<string, string>>({});

  const displayAuthCapital = rawAuthCapital !== undefined ? rawAuthCapital : (company.authorizedCapital ? String(company.authorizedCapital) : '');
  const displayFaceValue = rawFaceValue !== undefined ? rawFaceValue : (company.faceValuePerShare ? String(company.faceValuePerShare) : '');

  const isOpc = isOpcCompanyType(company.companyType);
  const faceValue = Number(company.faceValuePerShare) || 0;
  const authCapital = Number(company.authorizedCapital) || 0;
  const totalAuthShares = faceValue > 0 ? Math.floor(authCapital / faceValue) : 0;

  // Total subscribed shares across all shareholders
  const totalSubscribedShares = isOpc
    ? totalAuthShares
    : directors.reduce((sum, d) => sum + (Number(d.numberOfShares) || 0), 0);
  const derivedSubscribedCapital = isOpc ? authCapital : totalSubscribedShares * faceValue;

  // Auto-update derived values in store
  useEffect(() => {
    updateDetails({
      numberOfShares: totalAuthShares,
      paidUpCapital: derivedSubscribedCapital,
    });
  }, [authCapital, faceValue, totalSubscribedShares, isOpc]);

  // For OPC, automatically assign 100% shares to the single promoter if present
  useEffect(() => {
    if (isOpc && directors.length > 0 && totalAuthShares > 0) {
      if (directors[0].numberOfShares !== totalAuthShares) {
        updateDirector(directors[0].id, {
          numberOfShares: totalAuthShares,
          amountSubscribed: totalAuthShares * faceValue,
        });
      }
    }
  }, [isOpc, totalAuthShares, directors, faceValue]);

  const handleAuthCapitalChange = (val: string) => {
    setRawAuthCapital(val);
    const err = validateCapitalNumeric(val, 'Authorised Capital');
    const next = { ...fieldErrors };
    if (!err) { delete next.authorizedCapital; updateDetails({ authorizedCapital: Number(val) || 0 }); }
    else { next.authorizedCapital = err; }
    setFieldErrors(next);
  };

  const handleFaceValueChange = (val: string) => {
    setRawFaceValue(val);
    const err = validateCapitalNumeric(val, 'Face Value per Share');
    const next = { ...fieldErrors };
    if (!err) { delete next.faceValuePerShare; updateDetails({ faceValuePerShare: Number(val) || 0 }); }
    else { next.faceValuePerShare = err; }
    setFieldErrors(next);
  };

  const handleShareAllocationChange = (dirId: string, sharesInput: string) => {
    setRawShares((prev) => ({ ...prev, [dirId]: sharesInput }));
    const errorKey = `dir_${dirId}_shares`;
    if (EMOJI_REGEX.test(sharesInput) || (sharesInput.trim() !== '' && !/^\d+$/.test(sharesInput.trim()))) {
      setFieldErrors({ ...fieldErrors, [errorKey]: UNSUPPORTED_CHARS_MSG });
    } else {
      if (fieldErrors[errorKey]) {
        const next = { ...fieldErrors };
        delete next[errorKey];
        setFieldErrors(next);
      }
      const shares = Math.max(0, parseInt(sharesInput.trim(), 10) || 0);
      updateDirector(dirId, { numberOfShares: shares, amountSubscribed: shares * faceValue });
    }
  };

  const getSharePercentageStr = (shares: number | undefined): string => {
    if (isOpc) return '100%';
    if (!shares || !totalSubscribedShares || totalSubscribedShares <= 0) return '--';
    const pct = (Number(shares) / totalSubscribedShares) * 100;
    if (isNaN(pct)) return '--';
    return pct % 1 === 0 ? `${pct.toFixed(0)}%` : `${pct.toFixed(1)}%`;
  };

  const isCapitalValid = authCapital > 0 && derivedSubscribedCapital <= authCapital;
  const isFaceValueValid = faceValue > 0;
  const isShareholdingValid =
    isOpc || (totalSubscribedShares > 0 && (totalAuthShares === 0 || totalSubscribedShares <= totalAuthShares));
  const isAllValid = isCapitalValid && isFaceValueValid && isShareholdingValid;

  return (
    <View style={styles.container}>
      {/* Capital Details */}
      <CompanySectionCard
        iconName="cash-outline"
        title="Capital Details"
        description="Define authorized capital, face value, and view derived subscribed capital."
      >
        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>Authorised Capital (₹) *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.authorizedCapital && styles.inputError]}
              value={displayAuthCapital}
              onChangeText={handleAuthCapitalChange}
              keyboardType="numeric"
              placeholder="e.g. 100000"
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.authorizedCapital && <Text style={styles.errorText}>{fieldErrors.authorizedCapital}</Text>}
          </View>

          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>Face Value per Share (₹) *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.faceValuePerShare && styles.inputError]}
              value={displayFaceValue}
              onChangeText={handleFaceValueChange}
              keyboardType="numeric"
              placeholder="e.g. 10"
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.faceValuePerShare && <Text style={styles.errorText}>{fieldErrors.faceValuePerShare}</Text>}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>Authorised Shares (Calculated)</Text>
            <View style={styles.readOnlyInput}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#263238' }}>{totalAuthShares ? `${totalAuthShares.toLocaleString()} shares` : '—'}</Text>
            </View>
          </View>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>Subscribed Capital (Calculated)</Text>
            <View style={styles.readOnlyInput}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#263238' }}>{derivedSubscribedCapital ? `₹${derivedSubscribedCapital.toLocaleString('en-IN')}` : '—'}</Text>
            </View>
          </View>
        </View>
      </CompanySectionCard>

      {/* Shareholding Pattern */}
      <CompanySectionCard
        iconName="pie-chart-outline"
        title="Shareholding Pattern"
        description="Equity subscription and allocation percentage among founders."
      >
        {isOpc && (
          <Text style={styles.opcNote}>
            In a One Person Company (OPC), 100% equity shareholding is automatically allocated to the single member.
          </Text>
        )}

        {isOpc ? (
          <>
            <View style={styles.shareCard}>
              <View style={styles.shareRow}>
                <View style={styles.shareInfo}>
                  <Text style={styles.shareName}>Single Member / Shareholder</Text>
                  <Text style={styles.shareDetailText}>
                    Shares: {totalAuthShares ? totalAuthShares.toLocaleString() : '—'} • Subscribed Amount: {authCapital > 0 ? `₹${authCapital.toLocaleString('en-IN')}` : '—'}
                  </Text>
                </View>
                <View style={styles.shareStatsRight}>
                  <View style={styles.shareBadge}>
                    <Text style={styles.shareBadgeText}>100%</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.totalsCard}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total Subscribed Shares</Text>
                <Text style={styles.totalsValue}>{totalAuthShares ? totalAuthShares.toLocaleString() : '—'}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total Share Allocation</Text>
                <Text style={styles.totalsValue}>100%</Text>
              </View>
            </View>
          </>
        ) : directors.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={32} color="#94A3B8" />
            <Text style={styles.emptyText}>No promoter/share subscription details added yet.</Text>
          </View>
        ) : (
          <>
            {directors.map((dir, idx) => {
              const allocatedShares = dir.numberOfShares || 0;
              const allocatedAmount = allocatedShares * faceValue;
              return (
                <View key={dir.id || `dir-${idx}`} style={styles.shareCard}>
                  <View style={styles.shareRow}>
                    <View style={styles.shareInfo}>
                      <Text style={styles.shareName}>{dir.name || `Promoter / Director #${idx + 1}`}</Text>
                      <Text style={styles.shareDetailText}>
                        PAN: {dir.pan || 'N/A'} • Subscribed Amount: {allocatedAmount > 0 ? `₹${allocatedAmount.toLocaleString('en-IN')}` : '—'}
                      </Text>
                    </View>
                    <View style={styles.shareStatsRight}>
                      <View style={styles.shareBadge}>
                        <Text style={styles.shareBadgeText}>{getSharePercentageStr(dir.numberOfShares)}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.shareInputRow}>
                    <View style={styles.halfField}>
                      <Text style={styles.shareInputLabel}>Allocated Shares *</Text>
                      <TextInput
                        style={[styles.smallInput, !!fieldErrors[`dir_${dir.id}_shares`] && styles.inputError]}
                        value={rawShares[dir.id] !== undefined ? rawShares[dir.id] : (dir.numberOfShares ? String(dir.numberOfShares) : '')}
                        onChangeText={(val) => handleShareAllocationChange(dir.id, val)}
                        keyboardType="numeric"
                        placeholder="Enter shares"
                        placeholderTextColor="#94A3B8"
                      />
                      {!!fieldErrors[`dir_${dir.id}_shares`] && (
                        <Text style={[styles.errorText, { fontSize: 11, marginTop: 2 }]}>
                          {fieldErrors[`dir_${dir.id}_shares`]}
                        </Text>
                      )}
                    </View>
                    <View style={styles.halfField}>
                      <Text style={styles.shareInputLabel}>Amount (Calculated)</Text>
                      <View style={[styles.smallInput, { backgroundColor: '#F8FAFC' }]}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#263238' }}>
                          {allocatedAmount > 0 ? `₹${allocatedAmount.toLocaleString('en-IN')}` : '—'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Dynamic Totals Summary */}
            <View style={styles.totalsCard}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total Subscribed Shares</Text>
                <Text style={styles.totalsValue}>{totalSubscribedShares ? totalSubscribedShares.toLocaleString() : '—'}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total Share Allocation</Text>
                <Text style={styles.totalsValue}>{totalSubscribedShares > 0 ? '100%' : '—'}</Text>
              </View>
            </View>
          </>
        )}

        {!!fieldErrors.shareholdingTotal && (
          <Text style={[styles.errorText, { marginBottom: 12 }]}>{fieldErrors.shareholdingTotal}</Text>
        )}

        {/* Dynamic Validation Status */}
        <View style={[styles.validationBox, isAllValid ? styles.validBox : styles.invalidBox]}>
          <Ionicons name={isAllValid ? 'checkmark-circle' : 'alert-circle'} size={20} color={isAllValid ? '#166534' : '#991B1B'} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.validationText, { color: isAllValid ? '#166534' : '#991B1B' }]}>
              Subscribed Capital ≤ Authorised Capital: {isCapitalValid ? 'PASSED' : 'FAILED (Subscribed exceeds Authorised)'}
            </Text>
            <Text style={[styles.validationText, { color: isAllValid ? '#166534' : '#991B1B' }]}>
              Total Share Allocation: {isShareholdingValid ? '100% (PASSED)' : totalSubscribedShares > totalAuthShares ? 'FAILED (Subscribed exceeds Authorised)' : 'FAILED (No shares allocated yet)'}
            </Text>
          </View>
        </View>
      </CompanySectionCard>
    </View>
  );
};

export default StepCapitalShareholding;
