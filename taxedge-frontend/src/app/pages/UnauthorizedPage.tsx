import { StatusMessage, useDocumentTitle } from '@/shared';
import { useHomeRoute } from '../routing/useHomeRoute';

export function UnauthorizedPage() {
  useDocumentTitle('Access denied');
  const home = useHomeRoute();

  return (
    <StatusMessage
      iconName="lock"
      code="403"
      title="Access denied"
      description="Your role does not have access to this area. Contact your administrator if you believe this is a mistake."
      actionLabel={home.label}
      actionTo={home.path}
    />
  );
}
