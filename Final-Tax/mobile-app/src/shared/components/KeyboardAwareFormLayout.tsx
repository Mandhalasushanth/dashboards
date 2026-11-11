import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
  type ScrollViewInstance,
  type GestureResponderEvent,
  type KeyboardEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { computeScrollTarget, keyboardOverlap } from "@/shared/utils/keyboardOverlap";

/**
 * Shared keyboard handling for forms.
 *
 * `KeyboardAwareScrollView` is a drop-in replacement for `ScrollView`:
 *  - When the keyboard opens, it adds bottom padding equal to the part of the
 *    scroll view hidden behind the keyboard, so the last fields can scroll up.
 *  - It scrolls the focused TextInput (text, numeric, multiline) just above
 *    the keyboard, but only when the keyboard would actually cover it.
 *  - Moving focus to another field while the keyboard is open re-checks the
 *    newly focused field.
 *  - Inputs that are not laid out inside this scroll view (for example inside
 *    a Modal with its own KeyboardAvoidingView) are ignored, so the screen is
 *    never scrolled to an unrelated section.
 *
 * Works the same on Android (edge-to-edge, where the window is not resized
 * for the keyboard) and iOS. No third-party keyboard library is required.
 */

/**
 * Dismisses the keyboard (which also blurs the focused TextInput) and then
 * runs `action`. Use it to open dropdowns, pickers and other selector modals:
 * if a text field stays focused while a Modal opens, Android hands focus back
 * to that field when the Modal closes and the keyboard pops up unexpectedly.
 */
export function dismissKeyboardThen(action: () => void): void {
  Keyboard.dismiss();
  action();
}

const DEFAULT_EXTRA_SCROLL_HEIGHT = 48;
const SCROLL_AFTER_KEYBOARD_DELAY_MS = Platform.OS === "ios" ? 40 : 80;
const SCROLL_AFTER_TOUCH_DELAY_MS = 150;
/** Tolerance (dp) when checking that an input really sits inside this scroll view. */
const POSITION_TOLERANCE = 4;

type Timer = ReturnType<typeof setTimeout>;

type MeasurableHost = {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void
  ) => void;
  measureLayout: (
    relativeTo: any,
    onSuccess: (left: number, top: number, width: number, height: number) => void,
    onFail?: () => void
  ) => void;
};

export interface KeyboardAwareScrollController {
  /** Re-check the focused input and scroll it above the keyboard if needed. */
  scrollToFocusedInput: () => void;
}

export interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  /** Space (dp) kept between the bottom of the focused input and the keyboard. */
  extraScrollHeight?: number;
  /** Set to false to keep the extra bottom padding but disable auto-scrolling. */
  enableAutomaticScroll?: boolean;
  /** Optional imperative handle used by KeyboardAwareFormLayout. */
  controllerRef?: React.Ref<KeyboardAwareScrollController>;
}

const getBasePaddingBottom = (style: StyleProp<ViewStyle>): number => {
  const flat = StyleSheet.flatten(style) || {};
  if (typeof flat.paddingBottom === "number") return flat.paddingBottom;
  if (typeof flat.paddingVertical === "number") return flat.paddingVertical;
  if (typeof flat.padding === "number") return flat.padding;
  return 0;
};

/** Screen Y of the top edge of the keyboard described by a keyboard event. */
export const getKeyboardTop = (event: KeyboardEvent): number => {
  const { screenY, height } = event.endCoordinates;
  if (Number.isFinite(screenY) && screenY > 0) return screenY;
  return Dimensions.get("window").height - height;
};

