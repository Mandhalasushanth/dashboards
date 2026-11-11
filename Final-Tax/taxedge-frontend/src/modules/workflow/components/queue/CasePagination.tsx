import { Icon } from '@/shared';
import './CasePagination.css';

export interface CasePaginationProps {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly onPageChange: (page: number) => void;
  readonly itemLabel?: string;
}

export function CasePagination({ page, pageSize, total, onPageChange, itemLabel = 'applications' }: CasePaginationProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);

  // Everything fits on one list, so show just the count; page buttons appear only for a very long list.
  if (lastPage === 1) {
    return (
      <p className="tx-pagination__summary" aria-live="polite">
        {total.toLocaleString()} {total === 1 ? itemLabel.replace(/s$/, '') : itemLabel}
      </p>
    );
  }

  return (
    <nav className="tx-pagination" aria-label="Pagination">
      <p className="tx-pagination__summary" aria-live="polite">
        Showing {first}–{last} of {total.toLocaleString()} {itemLabel}
      </p>
      <div className="tx-pagination__controls">
        <button type="button" className="tx-pagination__btn" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <Icon name="chevron-left" size="sm" />
        </button>
        <span className="tx-pagination__page">
          Page {page} of {lastPage}
        </span>
        <button type="button" className="tx-pagination__btn" onClick={() => onPageChange(page + 1)} disabled={page >= lastPage} aria-label="Next page">
          <Icon name="chevron-right" size="sm" />
        </button>
      </div>
    </nav>
  );
}
