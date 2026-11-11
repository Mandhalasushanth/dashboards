import React from "react";
import { View } from "react-native";
import Svg, { Path, Rect, Circle, Line } from "react-native-svg";
import { styles } from "./DocumentUploadIcons.styles";

interface DocumentUploadIconProps {
  type:
    | "pan"
    | "aadhaar"
    | "business_income"
    | "pnl_balance_sheet"
    | "bank_statements"
    | "ais"
    | "tis";
}

export const DocumentUploadIcon: React.FC<DocumentUploadIconProps> = ({ type }) => {
  const navyColor = "#0B1F3A";

  const renderIcon = () => {
    switch (type) {
      case "pan":
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Rect x={2} y={4} width={20} height={16} rx={2} stroke={navyColor} strokeWidth={1.8} />
            <Rect x={4.5} y={7} width={5} height={6} rx={1} stroke={navyColor} strokeWidth={1.5} />
            <Line x1={12} y1={8} x2={18} y2={8} stroke={navyColor} strokeWidth={1.5} strokeLinecap="round" />
            <Line x1={12} y1={11} x2={18} y2={11} stroke={navyColor} strokeWidth={1.5} strokeLinecap="round" />
            <Line x1={5} y1={16} x2={19} y2={16} stroke={navyColor} strokeWidth={1.5} strokeLinecap="round" />
          </Svg>
        );

      case "aadhaar":
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Rect x={3} y={3} width={18} height={18} rx={2.5} stroke={navyColor} strokeWidth={1.8} />
            <Circle cx={12} cy={9} r={3} stroke={navyColor} strokeWidth={1.5} />
            <Path
              d="M7 17C7 14.5 9.2 13 12 13C14.8 13 17 14.5 17 17"
              stroke={navyColor}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </Svg>
        );

      case "business_income":
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} stroke={navyColor} strokeWidth={1.8} />
            <Path
              d="M9 8H15M9 10.5H15M9 8V12.5C10.5 12.5 12 12.5 13 11.5C14 10.5 14 9.5 13 8.5M9 13.5L14 17"
              stroke={navyColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case "pnl_balance_sheet":
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
              stroke={navyColor}
              strokeWidth={1.8}
            />
            <Path d="M14 2V8H20" stroke={navyColor} strokeWidth={1.8} />
            <Rect x={7} y={14} width={2.5} height={5} fill={navyColor} />
            <Rect x={10.75} y={11} width={2.5} height={8} fill={navyColor} />
            <Rect x={14.5} y={13} width={2.5} height={6} fill={navyColor} />
          </Svg>
        );

      case "bank_statements":
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M3 9L12 4L21 9V11H3V9Z" stroke={navyColor} strokeWidth={1.8} strokeLinejoin="round" />
            <Line x1={6} y1={11} x2={6} y2={18} stroke={navyColor} strokeWidth={1.8} strokeLinecap="round" />
            <Line x1={10} y1={11} x2={10} y2={18} stroke={navyColor} strokeWidth={1.8} strokeLinecap="round" />
            <Line x1={14} y1={11} x2={14} y2={18} stroke={navyColor} strokeWidth={1.8} strokeLinecap="round" />
            <Line x1={18} y1={11} x2={18} y2={18} stroke={navyColor} strokeWidth={1.8} strokeLinecap="round" />
            <Path d="M2 18H22V20H2V18Z" fill={navyColor} />
          </Svg>
        );

      case "ais":
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
              stroke={navyColor}
              strokeWidth={1.8}
            />
            <Path d="M14 2V8H20" stroke={navyColor} strokeWidth={1.8} />
            <Line x1={8} y1={17} x2={8} y2={13} stroke={navyColor} strokeWidth={1.5} strokeLinecap="round" />
            <Line x1={11} y1={17} x2={11} y2={11} stroke={navyColor} strokeWidth={1.5} strokeLinecap="round" />
            <Line x1={14} y1={17} x2={14} y2={14} stroke={navyColor} strokeWidth={1.5} strokeLinecap="round" />
            <Line x1={16} y1={17} x2={16} y2={10} stroke={navyColor} strokeWidth={1.5} strokeLinecap="round" />
          </Svg>
        );

      case "tis":
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
              stroke={navyColor}
              strokeWidth={1.8}
            />
            <Path d="M14 2V8H20" stroke={navyColor} strokeWidth={1.8} />
            <Line x1={8} y1={12} x2={16} y2={12} stroke={navyColor} strokeWidth={1.5} strokeLinecap="round" />
            <Line x1={8} y1={15} x2={16} y2={15} stroke={navyColor} strokeWidth={1.5} strokeLinecap="round" />
            <Line x1={8} y1={18} x2={13} y2={18} stroke={navyColor} strokeWidth={1.5} strokeLinecap="round" />
          </Svg>
        );
    }
  };

  return <View style={styles.iconBox}>{renderIcon()}</View>;
};

export const CloudUploadHeaderIcon: React.FC = () => {
  const navyColor = "#0B1F3A";
  const orangeColor = "#F97316";

  return (
    <Svg width={54} height={54} viewBox="0 0 54 54" fill="none">
      {/* Cloud Shape */}
      <Path
        d="M16 38H39C44 38 47 34 47 29C47 24.5 43.5 21 39.5 20.5C38.5 14 33 9 26 9C19 9 13.5 14 12.5 21C7.5 22 4 26 4 31C4 35.5 7.5 38 12 38"
        stroke={navyColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Document page with orange arrow */}
      <Path
        d="M23 26H35C36.1 26 37 26.9 37 28V46C37 47.1 36.1 48 35 48H21C19.9 48 19 47.1 19 46V30L23 26Z"
        fill="#FFFFFF"
        stroke={navyColor}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path d="M23 26V30H19" stroke={navyColor} strokeWidth={2} />
      <Line x1={24} y1={39} x2={32} y2={39} stroke={navyColor} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={24} y1={43} x2={30} y2={43} stroke={navyColor} strokeWidth={1.8} strokeLinecap="round" />
      {/* Orange Upward Arrow */}
      <Path
        d="M28 35V20M28 20L23 24.5M28 20L33 24.5"
        stroke={orangeColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
