import { BRAND_ASSETS } from '@/core/config/appConfig';
import './BrandLockup.css';

export interface BrandLockupProps {
  readonly appName: string;
  readonly tagline: string;
  readonly logoSrc: string;
}

/**
 * The part of the name rendered in the accent colour: the second word of a CamelCase name ("FinSolz" ->
 * "Fin" + "Solz"), otherwise from the brand's configured position ("Finsolz" -> "Fin" + "solz").
 */
function splitWordmark(appName: string): [string, string] {
  const camelStart = appName.slice(1).search(/[A-Z]/) + 1;
  const accentStart = camelStart > 0 ? camelStart : BRAND_ASSETS.wordmarkAccentFrom;
  return accentStart > 0 && accentStart < appName.length ? [appName.slice(0, accentStart), appName.slice(accentStart)] : [appName, ''];
}

export function BrandLockup({ appName, tagline, logoSrc }: BrandLockupProps) {
  const [lead, accent] = splitWordmark(appName);

  return (
    <span className="tx-brand">
      <img className="tx-brand__logo" src={logoSrc} alt="" width={44} height={44} />
      <span className="tx-brand__text">
        <span className="tx-brand__wordmark" aria-label={appName}>
          <span aria-hidden="true">{lead}</span>
          <span className="tx-brand__accent" aria-hidden="true">
            {accent}
          </span>
        </span>
        <span className="tx-brand__tagline">{tagline}</span>
      </span>
    </span>
  );
}
