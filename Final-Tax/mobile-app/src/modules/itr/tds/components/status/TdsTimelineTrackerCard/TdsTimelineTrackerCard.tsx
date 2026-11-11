import React from "react";
import { View } from "react-native";
import { TdsTimelineStepItem } from "../../../types/tdsStatus.types";
import { TdsTimelineStepRow } from "./TdsTimelineStepRow";
import { styles } from "./TdsTimelineTrackerCard.styles";

interface TdsTimelineTrackerCardProps {
  steps: TdsTimelineStepItem[];
}

export const TdsTimelineTrackerCard: React.FC<TdsTimelineTrackerCardProps> = ({
  steps,
}) => {
  return (
    <View style={styles.card}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const nextStep = !isLast ? steps[index + 1] : undefined;

        return (
          <TdsTimelineStepRow
            key={step.id}
            step={step}
            isLast={isLast}
            nextStepStatus={nextStep?.status}
          />
        );
      })}
    </View>
  );
};

export default TdsTimelineTrackerCard;
