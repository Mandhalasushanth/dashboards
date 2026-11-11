import React from "react";
import { View } from "react-native";
import Svg, { Path, Rect, Circle, Line, Polyline } from "react-native-svg";
import { styles } from "./ProfessionIcons.styles";

interface ProfessionIconProps {
  type: string;
  isSelected?: boolean;
}

export const ProfessionIcon: React.FC<ProfessionIconProps> = ({ type, isSelected = false }) => {
  const navyColor = isSelected ? "#FFFFFF" : "#0B1F3A";
  const orangeColor = "#F97316";

  const renderIconContent = () => {
    switch (type) {
      case "salaried":
        return (
          <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            {/* Navy Suit Outline / Shoulders */}
            <Path
              d="M4 23C4 18 7 14 11 13L14 17L17 13C21 14 24 18 24 23"
              fill={isSelected ? "#0F2B48" : "#0B1F3A"}
            />
            {/* White Shirt / Collar */}
            <Path d="M9 7L14 16L19 7H9Z" fill="#FFFFFF" />
            <Path d="M9 7L12 11L14 7L16 11L19 7" stroke="#E2E8F0" strokeWidth={1} />
            {/* Orange Tie */}
            <Path d="M13 11H15L15.5 18L14 21L12.5 18L13 11Z" fill={orangeColor} />
            <Circle cx={14} cy={10} r={1.5} fill={orangeColor} />
          </Svg>
        );

      case "business":
        return (
          <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            {/* Orange Awning */}
            <Path
              d="M5 8L6 14H8L9 8H11L12 14H14L15 8H17L18 14H20L21 8H23L22 6H6L5 8Z"
              fill={orangeColor}
            />
            <Path d="M5 6H23V8H5V6Z" fill="#EA580C" />
            {/* Shop Building */}
            <Rect
              x={6}
              y={14}
              width={16}
              height={10}
              rx={1}
              stroke={navyColor}
              strokeWidth={2}
              fill="none"
            />
            {/* Shop Window / Door */}
            <Rect x={9} y={17} width={4} height={7} fill={navyColor} />
            <Rect x={15} y={17} width={4} height={4} fill={navyColor} />
          </Svg>
        );

      case "professional":
        return (
          <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            {/* Medical / Professional Caduceus & Scales */}
            {/* Central Staff */}
            <Line x1={14} y1={5} x2={14} y2={23} stroke={orangeColor} strokeWidth={2.5} strokeLinecap="round" />
            <Circle cx={14} cy={5} r={2} fill={orangeColor} />
            {/* Top Wings / Serpent Curves */}
            <Path
              d="M7 11C9 9 12 9 14 11C16 9 19 9 21 11"
              stroke={navyColor}
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M8 16C10 14 12 15 14 16C16 15 18 14 20 16"
              stroke={navyColor}
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx={8} cy={16} r={1.5} fill={navyColor} />
            <Circle cx={20} cy={16} r={1.5} fill={navyColor} />
          </Svg>
        );

      case "freelancer":
        return (
          <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            {/* Laptop Screen */}
            <Rect
              x={5}
              y={6}
              width={18}
              height={13}
              rx={2}
              stroke={navyColor}
              strokeWidth={2}
              fill="none"
            />
            {/* Terminal Code Prompt >_ */}
            <Polyline
              points="8,10 11,12.5 8,15"
              stroke={orangeColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Line x1={13} y1={15} x2={17} y2={15} stroke={orangeColor} strokeWidth={2} strokeLinecap="round" />
            {/* Laptop Base */}
            <Path d="M3 21H25L23 19H5L3 21Z" fill={navyColor} />
          </Svg>
        );

      case "trader":
        return (
          <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            {/* Bar chart */}
            <Rect x={5} y={17} width={3.5} height={6} rx={1} fill={navyColor} />
            <Rect x={10.5} y={13} width={3.5} height={10} rx={1} fill={navyColor} />
            <Rect x={16} y={9} width={3.5} height={14} rx={1} fill={navyColor} />
            {/* Trending Up Orange Arrow */}
            <Polyline
              points="6,15 12,10 17,12 23,5"
              stroke={orangeColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Polyline
              points="19,5 23,5 23,9"
              stroke={orangeColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        );

      case "rental":
        return (
          <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            {/* Roof */}
            <Path
              d="M4 13L14 5L24 13"
              stroke={navyColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* House Body */}
            <Path
              d="M6 12V22C6 22.5 6.5 23 7 23H21C21.5 23 22 22.5 22 22V12"
              stroke={navyColor}
              strokeWidth={2}
              fill="none"
            />
            {/* Orange Door */}
            <Rect x={11.5} y={15} width={5} height={8} rx={1} fill={orangeColor} />
          </Svg>
        );

      case "capital-gains":
        return (
          <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            {/* Document Page */}
            <Path
              d="M6 5C6 4 7 3 8 3H16L22 9V23C22 24 21 25 20 25H8C7 25 6 24 6 23V5Z"
              stroke={navyColor}
              strokeWidth={2}
              fill="none"
            />
            <Path d="M16 3V9H22" stroke={navyColor} strokeWidth={2} fill="none" />
            {/* Graph Line on doc */}
            <Polyline
              points="9,13 12,10 14,12 17,9"
              stroke={navyColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              fill="none"
            />
            {/* Orange Coin / Rupee Badge at bottom right */}
            <Circle cx={19} cy={20} r={4.5} fill={orangeColor} />
            <Path
              d="M17.5 18H20.5M17.5 19.5H20.5M18.5 18V22"
              stroke="#FFFFFF"
              strokeWidth={1.2}
              strokeLinecap="round"
            />
          </Svg>
        );

      case "multiple-sources":
        return (
          <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            {/* Interlocking Link */}
            <Path
              d="M11 17L8.5 19.5C6.5 21.5 3.5 21.5 1.5 19.5C-0.5 17.5 -0.5 14.5 1.5 12.5L4 10"
              transform="translate(4, 0)"
              stroke={navyColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M17 11L19.5 8.5C21.5 6.5 24.5 6.5 26.5 8.5C28.5 10.5 28.5 13.5 26.5 15.5L24 18"
              transform="translate(-4, 0)"
              stroke={orangeColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="none"
            />
            <Line x1={11} y1={17} x2={17} y2={11} stroke={orangeColor} strokeWidth={2.5} strokeLinecap="round" />
          </Svg>
        );

      default:
        return (
          <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            <Circle cx={14} cy={14} r={10} stroke={navyColor} strokeWidth={2} fill="none" />
            <Circle cx={14} cy={14} r={4} fill={orangeColor} />
          </Svg>
        );
    }
  };

  return (
    <View style={[styles.iconContainer, isSelected ? styles.selectedBg : styles.unselectedBg]}>
      {renderIconContent()}
    </View>
  );
};
