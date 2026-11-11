import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Keyboard, Platform, View, type StyleProp, type ViewStyle } from "react-native";
import { footerLift } from "@/shared/utils/keyboardOverlap";
import { getKeyboardTop } from "./KeyboardAwareFormLayout";

/** Wait for any parent keyboard handling (KeyboardAvoidingView, window resize) to settle before re-measuring. */
const SETTLE_DELAY_MS = 80;

type Timer = ReturnType<typeof setTimeout>;

export interface KeyboardStickyFooterProps {
  children: ReactNode;
  /** The footer's normal style (background, padding, border). */
  style?: StyleProp<ViewStyle>;
}

/**
 * A fixed bottom action bar (Save & Continue, Submit, ...) that stays above the keyboard.
 *
 * Android with edge-to-edge and iOS do not resize the window for the keyboard, so a bar pinned to
 * the bottom of the screen is covered by it. While the keyboard is open this lifts the bar by
 * exactly the part of it the keyboard covers (so the ScrollView above it shrinks to the visible
 * area); when the keyboard closes the bar returns. The lift is measured, not assumed, so if a
 * parent already moved the bar (KeyboardAvoidingView) nothing is added on top.
 *
 * Pair it with KeyboardAwareScrollView for the content above it.
 */
export function KeyboardStickyFooter({ children, style }: KeyboardStickyFooterProps) {
  const ref = useRef<View>(null);
  const keyboardTop = useRef<number | null>(null);
  const appliedLift = useRef(0);
  const settleTimer = useRef<Timer | null>(null);
  const [lift, setLift] = useState(0);

  const updateLift = useCallback(() => {
    const kbTop = keyboardTop.current;
    const node = ref.current;
    if (kbTop == null || !node) return;
    node.measureInWindow((_x, y, _width, height) => {
      if (keyboardTop.current == null || !Number.isFinite(y) || height <= 0) return;
      // The bar's position without our own lift, so repeated measurements do not compound.
      const naturalBottom = y + height + appliedLift.current;
      const overlap = footerLift(naturalBottom, kbTop);
      if (overlap !== appliedLift.current) {
        appliedLift.current = overlap;
        setLift(overlap);
      }
    });
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return undefined;

    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      keyboardTop.current = getKeyboardTop(event);
      updateLift();
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(updateLift, SETTLE_DELAY_MS);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardTop.current = null;
      appliedLift.current = 0;
      if (settleTimer.current) clearTimeout(settleTimer.current);
      setLift(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [updateLift]);

  return (
    <View ref={ref} collapsable={false} style={[style, lift > 0 ? { marginBottom: lift } : null]}>
      {children}
    </View>
  );
}

export default KeyboardStickyFooter;
