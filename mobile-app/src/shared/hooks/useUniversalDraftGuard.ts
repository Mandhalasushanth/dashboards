import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePreventRemove } from "expo-router";
import { toHref } from "@/shared/utils/navigation";

export interface UseUniversalDraftGuardOptions {
  /** Return true if the user has unsaved input/dirty state that should trigger draft confirmation */
  isDirty: () => boolean;
  /** Callback executed when user chooses "Save as Draft & Exit" — may be async */
  onSaveDraft: () => void | Promise<void>;
  /** Callback executed when user chooses "Discard & Exit" — may be async */
  onDiscardDraft: () => void | Promise<void>;
  /** Return true if screen is in final success/completed state where user can navigate away freely */
  isSubmitted?: () => boolean;
  /** Optional explicit route to navigate to when discarding, overriding the original back action */
  discardDestination?: string;
  /** Optional explicit route to navigate to when saving draft, overriding the original back action */
  saveDestination?: string;
}

export const useUniversalDraftGuard = ({
  isDirty,
  onSaveDraft,
  onDiscardDraft,
  isSubmitted = () => false,
  discardDestination,
  saveDestination,
}: UseUniversalDraftGuardOptions) => {
  const router = useRouter();

  const [showDraftModal, setShowDraftModal] = useState(false);
  const [hasExited, setHasExited] = useState(false);
  const pendingRepeatRef = useRef<(() => void) | null>(null);
  const disablePreventionRef = useRef<(() => void) | null>(null);
  const isModalShownRef = useRef(false);

  // Keep refs in sync with callbacks (no deps = runs after every render)
  const onSaveDraftRef = useRef(onSaveDraft);
  const onDiscardDraftRef = useRef(onDiscardDraft);
  const discardDestinationRef = useRef(discardDestination);
  const saveDestinationRef = useRef(saveDestination);

  useEffect(() => {
    onSaveDraftRef.current = onSaveDraft;
    onDiscardDraftRef.current = onDiscardDraft;
    discardDestinationRef.current = discardDestination;
    saveDestinationRef.current = saveDestination;
  });

  const markSubmitted = useCallback(() => {
    setHasExited(true);
    disablePreventionRef.current?.();
  }, []);

  // Computed fresh each render from props — no lag, no extra state update cycle.
  // usePreventRemove in react-navigation v7 intercepts both hardware Back and
  // programmatic router.back(), replacing the legacy beforeRemove approach.
  const shouldPreventRemove = !hasExited && !isSubmitted() && isDirty();

  const disablePrevention = usePreventRemove(
    shouldPreventRemove,
    useCallback(({ repeat }) => {
      if (isModalShownRef.current) return;
      pendingRepeatRef.current = repeat;
      isModalShownRef.current = true;
      setShowDraftModal(true);
    }, []),
  );

  // Keep disablePreventionRef current so event handlers can call it without being in their deps
  useEffect(() => {
    disablePreventionRef.current = disablePrevention;
  }, [disablePrevention]);

  // BUG_B24_001: both handlers must await async onSaveDraft/onDiscardDraft before navigating
  const handleSaveAndExit = useCallback(async () => {
    await onSaveDraftRef.current();
    setShowDraftModal(false);
    isModalShownRef.current = false;
    setHasExited(true);

    if (saveDestinationRef.current) {
      disablePreventionRef.current?.();
      pendingRepeatRef.current = null;
      router.replace(toHref(saveDestinationRef.current));
    } else if (pendingRepeatRef.current) {
      // Navigation-triggered path: repeat() calls disablePrevention() internally
      const fn = pendingRepeatRef.current;
      pendingRepeatRef.current = null;
      fn();
    } else {
      // openDraftModal() direct path: disable manually before navigating
      disablePreventionRef.current?.();
      router.back();
    }
  }, [router]);

  const handleDiscardAndExit = useCallback(async () => {
    await onDiscardDraftRef.current();
    setShowDraftModal(false);
    isModalShownRef.current = false;
    setHasExited(true);

    if (discardDestinationRef.current) {
      disablePreventionRef.current?.();
      pendingRepeatRef.current = null;
      router.replace(toHref(discardDestinationRef.current));
    } else if (pendingRepeatRef.current) {
      const fn = pendingRepeatRef.current;
      pendingRepeatRef.current = null;
      fn();
    } else {
      disablePreventionRef.current?.();
      router.back();
    }
  }, [router]);

  const handleCancel = useCallback(() => {
    setShowDraftModal(false);
    isModalShownRef.current = false;
    pendingRepeatRef.current = null;
  }, []);

  const openDraftModal = useCallback(() => {
    isModalShownRef.current = true;
    setShowDraftModal(true);
  }, []);

  return {
    showDraftModal,
    openDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  };
};
