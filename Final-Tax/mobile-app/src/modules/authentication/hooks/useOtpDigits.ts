import { useCallback, useEffect, useRef, useState } from "react";
import type { TextInput } from "react-native";
import {
  backspaceInEmptyBox,
  digitsFromOtp,
  editDigit,
  firstEmptyIndex,
  joinDigits,
  resolveDigits,
  type DigitEdit,
  type OtpDigits,
} from "./otpDigits";

interface UseOtpDigitsOptions {
  /** The OTP held by the parent (auth store). */
  otp: string;
  onChangeOtp: (otp: string) => void;
  /** While true (server lockout) no edit is applied. */
  locked: boolean;
}

/**
 * State and handlers for six individually editable OTP boxes.
 *
 * The boxes are the source of truth while the user edits (so a cleared middle box can stay empty);
 * every edit reports the joined digits to the parent. If the parent's value ever differs from the
 * boxes (it was reset after a resend, say) the parent wins.
 */
export function useOtpDigits({ otp, onChangeOtp, locked }: UseOtpDigitsOptions) {
  const [edited, setEdited] = useState<OtpDigits>(() => digitsFromOtp(otp));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const refs = useRef<(TextInput | null)[]>([]);

  const digits = resolveDigits(edited, otp);

  // The OTP form appears with empty boxes: put the cursor in the first one.
  useEffect(() => {
    const t = setTimeout(() => refs.current[0]?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const focusBox = useCallback((index: number) => {
    refs.current[index]?.focus();
  }, []);

  const commit = (edit: DigitEdit) => {
    setEdited(edit.digits);
    onChangeOtp(joinDigits(edit.digits));
    focusBox(edit.focusIndex);
  };

  const handleChangeText = (index: number, text: string) => {
    if (locked) return;
    commit(editDigit(digits, index, text));
  };

  const handleKeyPress = (index: number, key: string) => {
    if (locked || key !== "Backspace") return;
    const edit = backspaceInEmptyBox(digits, index);
    if (edit) commit(edit);
  };

  return {
    digits,
    /** The box drawn as current: the focused one, else the next one to fill. */
    currentIndex: focusedIndex ?? firstEmptyIndex(digits),
    setBoxRef: (index: number) => (node: TextInput | null) => {
      refs.current[index] = node;
    },
    handleChangeText,
    handleKeyPress,
    handleFocus: (index: number) => setFocusedIndex(index),
    handleBlur: (index: number) => setFocusedIndex((current) => (current === index ? null : current)),
  };
}
