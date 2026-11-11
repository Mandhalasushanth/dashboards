import './SecureAccessHeading.css';

export interface SecureAccessHeadingProps {
  readonly appName: string;
  readonly logoSrc: string;
  readonly title: string;
  readonly subtitle: string;
}

export function SecureAccessHeading({ appName, logoSrc, title, subtitle }: SecureAccessHeadingProps) {
  return (
    <header className="tx-secure-heading">
      <div className="tx-secure-heading__brand">
        {/* The full logo already carries the name and tagline, so the name is not repeated as text. */}
        <img className="tx-secure-heading__logo" src={logoSrc} alt={appName} width={640} height={478} />
      </div>
      <h1 className="tx-secure-heading__title">{title}</h1>
      <p className="tx-secure-heading__subtitle">{subtitle}</p>
    </header>
  );
}
