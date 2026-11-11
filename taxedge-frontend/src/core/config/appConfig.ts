/** Static asset locations, resolved against the deployment base path. */
const baseUrl = import.meta.env.BASE_URL;

export const BRAND_ASSETS = Object.freeze({
  /** The Finsolz "F" mark on a transparent background: sidebar, login card and notification preview. */
  logo: `${baseUrl}assets/brand/finsolz-mark.png`,
  /** The full logo with the Finsolz wordmark and tagline, for places that show the brand on its own. */
  logoFull: `${baseUrl}assets/brand/finsolz-logo.png`,
  /**
   * Where the accent colour starts in the wordmark when the name has no second capital: "Finsolz" reads
   * "Fin" + "solz", as in the logo.
   */
  wordmarkAccentFrom: 3
});
