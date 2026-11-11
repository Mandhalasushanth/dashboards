import { StatusMessage, useDocumentTitle } from '@/shared';
import { useHomeRoute } from '../routing/useHomeRoute';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  const home = useHomeRoute();

  return (
    <StatusMessage
      iconName="alert-circle"
      code="404"
      title="Page not found"
      description="The page you are looking for does not exist or has been moved."
      actionLabel={home.label}
      actionTo={home.path}
    />
  );
}
