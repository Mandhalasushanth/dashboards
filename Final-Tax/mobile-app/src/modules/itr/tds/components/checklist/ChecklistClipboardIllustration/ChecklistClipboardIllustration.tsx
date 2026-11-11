import React from "react";
import { View } from "react-native";
import Svg, { Rect, Path, Circle, G } from "react-native-svg";
import { styles } from "./ChecklistClipboardIllustration.styles";

export const ChecklistClipboardIllustration: React.FC = () => {
  return (
    <View style={styles.container}>
      <Svg width={96} height={96} viewBox="0 0 96 96" fill="none">
      {/* Background Clipboard Board */}
      <Rect
        x={16}
        y={14}
        width={58}
        height={72}
        rx={10}
        fill="#2563EB"
      />

      {/* Clipboard Top Clip */}
      <Rect
        x={33}
        y={8}
        width={24}
        height={10}
        rx={4}
        fill="#60A5FA"
      />
      <Circle cx={45} cy={12} r={2} fill="#1E40AF" />

      {/* Paper Sheet on Clipboard */}
      <Rect
        x={22}
        y={22}
        width={46}
        height={58}
        rx={6}
        fill="#FFFFFF"
      />

      {/* Checkmark 1 */}
      <Path
        d="M27 33L29.5 35.5L34 30.5"
        stroke="#2563EB"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={38} y={32} width={24} height={3} rx={1.5} fill="#CBD5E1" />

      {/* Checkmark 2 */}
      <Path
        d="M27 45L29.5 47.5L34 42.5"
        stroke="#2563EB"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={38} y={44} width={24} height={3} rx={1.5} fill="#CBD5E1" />

      {/* Checkmark 3 */}
      <Path
        d="M27 57L29.5 59.5L34 54.5"
        stroke="#2563EB"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={38} y={56} width={18} height={3} rx={1.5} fill="#CBD5E1" />

      {/* Orange Folder with Cloud Upload Badge */}
      <G transform="translate(44, 48)">
        {/* Orange Folder Tab */}
        <Path
          d="M6 10H18L22 14H38C40.2 14 42 15.8 42 18V36C42 38.2 40.2 40 38 40H6C3.8 40 2 38.2 2 36V14C2 11.8 3.8 10 6 10Z"
          fill="#F59E0B"
        />
        {/* Orange Folder Front Body */}
        <Path
          d="M2 18H42V36C42 38.2 40.2 40 38 40H6C3.8 40 2 38.2 2 36V18Z"
          fill="#F97316"
        />

        {/* Cloud Upload Icon floating over folder */}
        <G transform="translate(10, 0)">
          {/* Cloud Bubble */}
          <Path
            d="M10 24H22C24.8 24 27 21.8 27 19C27 16.5 25.2 14.4 22.8 14.1C22.4 10.1 19 7 15 7C11.7 7 8.9 9.1 7.8 12.1C5 12.6 3 15.1 3 18C3 21.3 5.7 24 9 24"
            fill="#3B82F6"
          />
          {/* Upward White Arrow */}
          <Path
            d="M15 13V20M15 13L12 16M15 13L18 16"
            stroke="#FFFFFF"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </G>
      </Svg>
    </View>
  );
};
