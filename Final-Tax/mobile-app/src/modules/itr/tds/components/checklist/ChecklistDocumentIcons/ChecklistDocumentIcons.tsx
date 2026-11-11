import React from "react";
import { View } from "react-native";
import Svg, { Path, Rect, Circle, Line, Text as SvgText } from "react-native-svg";
import { TdsChecklistItem } from "../../../types/checklist.types";
import { styles } from "./ChecklistDocumentIcons.styles";

interface ChecklistDocumentIconProps {
  type: TdsChecklistItem["iconType"];
}

export const ChecklistDocumentIcon: React.FC<ChecklistDocumentIconProps> = ({ type }) => {
  const navy = "#0B1F3A";
  const orange = "#F97316";

  const renderSvg = () => {
    switch (type) {
      case "pan":
        return (
          <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
            <Rect x={1.5} y={3.5} width={19} height={15} rx={2} stroke={navy} strokeWidth={1.6} />
            <Rect x={3.5} y={6.5} width={4.5} height={5.5} rx={1} stroke={orange} strokeWidth={1.2} />
            <Line x1={11} y1={7.5} x2={17} y2={7.5} stroke={navy} strokeWidth={1.3} strokeLinecap="round" />
            <Line x1={11} y1={10.5} x2={16} y2={10.5} stroke={navy} strokeWidth={1.3} strokeLinecap="round" />
            <Line x1={4} y1={15} x2={18} y2={15} stroke={navy} strokeWidth={1.3} strokeLinecap="round" />
          </Svg>
        );

      case "form16":
        return (
          <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
            <Path
              d="M13 2H5C3.9 2 3 2.9 3 4V18C3 19.1 3.9 20 5 20H17C18.1 20 19 19.1 19 18V8L13 2Z"
              stroke={navy}
              strokeWidth={1.6}
            />
            <Path d="M13 2V8H19" stroke={navy} strokeWidth={1.6} />
            <SvgText
              x={6.5}
              y={16}
              fontSize={7.5}
              fontWeight="bold"
              fill={orange}
            >
              16
            </SvgText>
          </Svg>
        );

      case "form16a":
        return (
          <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
            <Path
              d="M13 2H5C3.9 2 3 2.9 3 4V18C3 19.1 3.9 20 5 20H17C18.1 20 19 19.1 19 18V8L13 2Z"
              stroke={navy}
              strokeWidth={1.6}
            />
            <Path d="M13 2V8H19" stroke={navy} strokeWidth={1.6} />
            <SvgText
              x={4.5}
              y={15.5}
              fontSize={6.2}
              fontWeight="bold"
              fill={orange}
            >
              16A
            </SvgText>
          </Svg>
        );

      case "ais":
        return (
          <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
            <Rect x={2} y={12} width={4} height={8} rx={1} stroke={navy} strokeWidth={1.5} />
            <Rect x={9} y={6} width={4} height={14} rx={1} stroke={navy} strokeWidth={1.5} />
            <Rect x={16} y={10} width={4} height={10} rx={1} stroke={navy} strokeWidth={1.5} />
          </Svg>
        );

      case "tis":
        return (
          <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
            <Path
              d="M13 2H5C3.9 2 3 2.9 3 4V18C3 19.1 3.9 20 5 20H17C18.1 20 19 19.1 19 18V8L13 2Z"
              stroke={navy}
              strokeWidth={1.6}
            />
            <Path d="M13 2V8H19" stroke={navy} strokeWidth={1.6} />
            <Line x1={6.5} y1={11} x2={14.5} y2={11} stroke={navy} strokeWidth={1.3} strokeLinecap="round" />
            <Circle cx={14} cy={16} r={3.5} fill="#FFF7ED" stroke={orange} strokeWidth={1} />
            <SvgText
              x={12.2}
              y={18}
              fontSize={5.5}
              fontWeight="bold"
              fill={orange}
            >
              ₹
            </SvgText>
          </Svg>
        );

      case "bank_cheque":
        return (
          <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
            <Path d="M2.5 8.5L11 3.5L19.5 8.5V10.5H2.5V8.5Z" stroke={navy} strokeWidth={1.6} strokeLinejoin="round" />
            <Line x1={5.5} y1={10.5} x2={5.5} y2={17.5} stroke={navy} strokeWidth={1.6} strokeLinecap="round" />
            <Line x1={9.2} y1={10.5} x2={9.2} y2={17.5} stroke={navy} strokeWidth={1.6} strokeLinecap="round" />
            <Line x1={12.8} y1={10.5} x2={12.8} y2={17.5} stroke={navy} strokeWidth={1.6} strokeLinecap="round" />
            <Line x1={16.5} y1={10.5} x2={16.5} y2={17.5} stroke={navy} strokeWidth={1.6} strokeLinecap="round" />
            <Path d="M1.5 17.5H20.5V19.5H1.5V17.5Z" fill={navy} />
          </Svg>
        );

      case "prev_itr":
        return (
          <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
            <Path
              d="M13 2H5C3.9 2 3 2.9 3 4V18C3 19.1 3.9 20 5 20H17C18.1 20 19 19.1 19 18V8L13 2Z"
              stroke={navy}
              strokeWidth={1.6}
            />
            <Path d="M13 2V8H19" stroke={navy} strokeWidth={1.6} />
            <Line x1={6.5} y1={11} x2={13} y2={11} stroke={orange} strokeWidth={1.3} strokeLinecap="round" />
            <Line x1={6.5} y1={14} x2={15} y2={14} stroke={navy} strokeWidth={1.3} strokeLinecap="round" />
            <Line x1={6.5} y1={17} x2={12} y2={17} stroke={navy} strokeWidth={1.3} strokeLinecap="round" />
          </Svg>
        );

      case "tds_certs":
        return (
          <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
            <Path
              d="M13 2H5C3.9 2 3 2.9 3 4V18C3 19.1 3.9 20 5 20H17C18.1 20 19 19.1 19 18V8L13 2Z"
              stroke={navy}
              strokeWidth={1.6}
            />
            <Path d="M13 2V8H19" stroke={navy} strokeWidth={1.6} />
            <SvgText
              x={4.5}
              y={15.5}
              fontSize={5.8}
              fontWeight="bold"
              fill={orange}
            >
              TDS
            </SvgText>
          </Svg>
        );
    }
  };

  return <View style={styles.iconBox}>{renderSvg()}</View>;
};
