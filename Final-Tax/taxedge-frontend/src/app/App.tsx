import { AppProviders } from './bootstrap/AppProviders';
import { AppRouter } from './routing/AppRouter';

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
