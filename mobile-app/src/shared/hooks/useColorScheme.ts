/** The app has one light theme and ignores the phone's dark mode, so this is always "light". */
export function useColorScheme(): "light" | "dark" {
  return "light";
}

export default useColorScheme;

