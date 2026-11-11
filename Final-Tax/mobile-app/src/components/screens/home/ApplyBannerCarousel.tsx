/**
 * ApplyBannerCarousel
 * Paged promotional carousel matching the Finsolz reference design.
 * Features:
 *  - Deep navy to royal blue gradient cards with ambient abstract shapes.
 *  - "Ready to help" status pill badge.
 *  - 3D Loan document + golden Indian Rupee coin illustration.
 *  - White rounded pill CTA button with deep navy text.
 *  - Elongated active blue capsule pagination indicators.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  type ImageSourcePropType,
  type ScrollViewInstance,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { useIsFocused, type Href } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/hooks/use-theme";
import {
  styles,
  CARD_WIDTH,
  getBannerPageStyle,
  getPageDotThemedStyle,
} from "@/styles/app/(main)/home.styles";
import type { IconName, ServiceCategoryId } from "@/types/domain";
import { Loan3DIllustration } from "./Loan3DIllustration";

const BANNER_3D_ASSETS: Record<string, ImageSourcePropType> = {
  "b-acct": require("@/../assets/images/services_3d/business.png"),
  "b-gst": require("@/../assets/images/services_3d/gst.png"),
  "b-itr": require("@/../assets/images/services_3d/itr.png"),
  "b-ins": require("@/../assets/images/services_3d/insurance.png"),
  "b-company": require("@/../assets/images/services_3d/incorporation.png"),
};

export interface ApplyBanner {
  key: string;
  id: ServiceCategoryId;
  route: Href;
  title: string;
  desc: string;
  cta: string;
  icon: IconName;
  tag?: string;
  bg?: string;
}

interface ApplyBannerCarouselProps {
  banners: readonly ApplyBanner[];
  colors: ReturnType<typeof useTheme>;
  onSelect: (banner: ApplyBanner) => void;
}

const BANNER_AUTO_ADVANCE_MS = 4000;
const BANNER_GRADIENT_COLORS = ["#082B59", "#0E3E7D", "#1455B8"] as const;

export function ApplyBannerCarousel({
  banners,
  onSelect,
}: ApplyBannerCarouselProps) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [pageWidth, setPageWidth] = useState(Dimensions.get("window").width);
  const [page, setPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isFocused = useIsFocused();

  const count = banners.length;
  const lastIndex = Math.max(0, count - 1);
  const activePage = Math.min(Math.max(page, 0), lastIndex);

  const pageFromOffset = (offsetX: number) =>
    Math.min(Math.max(Math.round(offsetX / pageWidth), 0), lastIndex);

  useEffect(() => {
    if (page > lastIndex) {
      scrollRef.current?.scrollTo({ x: lastIndex * pageWidth, animated: false });
    }
  }, [page, lastIndex, pageWidth]);

  useEffect(() => {
    if (count < 2 || !isFocused || isDragging) return undefined;
    const timer = setTimeout(() => {
      const next = activePage >= lastIndex ? 0 : activePage + 1;
      scrollRef.current?.scrollTo({ x: next * pageWidth, animated: next !== 0 });
      setPage(next);
    }, BANNER_AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [activePage, count, isDragging, isFocused, lastIndex, pageWidth]);

  if (count === 0) return null;

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={count > 1}
        showsHorizontalScrollIndicator={false}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && Math.abs(w - pageWidth) > 0.5) {
            setPageWidth(w);
            scrollRef.current?.scrollTo({ x: activePage * w, animated: false });
          }
        }}
        onScrollBeginDrag={() => setIsDragging(true)}
        onScrollEndDrag={() => setIsDragging(false)}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          setIsDragging(false);
          setPage(pageFromOffset(e.nativeEvent.contentOffset.x));
        }}
        scrollEventThrottle={16}
      >
        {banners.map((banner) => {
          const isLoanBanner = banner.id === "LOANS" || banner.key === "b-loans";
          const badgeText = banner.tag || (isLoanBanner ? "Ready to help" : "Finsolz Service");

          return (
            <View key={banner.key} style={[styles.bannerPage, getBannerPageStyle(pageWidth)]}>
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => onSelect(banner)}
                accessibilityRole="button"
                accessibilityLabel={`${banner.title}: ${banner.desc}`}
              >
                <LinearGradient
                  colors={BANNER_GRADIENT_COLORS}
                  start={{ x: 0, y: 0.1 }}
                  end={{ x: 1, y: 0.9 }}
                  style={styles.loansBanner}
                >
                  {/* Subtle Abstract Background Shapes */}
                  <View style={styles.bannerSvgBg} pointerEvents="none">
                    <Svg width="100%" height="100%" viewBox="0 0 360 180" preserveAspectRatio="none">
                      <Defs>
                        <SvgLinearGradient id="bannerGlow" x1="0" y1="0" x2="1" y2="1">
                          <Stop offset="0" stopColor="#38BDF8" stopOpacity="0.18" />
                          <Stop offset="1" stopColor="#1E40AF" stopOpacity="0" />
                        </SvgLinearGradient>
                      </Defs>
                      <Circle cx="290" cy="90" r="100" fill="url(#bannerGlow)" />
                      <Circle cx="300" cy="90" r="72" fill="rgba(255, 255, 255, 0.04)" />
                      <Path
                        d="M 120 180 C 180 140, 260 170, 360 110 L 360 180 Z"
                        fill="rgba(56, 189, 248, 0.06)"
                      />
                    </Svg>
                  </View>

                  {/* Left Column: Pill Badge, Title, Desc, White Pill CTA */}
                  <View style={styles.bannerLeft}>
                    <View style={styles.bannerBadgeWrap}>
                      <View style={styles.bannerBadgeDot} />
                      <Text style={styles.bannerBadgeText}>{badgeText}</Text>
                    </View>

                    <Text style={styles.bannerTitle} numberOfLines={1}>
                      {banner.title}
                    </Text>
                    <Text style={styles.bannerDesc} numberOfLines={2}>
                      {banner.desc}
                    </Text>

                    <View style={styles.exploreButton}>
                      <Text style={styles.exploreText}>{banner.cta}</Text>
                      <Ionicons name="arrow-forward" size={14} color="#082B59" />
                    </View>
                  </View>

                  {/* Right Column: 3D Illustration / Vector Asset */}
                  <View style={styles.bannerRight}>
                    {isLoanBanner ? (
                      <Loan3DIllustration width={122} height={122} />
                    ) : (
                      <Image
                        source={BANNER_3D_ASSETS[banner.key] || BANNER_3D_ASSETS["b-acct"]}
                        style={styles.bannerImage3D}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Pagination Dots with Active Blue Capsule */}
      {count > 1 ? (
        <View style={styles.dotsRow}>
          {banners.map((b, i) => (
            <View
              key={b.key}
              style={[
                styles.pageDot,
                getPageDotThemedStyle(i === activePage),
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
