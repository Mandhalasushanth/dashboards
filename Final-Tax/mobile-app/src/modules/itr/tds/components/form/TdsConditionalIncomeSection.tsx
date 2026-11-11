import React, { PropsWithChildren } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../screens/TdsRefundFormScreen/TdsRefundFormScreen.styles";

interface TdsConditionalIncomeSectionProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const TdsConditionalIncomeSection: React.FC<TdsConditionalIncomeSectionProps> = ({
  title,
  subtitle,
  enabled,
  onToggle,
  children,
}) => (
  <View style={styles.toggleSection}>
    <View style={styles.toggleHeader}>
      <View style={styles.toggleTextGroup}>
        <Text style={styles.toggleQuestion}>{title}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.toggleChips}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onToggle(true)}
          style={[styles.toggleChip, enabled ? styles.toggleChipActive : null]}
        >
          <Text style={[styles.toggleChipText, enabled ? styles.toggleChipTextActive : null]}>
            Yes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onToggle(false)}
          style={[styles.toggleChip, !enabled ? styles.toggleChipActive : null]}
        >
          <Text style={[styles.toggleChipText, !enabled ? styles.toggleChipTextActive : null]}>
            No
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    {children}
  </View>
);