import { useState } from 'react';
import { formatRupees } from '@/modules/workflow';
import type { TrendBucket } from '../../shared/financialDashboard';
import './FinancialTrendChart.css';

export interface FinancialTrendChartProps {
  readonly title: string;
  readonly buckets: readonly TrendBucket[];
}

/** Rounds the top gridline up to a tidy figure (1, 2 or 5 × a power of ten) so the scale reads easily. */
function niceMax(value: number): number {
  if (value <= 0) return 1000;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((factor) => factor * power >= value) ?? 10;
  return step * power;
}

/** Room under the bars for the day or month labels; gridlines and bars both measure from above it. */
const LABEL_SPACE = '22px';

const compact = (amount: number) => (amount >= 100_000 ? `₹${(amount / 100_000).toFixed(amount >= 1_000_000 ? 0 : 1)}L` : amount >= 1000 ? `₹${Math.round(amount / 1000)}K` : `₹${amount}`);

/**
 * Money collected per day (month view) or per month (year view). One series in one colour, so the title
 * names it and no legend is needed; every bar has a tooltip and the same figures are in a table for
 * screen readers.
 */
export function FinancialTrendChart({ title, buckets }: FinancialTrendChartProps) {
  const [active, setActive] = useState<string | null>(null);
  const max = niceMax(Math.max(0, ...buckets.map((bucket) => bucket.amount)));
  const ticks = [max, max / 2, 0];
  const focused = buckets.find((bucket) => bucket.key === active) ?? null;
  const total = buckets.reduce((sum, bucket) => sum + bucket.amount, 0);
  const dense = buckets.length > 12;

  return (
    <figure className="tx-fin-trend">
      <figcaption className="tx-fin-trend__head">
        <span className="tx-fin-trend__title">{title}</span>
        <span className="tx-fin-trend__readout" aria-live="polite">
          {focused ? `${focused.longLabel}: ${formatRupees(focused.amount)} · ${focused.payments} payment${focused.payments === 1 ? '' : 's'}` : `Total ${formatRupees(total)}`}
        </span>
      </figcaption>

      <div className="tx-fin-trend__plot" aria-hidden="true">
        <div className="tx-fin-trend__axis">
          {ticks.map((tick) => (
            <span key={tick}>{compact(tick)}</span>
          ))}
        </div>
        <div className="tx-fin-trend__area" onMouseLeave={() => setActive(null)}>
          {ticks.map((tick) => (
            <span key={tick} className="tx-fin-trend__grid" style={{ bottom: `calc(${LABEL_SPACE} + (100% - ${LABEL_SPACE}) * ${tick / max})` }} />
          ))}
          <div className={`tx-fin-trend__bars ${dense ? 'tx-fin-trend__bars--dense' : ''}`}>
            {buckets.map((bucket, index) => (
              <button
                key={bucket.key}
                type="button"
                tabIndex={-1}
                className={`tx-fin-trend__slot ${bucket.key === active ? 'tx-fin-trend__slot--active' : ''}`}
                onMouseEnter={() => setActive(bucket.key)}
                onFocus={() => setActive(bucket.key)}
                onClick={() => setActive(bucket.key)}
              >
                <span className="tx-fin-trend__bar" style={{ height: bucket.amount > 0 ? `max(3px, calc((100% - ${LABEL_SPACE}) * ${bucket.amount / max}))` : '0' }} />
                <span className="tx-fin-trend__label">{!dense || index === 0 || (index + 1) % 5 === 0 ? bucket.label : ''}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <table className="tx-sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Collected</th>
            <th scope="col">Payments</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((bucket) => (
            <tr key={bucket.key}>
              <th scope="row">{bucket.longLabel}</th>
              <td>{formatRupees(bucket.amount)}</td>
              <td>{bucket.payments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
