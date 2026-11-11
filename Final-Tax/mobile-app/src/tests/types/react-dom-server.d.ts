// The app does not ship @types/react-dom. Tests render components to static markup with
// react-dom/server (see scripts/run-auth-lockout-tests.cjs), so declare just that one function.
declare module "react-dom/server" {
  export function renderToStaticMarkup(element: import("react").ReactElement): string;
}
