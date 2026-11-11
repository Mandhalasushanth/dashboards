import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { AmountTextInput } from "@/shared/components/AmountTextInput";
import {
  IncomeBusinessData,
  IncomeCapitalGainsData,
} from "../../../types/itrFiling.types";
import { styles } from "../Step2IncomeSources.styles";

interface BusinessFormProps {
  business: IncomeBusinessData;
  onUpdateBusiness: (data: Partial<IncomeBusinessData>) => void;
  onPressInfo?: () => void;
}

export const BusinessIncomeForm: React.FC<BusinessFormProps> = ({
  business,
  onUpdateBusiness,
  onPressInfo,
}) => {
  if (!business.enabled) return null;

  return (
    <View style={[styles.card, styles.cardActive]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.sourceHeaderRow}
        onPress={() => onUpdateBusiness({ enabled: !business.enabled })}
      >
        <View style={styles.sourceHeaderLeft}>
          <View style={[styles.sourceIconBox, styles.sourceIconBoxActive]}>
            <Ionicons name="storefront-outline" size={20} color={BrandColors.PRIMARY_ORANGE} />
          </View>
          <View style={styles.sourceTitleCol}>
            <View style={styles.sourceTitleRow}>
              <Text style={styles.sourceTitle}>Business / Profession</Text>
              {onPressInfo && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.infoIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    onPressInfo();
                  }}
                >
                  <Ionicons name="information-circle-outline" size={18} color="#083B75" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.sourceSubtitle}>Presumptive (44AD/ADA) or Regular Books</Text>
          </View>
        </View>
        <View style={styles.checkboxBtn}>
          <Ionicons name="checkbox" size={22} color={BrandColors.PRIMARY_ORANGE} />
        </View>
      </TouchableOpacity>

      <View style={styles.expandedForm}>
        <View style={styles.labelWithInfoRow}>
          <Text style={styles.inputLabel}>How do you report this business?</Text>
          <Text style={styles.mandatoryAsterisk}>*</Text>
        </View>
        <View style={styles.schemeRadioGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.schemeRadioCard,
              business.businessType === "presumptive_44ad" && styles.schemeRadioCardSelected,
            ]}
            onPress={() => onUpdateBusiness({ businessType: "presumptive_44ad" })}
          >
            <Ionicons
              name={business.businessType === "presumptive_44ad" ? "radio-button-on" : "radio-button-off"}
              size={16}
              color={business.businessType === "presumptive_44ad" ? BrandColors.PRIMARY_ORANGE : "#64748B"}
            />
            <View style={styles.schemeRadioTextCol}>
              <Text style={styles.schemeRadioTitle}>Presumptive Business (Section 44AD)</Text>
              <Text style={styles.schemeRadioSub}>Small traders & retailers (ITR-4 Sugam)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.schemeRadioCard,
              business.businessType === "presumptive_44ada" && styles.schemeRadioCardSelected,
            ]}
            onPress={() => onUpdateBusiness({ businessType: "presumptive_44ada" })}
          >
            <Ionicons
              name={business.businessType === "presumptive_44ada" ? "radio-button-on" : "radio-button-off"}
              size={16}
              color={business.businessType === "presumptive_44ada" ? BrandColors.PRIMARY_ORANGE : "#64748B"}
            />
            <View style={styles.schemeRadioTextCol}>
              <Text style={styles.schemeRadioTitle}>Presumptive Profession (Section 44ADA)</Text>
              <Text style={styles.schemeRadioSub}>Doctors, IT consultants, lawyers (ITR-4 Sugam)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.schemeRadioCard,
              business.businessType === "regular_books" && styles.schemeRadioCardSelected,
            ]}
            onPress={() => onUpdateBusiness({ businessType: "regular_books" })}
          >
            <Ionicons
              name={business.businessType === "regular_books" ? "radio-button-on" : "radio-button-off"}
              size={16}
              color={business.businessType === "regular_books" ? BrandColors.PRIMARY_ORANGE : "#64748B"}
            />
            <View style={styles.schemeRadioTextCol}>
              <Text style={styles.schemeRadioTitle}>Regular Books of Accounts (ITR-3)</Text>
              <Text style={styles.schemeRadioSub}>Maintaining P&L, Balance Sheet, or Audit</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.schemeRadioCard,
              business.businessType === "not_sure" && styles.schemeRadioCardSelected,
            ]}
            onPress={() => onUpdateBusiness({ businessType: "not_sure" })}
          >
            <Ionicons
              name={business.businessType === "not_sure" ? "radio-button-on" : "radio-button-off"}
              size={16}
              color={business.businessType === "not_sure" ? BrandColors.PRIMARY_ORANGE : "#64748B"}
            />
            <View style={styles.schemeRadioTextCol}>
              <Text style={styles.schemeRadioTitle}>{"I'm Not Sure"}</Text>
              <Text style={styles.schemeRadioSub}>Finsolz CA will review and select the best option</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroupHalf}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.inputLabel}>Gross Turnover</Text>
              <Text style={styles.mandatoryAsterisk}>*</Text>
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <AmountTextInput
                style={styles.textInput}
                placeholder="e.g. 25,00,000"
                placeholderTextColor="#94A3B8"
                value={business.grossTurnover}
                onChangeText={(raw) => onUpdateBusiness({ grossTurnover: raw })}
                maxLength={15}
              />
            </View>
          </View>

          <View style={styles.inputGroupHalf}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.inputLabel}>Declared Profit</Text>
              <Text style={styles.mandatoryAsterisk}>*</Text>
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <AmountTextInput
                style={styles.textInput}
                placeholder="e.g. 2,00,000 (0 if none)"
                placeholderTextColor="#94A3B8"
                value={business.declaredProfit}
                onChangeText={(raw) => onUpdateBusiness({ declaredProfit: raw })}
                maxLength={15}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