export const KeyboardAwareScrollView = forwardRef<ScrollViewInstance, KeyboardAwareScrollViewProps>(
  function KeyboardAwareScrollView(
    {
      children,
      extraScrollHeight = DEFAULT_EXTRA_SCROLL_HEIGHT,
      enableAutomaticScroll = true,
      controllerRef,
      contentContainerStyle,
      onScroll,
      onTouchStart,
      onTouchEnd,
      onScrollBeginDrag,
      scrollEventThrottle,
      keyboardShouldPersistTaps = "handled",
      ...scrollViewProps
    },
    forwardedRef
  ) {
    const scrollRef = useRef<ScrollViewInstance | null>(null);
    const scrollOffsetY = useRef(0);
    const keyboardTop = useRef<number | null>(null);
    const pendingTimer = useRef<Timer | null>(null);
    const isDragging = useRef(false);
    const [keyboardInset, setKeyboardInset] = useState(0);

    const setScrollRef = useCallback(
      (node: ScrollViewInstance | null) => {
        scrollRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<ScrollViewInstance | null>).current = node;
        }
      },
      [forwardedRef]
    );

    const getScrollHost = useCallback((): MeasurableHost | null => {
      const scrollView = scrollRef.current as any;
      if (!scrollView) return null;
      return (scrollView.getNativeScrollRef?.() ?? scrollView) as MeasurableHost | null;
    }, []);

    const scrollToFocusedInput = useCallback(() => {
      if (!enableAutomaticScroll) return;
      const kbTop = keyboardTop.current;
      const scrollView = scrollRef.current as any;
      const scrollHost = getScrollHost();
      const input = TextInput.State.currentlyFocusedInput() as MeasurableHost | null | undefined;
      const contentHost = scrollView?.getInnerViewRef?.();
      if (kbTop == null || !scrollHost || !input || !contentHost) return;

      scrollHost.measureInWindow((_sx, scrollTop, _sw, scrollHeight) => {
        if (!Number.isFinite(scrollTop) || scrollHeight <= 0) return;

        input.measureLayout(
          contentHost,
          (_left, inputY, _width, inputHeight) => {
            input.measureInWindow((_ix, inputWindowY) => {
              // Ignore inputs that are not laid out inside this scroll view
              // (e.g. inputs rendered inside a Modal).
              const expectedWindowY = scrollTop + inputY - scrollOffsetY.current;
              if (Math.abs(expectedWindowY - inputWindowY) > POSITION_TOLERANCE) return;

              const visibleBottom = Math.min(scrollTop + scrollHeight, kbTop);
              const visibleHeight = visibleBottom - scrollTop;
              if (visibleHeight <= 0) return;

              const targetOffset = computeScrollTarget({
                inputY,
                inputHeight,
                currentOffset: scrollOffsetY.current,
                visibleHeight,
                extraScrollHeight,
              });
              if (targetOffset == null) return;
              scrollRef.current?.scrollTo({ y: targetOffset, animated: true });
            });
          },
          () => {
            // Focused input is not inside this scroll view.
          }
        );
      });
    }, [enableAutomaticScroll, extraScrollHeight, getScrollHost]);

    /** Bottom padding = the part of the scroll view the keyboard covers right now. */
    const refreshKeyboardInset = useCallback(() => {
      const kbTop = keyboardTop.current;
      const scrollHost = getScrollHost();
      if (kbTop == null || !scrollHost) return;
      scrollHost.measureInWindow((_x, scrollTop, _w, scrollHeight) => {
        if (keyboardTop.current == null || !Number.isFinite(scrollTop) || scrollHeight <= 0) return;
        setKeyboardInset(keyboardOverlap(scrollTop + scrollHeight, kbTop));
      });
    }, [getScrollHost]);

    const scheduleScroll = useCallback(
      (delay: number) => {
        if (pendingTimer.current) clearTimeout(pendingTimer.current);
        pendingTimer.current = setTimeout(() => {
          pendingTimer.current = null;
          refreshKeyboardInset();
          scrollToFocusedInput();
        }, delay);
      },
      [refreshKeyboardInset, scrollToFocusedInput]
    );

    useImperativeHandle(controllerRef, () => ({ scrollToFocusedInput }), [scrollToFocusedInput]);

    useEffect(() => {
      if (Platform.OS === "web") return undefined;

      const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
      const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

      const showSub = Keyboard.addListener(showEvent, (event) => {
        const kbTop = getKeyboardTop(event);
        keyboardTop.current = kbTop;
        const scrollHost = getScrollHost();
        if (!scrollHost) return;
        scrollHost.measureInWindow((_x, scrollTop, _w, scrollHeight) => {
          setKeyboardInset(keyboardOverlap(scrollTop + scrollHeight, kbTop));
          scheduleScroll(SCROLL_AFTER_KEYBOARD_DELAY_MS);
        });
      });

      const hideSub = Keyboard.addListener(hideEvent, () => {
        keyboardTop.current = null;
        if (pendingTimer.current) {
          clearTimeout(pendingTimer.current);
          pendingTimer.current = null;
        }
        setKeyboardInset(0);
      });

      return () => {
        showSub.remove();
        hideSub.remove();
        if (pendingTimer.current) clearTimeout(pendingTimer.current);
      };
    }, [getScrollHost, scheduleScroll]);

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollOffsetY.current = event.nativeEvent.contentOffset.y;
        onScroll?.(event);
      },
      [onScroll]
    );

    const handleTouchStart = useCallback(
      (event: GestureResponderEvent) => {
        isDragging.current = false;
        onTouchStart?.(event);
      },
      [onTouchStart]
    );

    const handleScrollBeginDrag = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        isDragging.current = true;
        onScrollBeginDrag?.(event);
      },
      [onScrollBeginDrag]
    );

    const handleTouchEnd = useCallback(
      (event: GestureResponderEvent) => {
        // A tap (not a drag) while the keyboard is open may have moved focus to
        // another field: re-check it. Drags are the user scrolling on purpose,
        // so never pull them back to the focused field.
        if (keyboardTop.current != null && !isDragging.current) {
          scheduleScroll(SCROLL_AFTER_TOUCH_DELAY_MS);
        }
        onTouchEnd?.(event);
      },
      [onTouchEnd, scheduleScroll]
    );

    const basePaddingBottom = useMemo(
      () => getBasePaddingBottom(contentContainerStyle),
      [contentContainerStyle]
    );

    return (
      <ScrollView
        ref={setScrollRef}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        scrollEventThrottle={scrollEventThrottle ?? 16}
        {...scrollViewProps}
        contentContainerStyle={
          keyboardInset > 0
            ? [contentContainerStyle, { paddingBottom: basePaddingBottom + keyboardInset }]
            : contentContainerStyle
        }
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onScrollBeginDrag={handleScrollBeginDrag}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </ScrollView>
    );
  }
);

