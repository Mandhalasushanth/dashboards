/**
 * Pure geometry behind the keyboard-aware components. All values are in dp, with Y measured down
 * from the top of the window. Kept free of React Native so it can be tested without a device.
 */

/** How far the keyboard reaches into a view whose bottom edge is at `viewBottom` (0 when it does not). */
export function keyboardOverlap(viewBottom: number, keyboardTop: number): number {
  return Math.max(0, Math.round(viewBottom - keyboardTop));
}

export interface ScrollTargetInput {
  /** Top of the focused input inside the scroll content. */
  inputY: number;
  inputHeight: number;
  /** Current scroll offset. */
  currentOffset: number;
  /** Height of the scroll view that is not covered by the keyboard. */
  visibleHeight: number;
  /** Room kept between the input and the keyboard (room for its validation message). */
  extraScrollHeight: number;
}

/**
 * Where to scroll so the focused input is visible above the keyboard, or null when it already is.
 * A tall multiline input keeps its top visible; an input scrolled above the viewport is brought back.
 */
export function computeScrollTarget({
  inputY,
  inputHeight,
  currentOffset,
  visibleHeight,
  extraScrollHeight,
}: ScrollTargetInput): number | null {
  const inputBottom = inputY + inputHeight;
  let target: number | null = null;

  if (inputHeight + extraScrollHeight > visibleHeight) {
    target = inputY - Math.min(extraScrollHeight / 2, 16);
  } else if (inputBottom + extraScrollHeight > currentOffset + visibleHeight) {
    target = inputBottom + extraScrollHeight - visibleHeight;
  } else if (inputY < currentOffset) {
    target = inputY - Math.min(extraScrollHeight / 2, 16);
  }

  if (target == null) return null;
  target = Math.max(0, target);
  return Math.abs(target - currentOffset) < 1 ? null : target;
}

/**
 * How far to lift a bottom bar so the keyboard does not cover it. `naturalBottom` is where the bar's
 * bottom edge would be with no lift (so measuring again after a lift does not compound it).
 */
export function footerLift(naturalBottom: number, keyboardTop: number): number {
  return keyboardOverlap(naturalBottom, keyboardTop);
}
