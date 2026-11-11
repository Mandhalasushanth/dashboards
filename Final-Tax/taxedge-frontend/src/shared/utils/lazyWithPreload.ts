import { createElement, lazy, type ComponentType } from 'react';

type PageModule = { default: ComponentType };

export type PreloadableComponent = ComponentType & { preload: () => Promise<void> };

/**
 * Like React.lazy, but the code can be fetched ahead of time with `preload()`. Once loaded,
 * the page renders straight away instead of suspending, so no loading state flashes on navigation.
 */
export function lazyWithPreload(loader: () => Promise<PageModule>): PreloadableComponent {
  let loaded: ComponentType | null = null;
  let pending: Promise<PageModule> | null = null;

  const load = (): Promise<PageModule> => {
    pending ??= loader().then((module) => {
      loaded = module.default;
      return module;
    });
    return pending;
  };

  const LazyPage = lazy(load);
  const Page = () => createElement(loaded ?? LazyPage);

  return Object.assign(Page, {
    preload: async () => {
      try {
        await load();
      } catch {
        // A failed prefetch is retried by React.lazy when the page is actually opened.
        pending = null;
      }
    }
  });
}