// ─── Form layout wrapper (kept for existing API compatibility) ───────────────

interface KeyboardAwareContextType {
  scrollRef: React.RefObject<ScrollViewInstance | null>;
  scrollToFocusedInput: (inputNodeHandle?: number | null) => void;
  keyboardHeight: number;
  isKeyboardVisible: boolean;
}

const KeyboardAwareContext = createContext<KeyboardAwareContextType>({
  scrollRef: { current: null },
  scrollToFocusedInput: () => {},
  keyboardHeight: 0,
  isKeyboardVisible: false,
});

export const useKeyboardAwareScroll = () => useContext(KeyboardAwareContext);

export interface KeyboardAwareFormLayoutProps extends ScrollViewProps {
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** @deprecated No longer needed; keyboard offset is measured automatically. */
  iosOffset?: number;
  extraScrollHeight?: number;
  dismissKeyboardOnTap?: boolean;
}

export const KeyboardAwareFormLayout: React.FC<KeyboardAwareFormLayoutProps> = ({
  children,
  containerStyle,
  contentStyle,
  iosOffset: _iosOffset,
  extraScrollHeight = DEFAULT_EXTRA_SCROLL_HEIGHT,
  dismissKeyboardOnTap = true,
  ...scrollViewProps
}) => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const controllerRef = useRef<KeyboardAwareScrollController | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS === "web") return undefined;
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const contextValue = useMemo<KeyboardAwareContextType>(
    () => ({
      scrollRef,
      scrollToFocusedInput: () => controllerRef.current?.scrollToFocusedInput(),
      keyboardHeight,
      isKeyboardVisible: keyboardHeight > 0,
    }),
    [keyboardHeight]
  );

  const content = (
    <KeyboardAwareScrollView
      ref={scrollRef}
      controllerRef={controllerRef}
      extraScrollHeight={extraScrollHeight}
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.defaultContent,
        { paddingBottom: Math.max(insets.bottom, 20) + 30 },
        contentStyle,
      ]}
      {...scrollViewProps}
    >
      {children}
    </KeyboardAwareScrollView>
  );

  return (
    <KeyboardAwareContext.Provider value={contextValue}>
      <View style={[styles.container, containerStyle]}>
        {dismissKeyboardOnTap ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            {content}
          </TouchableWithoutFeedback>
        ) : (
          content
        )}
      </View>
    </KeyboardAwareContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  defaultContent: {
    flexGrow: 1,
  },
});

export default KeyboardAwareFormLayout;
