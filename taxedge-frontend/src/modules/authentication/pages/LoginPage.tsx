import { useState } from 'react';
import { Navigate, useLocation, type Location } from 'react-router-dom';
import { BRAND_ASSETS } from '@/core/config/appConfig';
import { environment } from '@/core/config/environment';
import { GeometricBackdrop, InlineAlert, useDocumentTitle } from '@/shared';
import { ForgotPasswordFlow } from '../components/ForgotPasswordFlow';
import { LoginForm } from '../components/LoginForm';
import { SecureAccessHeading } from '../components/SecureAccessHeading';
import { SESSION_END_NOTICES } from '../shared/constants/authentication.constants';
import { useAuthentication } from '../hooks/useAuthentication';
import { useLoginForm } from '../hooks/useLoginForm';
import { resolvePostLoginRoute } from '../services/landingRouteService';
import './LoginPage.css';

interface RedirectState {
  readonly from?: Pick<Location, 'pathname' | 'search'>;
}

/** The page a guard bounced the user away from, so they can return to it after signing in. */
function readRequestedPath(state: unknown): string | null {
  const from = (state as RedirectState | null)?.from;
  return from?.pathname ? `${from.pathname}${from.search ?? ''}` : null;
}

/** One shared sign-in page for every role. The destination is decided from the server-issued role. */
export default function LoginPage() {
  useDocumentTitle('Secure Access');
  const { status, user, endReason } = useAuthentication();
  const controller = useLoginForm();
  const location = useLocation();
  const [resetting, setResetting] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  if (status === 'authenticated' && user) {
    return <Navigate to={resolvePostLoginRoute(user, readRequestedPath(location.state))} replace />;
  }

  const notice = endReason ? SESSION_END_NOTICES[endReason] : null;

  return (
    <GeometricBackdrop>
      <section className="tx-login-page" aria-label="Sign in">
        <SecureAccessHeading
          appName={environment.appName}
          logoSrc={BRAND_ASSETS.logoFull}
          title="Secure Access"
          subtitle="Sign in with the credentials provided by your administrator."
        />
        {resetting ? (
          <ForgotPasswordFlow
            initialEmail={controller.values.username}
            onBack={() => setResetting(false)}
            onComplete={(email) => {
              controller.changeField('username', email);
              controller.changeField('password', '');
              setPasswordUpdated(true);
              setResetting(false);
            }}
          />
        ) : (
          <>
            {passwordUpdated && !controller.formError ? (
              <InlineAlert tone="info" surface="dark">Your password has been reset. Sign in with your new password.</InlineAlert>
            ) : notice && !controller.formError ? (
              <InlineAlert tone={notice.tone} surface="dark">{notice.message}</InlineAlert>
            ) : null}
            <LoginForm
              controller={controller}
              onForgotPassword={() => {
                setPasswordUpdated(false);
                setResetting(true);
              }}
            />
          </>
        )}
        <p className="tx-login-page__footnote">
          Access is limited to accounts provisioned by your {environment.appName} administrator.
        </p>
      </section>
    </GeometricBackdrop>
  );
}
