import { useState, useEffect } from "react";
import { Keyboard, KeyboardEvent, Platform } from "react-native";

export interface KeyboardState {
  keyboardShown: boolean;
  keyboardHeight: number;
}

export function useKeyboard(): KeyboardState {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    keyboardShown: false,
    keyboardHeight: 0,
  });

  useEffect(() => {
    if (Platform.OS === "web") return;

    const showSubscription = Keyboard.addListener("keyboardDidShow", (e: KeyboardEvent) => {
      setKeyboardState({
        keyboardShown: true,
        keyboardHeight: e.endCoordinates.height,
      });
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardState({
        keyboardShown: false,
        keyboardHeight: 0,
      });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardState;
}

export default useKeyboard;
