import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { ItrPriorFilingAndNotice } from "../../../types/itrFiling.types";
import { styles } from "../Step1PersonalInfo.styles";

interface Step1PriorItrImportProps {
  priorItrNotice: ItrPriorFilingAndNotice;
  isPreviousItrExpanded: boolean;
  setIsPreviousItrExpanded: (expanded: boolean) => void;
  onUpdatePriorItrNotice: (data: Partial<ItrPriorFilingAndNotice>) => void;
  onImportPriorItrData: (selectedKeys: {
    income?: boolean;
    deductions?: boolean;
    losses?: boolean;
    bank?: boolean;
    filing?: boolean;
  }) => void;
}

export const Step1PriorItrImport: React.FC<Step1PriorItrImportProps> = ({
  priorItrNotice,
  isPreviousItrExpanded,
  setIsPreviousItrExpanded,
  onUpdatePriorItrNotice,
  onImportPriorItrData,
}) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.accordionHeader}
        onPress={() => setIsPreviousItrExpanded(!isPreviousItrExpanded)}
      >
        <View style={styles.cardHeaderLeft}>
          <Ionicons name="document-attach-outline" size={18} color="#083B75" />
          <Text style={styles.cardTitle}>Previous ITR Data</Text>
        </View>
        <View style={styles.accordionHeaderRight}>
          <View style={styles.optionalTag}>
            <Text style={styles.optionalTagText}>Optional</Text>
          </View>
          <Ionicons
            name={isPreviousItrExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#083B75"
          />
        </View>
      </TouchableOpacity>

      {isPreviousItrExpanded && (
        <>
          <Text style={styles.cardDescriptionAccordion}>
            Optional — If you filed a return through Finsolz previously, you can import carry-forward loss and deduction records.
          </Text>

          <View style={styles.priorItrBox}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.priorItrToggleRow}
              onPress={() =>
                onUpdatePriorItrNotice({
                  hasPreviousItr: !priorItrNotice.hasPreviousItr,
                })
              }
            >
              <Text style={styles.priorItrToggleText}>
                I have previously filed return details
              </Text>
              <Ionicons
                name={priorItrNotice.hasPreviousItr ? "checkbox" : "square-outline"}
                size={20}
                color={priorItrNotice.hasPreviousItr ? BrandColors.PRIMARY_ORANGE : "#94A3B8"}
              />
            </TouchableOpacity>

            {priorItrNotice.hasPreviousItr && (
              <>
                <Text style={styles.importSectionTitle}>Select details to import:</Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.importCheckRow}
                  onPress={() =>
                    onImportPriorItrData({ income: !priorItrNotice.importedIncomeDetails })
                  }
                >
                  <Ionicons
                    name={priorItrNotice.importedIncomeDetails ? "checkbox" : "square-outline"}
                    size={18}
                    color={priorItrNotice.importedIncomeDetails ? BrandColors.PRIMARY_ORANGE : "#94A3B8"}
                  />
                  <Text style={styles.importCheckText}>Salary & employer details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.importCheckRow}
                  onPress={() =>
                    onImportPriorItrData({ deductions: !priorItrNotice.importedDeductions })
                  }
                >
                  <Ionicons
                    name={priorItrNotice.importedDeductions ? "checkbox" : "square-outline"}
                    size={18}
                    color={priorItrNotice.importedDeductions ? BrandColors.PRIMARY_ORANGE : "#94A3B8"}
                  />
                  <Text style={styles.importCheckText}>Deduction records (80C, 80D)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.importCheckRow}
                  onPress={() =>
                    onImportPriorItrData({ losses: !priorItrNotice.importedLosses })
                  }
                >
                  <Ionicons
                    name={priorItrNotice.importedLosses ? "checkbox" : "square-outline"}
                    size={18}
                    color={priorItrNotice.importedLosses ? BrandColors.PRIMARY_ORANGE : "#94A3B8"}
                  />
                  <Text style={styles.importCheckText}>Carried-forward business & capital losses</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.importCheckRow}
                  onPress={() =>
                    onImportPriorItrData({ bank: !priorItrNotice.importedBankDetails })
                  }
                >
                  <Ionicons
                    name={priorItrNotice.importedBankDetails ? "checkbox" : "square-outline"}
                    size={18}
                    color={priorItrNotice.importedBankDetails ? BrandColors.PRIMARY_ORANGE : "#94A3B8"}
                  />
                  <Text style={styles.importCheckText}>Bank account details</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
};
