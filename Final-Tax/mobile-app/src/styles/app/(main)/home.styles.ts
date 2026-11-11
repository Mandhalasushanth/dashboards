import { StyleSheet } from "react-native";
import { homeHeaderStyles } from "./home.header.styles";
import { homeSectionStyles } from "./home.sections.styles";

export * from "./home.header.styles";
export * from "./home.sections.styles";

export const styles = StyleSheet.create({
  ...homeHeaderStyles,
  ...homeSectionStyles,
});

export default styles;
