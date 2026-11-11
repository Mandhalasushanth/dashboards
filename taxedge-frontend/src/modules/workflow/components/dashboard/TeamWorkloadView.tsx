import { useDocumentTitle } from '@/shared';
import { TeamWorkloadPanel } from './TeamWorkloadPanel';
import './TeamWorkloadView.css';

export interface TeamWorkloadViewProps {
  readonly title: string;
}

/** Full team page: every agent in the manager's team (or all teams for admins) with live case counts. */
export function TeamWorkloadView({ title }: TeamWorkloadViewProps) {
  useDocumentTitle(title);
  return (
    <div className="tx-team-view">
      <section className="tx-team-view__panel">
        <TeamWorkloadPanel />
      </section>
    </div>
  );
}
