import { useEffect } from 'react';
import { environment } from '@/core/config/environment';

export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    document.title = `${pageTitle} · ${environment.appName}`;
  }, [pageTitle]);
}
