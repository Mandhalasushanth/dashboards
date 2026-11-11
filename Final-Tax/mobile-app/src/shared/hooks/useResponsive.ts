import { useWindowDimensions } from "react-native";

export interface ResponsiveBreakpoints {
  isSmallPhone: boolean;
  isStandardPhone: boolean;
  isLargePhone: boolean;
  isTablet: boolean;
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  selectByScreen: <T>(options: { small?: T; standard?: T; large?: T; tablet?: T; default: T }) => T;
  scaleFont: (size: number) => number;
  scaleSpacing: (size: number) => number;
}

export function useResponsive(): ResponsiveBreakpoints {
  const { width, height, scale, fontScale } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isStandardPhone = width >= 360 && width < 414;
  const isLargePhone = width >= 414 && width < 768;
  const isTablet = width >= 768;

  const selectByScreen = <T>(opt: { small?: T; standard?: T; large?: T; tablet?: T; default: T }): T =>
    isSmallPhone && opt.small !== undefined
      ? opt.small
      : isStandardPhone && opt.standard !== undefined
      ? opt.standard
      : isLargePhone && opt.large !== undefined
      ? opt.large
      : isTablet && opt.tablet !== undefined
      ? opt.tablet
      : opt.default;

  const scaleFont = (size: number) => Math.round(size * Math.max(0.85, Math.min(1.2, width / 390)));
  const scaleSpacing = (size: number) =>
    Math.round(size * (isSmallPhone ? 0.88 : isLargePhone ? 1.08 : isTablet ? 1.2 : 1));

  return {
    isSmallPhone,
    isStandardPhone,
    isLargePhone,
    isTablet,
    width,
    height,
    scale,
    fontScale,
    selectByScreen,
    scaleFont,
    scaleSpacing,
  };
}

export default useResponsive;
