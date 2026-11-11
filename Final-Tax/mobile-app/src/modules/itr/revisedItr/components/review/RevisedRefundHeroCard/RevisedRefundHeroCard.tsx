import React from "react";
import { View, Text } from "react-native";
import { styles } from "./RevisedRefundHeroCard.styles";

interface RevisedRefundHeroCardProps {
  revisedRefund?: string;
  originalRefund?: string;
  changeRefund?: string;
  additionalTaxPayable?: string;
}

export const RevisedRefundHeroCard: React.FC<RevisedRefundHeroCardProps> = ({
  revisedRefund = "₹12,458",
  originalRefund = "₹18,346",
  changeRefund = "−₹5,888",
  additionalTaxPayable,
}) => {
  const isPayable = !!additionalTaxPayable;

  return (
    <View style={[styles.card, isPayable ? styles.cardPayable : null]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconCircle, isPayable ? styles.iconCirclePayable : null]}>
          <Text style={[styles.rupeeIcon, isPayable ? styles.rupeeIconPayable : null]}>₹</Text>
        </View>
        <Text style={[styles.label, isPayable ? styles.labelPayable : null]}>
          {isPayable ? "Additional Tax Payable" : "Revised Refund"}
        </Text>
      </View>

      <Text style={styles.amount}>
        {isPayable ? additionalTaxPayable : revisedRefund}
      </Text>

      {!isPayable && (
        <>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Original Refund</Text>
            <Text style={styles.detailValue}>{originalRefund}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Change</Text>
            <Text style={[styles.detailValue, styles.changeValue]}>{changeRefund}</Text>
          </View>
        </>
      )}

      <Text style={styles.disclaimerText}>
        Preliminary calculation. Final result depends on the filed return and Income Tax Department processing.
      </Text>
    </View>
  );
};