interface CapitalGainsFormProps {
  capitalGains: IncomeCapitalGainsData;
  onUpdateCapitalGains: (data: Partial<IncomeCapitalGainsData>) => void;
  onPressInfo?: () => void;
}

export const CapitalGainsIncomeForm: React.FC<CapitalGainsFormProps> = ({
  capitalGains,
  onUpdateCapitalGains,
  onPressInfo,
}) => {
  if (!capitalGains.enabled) return null;

  return (
    <View style={[styles.card, styles.cardActive]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.sourceHeaderRow}
        onPress={() => onUpdateCapitalGains({ enabled: !capitalGains.enabled })}
      >
        <View style={styles.sourceHeaderLeft}>
          <View style={[styles.sourceIconBox, styles.sourceIconBoxActive]}>
            <Ionicons name="trending-up-outline" size={20} color={BrandColors.PRIMARY_ORANGE} />
          </View>
          <View style={styles.sourceTitleCol}>
            <View style={styles.sourceTitleRow}>
              <Text style={styles.sourceTitle}>Capital Gains & Trading</Text>
              {onPressInfo && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.infoIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    onPressInfo();
                  }}
                >
                  <Ionicons name="information-circle-outline" size={18} color="#083B75" />
                </TouchableOpacity>
              )}
              {capitalGains.statementUploaded && (
                <View style={styles.sourceTagVerified}>
                  <Ionicons name="checkmark-circle" size={10} color="#166534" />
                  <Text style={styles.sourceTagVerifiedText}>Broker Parsed</Text>
                </View>
              )}
            </View>
            <Text style={styles.sourceSubtitle}>Stocks, mutual funds, F&O, crypto, property</Text>
          </View>
        </View>
        <View style={styles.checkboxBtn}>
          <Ionicons name="checkbox" size={22} color={BrandColors.PRIMARY_ORANGE} />
        </View>
      </TouchableOpacity>

      <View style={styles.expandedForm}>
        {capitalGains.statementUploaded && Boolean(capitalGains.brokerName) && (
          <View style={styles.brokerStatementCard}>
            <View style={styles.brokerTopRow}>
              <Text style={styles.brokerTitle}>
                {capitalGains.brokerName} Statement
              </Text>
              <View style={styles.sourceTagImported}>
                <Text style={styles.sourceTagImportedText}>
                  {capitalGains.totalTransactions} Transactions
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.labelWithInfoRow}>
          <Text style={styles.inputLabel}>Asset Types Traded</Text>
          <Text style={styles.mandatoryAsterisk}>*</Text>
        </View>
        <View style={styles.tagWrapRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.filterTag, capitalGains.hasEquityMf && styles.filterTagSelected]}
            onPress={() =>
              onUpdateCapitalGains({ hasEquityMf: !capitalGains.hasEquityMf })
            }
          >
            <Text style={[styles.filterTagText, capitalGains.hasEquityMf && styles.filterTagTextSelected]}>
              Equity & Mutual Funds
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.filterTag, capitalGains.hasFnoIntraday && styles.filterTagSelected]}
            onPress={() =>
              onUpdateCapitalGains({ hasFnoIntraday: !capitalGains.hasFnoIntraday })
            }
          >
            <Text style={[styles.filterTagText, capitalGains.hasFnoIntraday && styles.filterTagTextSelected]}>
              F&O & Intraday Trading
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.filterTag, capitalGains.hasCryptoVda && styles.filterTagSelected]}
            onPress={() =>
              onUpdateCapitalGains({ hasCryptoVda: !capitalGains.hasCryptoVda })
            }
          >
            <Text style={[styles.filterTagText, capitalGains.hasCryptoVda && styles.filterTagTextSelected]}>
              Crypto / VDA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.filterTag, capitalGains.hasPropertyAssets && styles.filterTagSelected]}
            onPress={() =>
              onUpdateCapitalGains({ hasPropertyAssets: !capitalGains.hasPropertyAssets })
            }
          >
            <Text style={[styles.filterTagText, capitalGains.hasPropertyAssets && styles.filterTagTextSelected]}>
              Real Estate / Land
            </Text>
          </TouchableOpacity>
        </View>

        {capitalGains.hasFnoIntraday && (
          <View style={styles.fnoWarningBox}>
            <Ionicons name="information-circle" size={16} color="#1D4ED8" />
            <Text style={styles.fnoWarningText}>
              F&O and intraday trades are treated as business income under Section 43(5). ITR-3 will apply.
            </Text>
          </View>
        )}

        {capitalGains.hasCryptoVda && (
          <View style={styles.cryptoWarningBox}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.cryptoWarningText}>
              Virtual Digital Assets (VDA) are taxed at 30% u/s 115BBH.
            </Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <View style={styles.inputGroupHalf}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.inputLabel}>Short-Term Gains (STCG)</Text>
              <Text style={styles.mandatoryAsterisk}>*</Text>
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <AmountTextInput
                style={styles.textInput}
                placeholder="e.g. 30,000 (0 if none)"
                placeholderTextColor="#94A3B8"
                value={capitalGains.shortTermGains}
                onChangeText={(raw) => onUpdateCapitalGains({ shortTermGains: raw })}
                maxLength={15}
              />
            </View>
          </View>

          <View style={styles.inputGroupHalf}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.inputLabel}>Long-Term Gains (LTCG)</Text>
              <Text style={styles.mandatoryAsterisk}>*</Text>
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <AmountTextInput
                style={styles.textInput}
                placeholder="e.g. 50,000 (0 if none)"
                placeholderTextColor="#94A3B8"
                value={capitalGains.longTermGains}
                onChangeText={(raw) => onUpdateCapitalGains({ longTermGains: raw })}
                maxLength={15}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
