import { useState } from 'react';
import { WorkflowModal } from '@/modules/workflow';
import { Button, InlineAlert, InputField, SelectField, TextAreaField } from '@/shared';
import {
  GST_RATES,
  PRICING_MODELS,
  PRICING_MODEL_LABELS,
  type AmountMode,
  type CatalogService,
  type CatalogServiceUpdate,
  type GstRate,
  type PricingModel
} from '../../shared/serviceCatalog.types';
import { adjustmentOn, formatInr, priceFor } from '../../shared/servicePricing';
import { CATALOG_LIMITS, validateCatalogUpdate } from '../../validation/serviceCatalogSchema';
import './ServiceEditModal.css';

export interface ServiceEditModalProps {
  readonly service: CatalogService;
  readonly onSave: (update: CatalogServiceUpdate) => Promise<string | null>;
  readonly onSaved: (name: string) => void;
  readonly onClose: () => void;
}

/** Every number is kept as typed text until saving, so a half-typed value never turns into 0. */
interface FormState {
  readonly name: string;
  readonly description: string;
  readonly model: PricingModel;
  readonly fee: string;
  readonly percent: string;
  readonly percentOf: string;
  readonly minimumFee: string;
  readonly gstRate: string;
  readonly discountMode: AmountMode;
  readonly discount: string;
  readonly promoPrice: string;
  readonly promoUntil: string;
  readonly commissionMode: AmountMode;
  readonly commission: string;
  readonly incentiveMode: AmountMode;
  readonly incentive: string;
  readonly slaDays: string;
  readonly active: boolean;
  /** Only for the preview of a percentage or quoted price; never saved. */
  readonly sampleAmount: string;
}

const text = (value: number) => (value > 0 ? String(value) : '');

const toForm = (s: CatalogService): FormState => ({
  name: s.name,
  description: s.description,
  model: s.pricing.model,
  fee: text(s.pricing.fee),
  percent: text(s.pricing.percent),
  percentOf: s.pricing.percentOf,
  minimumFee: text(s.pricing.minimumFee),
  gstRate: String(s.gstRate),
  discountMode: s.discount.mode,
  discount: text(s.discount.value),
  promoPrice: s.promotion.price === null ? '' : String(s.promotion.price),
  promoUntil: s.promotion.validUntil ?? '',
  commissionMode: s.commission.mode,
  commission: text(s.commission.value),
  incentiveMode: s.staffIncentive.mode,
  incentive: text(s.staffIncentive.value),
  slaDays: String(s.slaDays),
  active: s.active,
  sampleAmount: ''
});

/** Empty optional fields mean "none" (0); a required empty field becomes NaN so validation flags it. */
const optional = (value: string) => (value === '' ? 0 : Number(value));
const required = (value: string) => (value === '' ? Number.NaN : Number(value));

const toUpdate = (f: FormState): CatalogServiceUpdate => ({
  name: f.name,
  description: f.description,
  pricing: {
    model: f.model,
    fee: f.model === 'FIXED' || f.model === 'MINIMUM' ? required(f.fee) : f.model === 'QUOTED' ? optional(f.fee) : 0,
    percent: f.model === 'PERCENTAGE' ? required(f.percent) : 0,
    percentOf: f.model === 'PERCENTAGE' ? f.percentOf : '',
    minimumFee: f.model === 'PERCENTAGE' ? optional(f.minimumFee) : 0
  },
  gstRate: Number(f.gstRate) as GstRate,
  discount: { mode: f.discountMode, value: optional(f.discount) },
  promotion: { price: f.promoPrice === '' ? null : Number(f.promoPrice), validUntil: f.promoPrice === '' || f.promoUntil === '' ? null : f.promoUntil },
  commission: { mode: f.commissionMode, value: optional(f.commission) },
  staffIncentive: { mode: f.incentiveMode, value: optional(f.incentive) },
  slaDays: required(f.slaDays),
  active: f.active
});

/** Digits only for rupees and days; digits and one decimal point for a percentage. */
const sanitize = (value: string, decimals: boolean) =>
  decimals ? value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 6) : value.replace(/\D/g, '').slice(0, 8);

const MODE_OPTIONS = [
  { value: 'AMOUNT' as AmountMode, label: '₹ amount' },
  { value: 'PERCENT' as AmountMode, label: '% of fee' }
];

const MODEL_HINTS: Readonly<Record<PricingModel, string>> = Object.freeze({
  FIXED: 'Every customer pays this price.',
  MINIMUM: 'The least a customer pays; the manager can charge more when sending the payment request.',
  PERCENTAGE: 'A share of an amount the customer gives, such as the refund or loan value.',
  QUOTED: 'The manager sets the price for each application when sending the payment request.'
});

export function ServiceEditModal({ service, onSave, onSaved, onClose }: ServiceEditModalProps) {
  const [form, setForm] = useState<FormState>(() => toForm(service));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const id = (name: string) => `tx-catalog-${name}`;

  const handleSubmit = async () => {
    const update = toUpdate(form);
    const found = validateCatalogUpdate(update);
    setErrors(found);
    if (Object.keys(found).length > 0 || busy) return;
    setBusy(true);
    setServerError(null);
    const failure = await onSave(update);
    setBusy(false);
    if (failure) {
      setServerError(failure);
      return;
    }
    onSaved(update.name.trim());
  };

  const update = toUpdate(form);
  const needsSample = form.model === 'PERCENTAGE' || form.model === 'QUOTED';
  const preview = Object.keys(validateCatalogUpdate(update)).length === 0
    ? priceFor({ ...service, ...update }, needsSample ? optional(form.sampleAmount) : undefined)
    : null;

  const adjustmentFields = (label: string, modeKey: 'discountMode' | 'commissionMode' | 'incentiveMode', valueKey: 'discount' | 'commission' | 'incentive', errorKey: string, hint: string) => (
    <div className="tx-catalog-edit__pair">
      <InputField
        id={id(valueKey)}
        label={label}
        value={form[valueKey]}
        onChange={(value) => set(valueKey, sanitize(value, form[modeKey] === 'PERCENT'))}
        inputMode={form[modeKey] === 'PERCENT' ? 'decimal' : 'numeric'}
        placeholder={form[modeKey] === 'PERCENT' ? 'e.g. 10' : 'e.g. 500'}
        error={errors[errorKey]}
      />
      <SelectField<AmountMode> id={id(`${valueKey}-mode`)} label="As" value={form[modeKey]} onChange={(value) => setForm((current) => ({ ...current, [modeKey]: value, [valueKey]: '' }))} options={MODE_OPTIONS} />
      <p className="tx-catalog-edit__hint tx-catalog-edit__pair-hint">{hint}</p>
    </div>
  );

  return (
    <WorkflowModal
      title={`Edit ${service.name}`}
      subtitle={`${service.category} · Changes apply to new payment requests; requests already sent keep their amount.`}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      busy={busy}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" iconName="save" loading={busy} loadingLabel="Saving…">
            Save Pricing
          </Button>
        </>
      }
    >
      {serverError ? <InlineAlert tone="error">{serverError}</InlineAlert> : null}

      <section className="tx-catalog-edit__section" aria-labelledby={id('h-price')}>
        <h3 id={id('h-price')} className="tx-catalog-edit__heading">Price</h3>
        <div className="tx-catalog-edit__grid">
          <SelectField<PricingModel>
            id={id('model')}
            label="How it is priced *"
            value={form.model}
            onChange={(value) => setForm((current) => ({ ...current, model: value, fee: '', percent: '', minimumFee: '' }))}
            options={PRICING_MODELS.map((value) => ({ value, label: PRICING_MODEL_LABELS[value] }))}
          />
          {form.model === 'PERCENTAGE' ? (
            <InputField id={id('percent')} label="Percentage (%) *" value={form.percent} onChange={(value) => set('percent', sanitize(value, true))} inputMode="decimal" placeholder="e.g. 15" required error={errors.percent} />
          ) : (
            <InputField
              id={id('fee')}
              label={form.model === 'QUOTED' ? 'Usual quote (₹, optional)' : form.model === 'MINIMUM' ? 'Minimum price (₹) *' : 'Price (₹) *'}
              value={form.fee}
              onChange={(value) => set('fee', sanitize(value, false))}
              inputMode="numeric"
              placeholder="e.g. 5000"
              required={form.model !== 'QUOTED'}
              error={errors.fee}
            />
          )}
          {form.model === 'PERCENTAGE' ? (
            <>
              <InputField id={id('percent-of')} label="Percentage of *" value={form.percentOf} onChange={(value) => set('percentOf', value)} maxLength={CATALOG_LIMITS.percentOfMax} placeholder="e.g. refund value" required error={errors.percentOf} />
              <InputField id={id('minimum')} label="Minimum fee (₹, optional)" value={form.minimumFee} onChange={(value) => set('minimumFee', sanitize(value, false))} inputMode="numeric" placeholder="e.g. 500" error={errors.minimumFee} />
            </>
          ) : null}
          <SelectField id={id('gst')} label="GST *" value={form.gstRate} onChange={(value) => set('gstRate', value)} options={GST_RATES.map((rate) => ({ value: String(rate), label: `${rate}%` }))} error={errors.gstRate} />
        </div>
        <p className="tx-catalog-edit__hint">{MODEL_HINTS[form.model]}</p>
      </section>

      <section className="tx-catalog-edit__section" aria-labelledby={id('h-offers')}>
        <h3 id={id('h-offers')} className="tx-catalog-edit__heading">Offers</h3>
        {adjustmentFields('Discount (optional)', 'discountMode', 'discount', 'discount', 'Taken off every application of this service.')}
        <div className="tx-catalog-edit__grid">
          <InputField id={id('promo')} label="Promotional price (₹, optional)" value={form.promoPrice} onChange={(value) => set('promoPrice', sanitize(value, false))} inputMode="numeric" placeholder="e.g. 3999" error={errors.promotionPrice} />
          <InputField id={id('promo-until')} label="Offer ends on (optional)" type="date" value={form.promoUntil} onChange={(value) => set('promoUntil', value)} error={errors.promotionUntil} />
        </div>
        <p className="tx-catalog-edit__hint">Charged instead of the normal price while the offer runs. Leave the end date empty to run it until you clear the price.</p>
      </section>

      <section className="tx-catalog-edit__section" aria-labelledby={id('h-earnings')}>
        <h3 id={id('h-earnings')} className="tx-catalog-edit__heading">Commission &amp; staff incentive</h3>
        {adjustmentFields('Commission (optional)', 'commissionMode', 'commission', 'commission', 'What the firm earns per application, e.g. a lender’s payout on a loan.')}
        {adjustmentFields('Staff incentive (optional)', 'incentiveMode', 'incentive', 'staffIncentive', 'Paid to the assigned agent for each completed application.')}
      </section>

      <section className="tx-catalog-edit__section" aria-labelledby={id('h-service')}>
        <h3 id={id('h-service')} className="tx-catalog-edit__heading">Service</h3>
        <div className="tx-catalog-edit__grid">
          <InputField id={id('name')} label="Service name *" value={form.name} onChange={(value) => set('name', value)} maxLength={CATALOG_LIMITS.nameMax} required error={errors.name} />
          <InputField id={id('sla')} label="Turnaround (days) *" value={form.slaDays} onChange={(value) => set('slaDays', sanitize(value, false).slice(0, 2))} inputMode="numeric" placeholder={`${CATALOG_LIMITS.slaMin}–${CATALOG_LIMITS.slaMax}`} required error={errors.slaDays} />
        </div>
        <TextAreaField id={id('description')} label="Description (optional)" value={form.description} onChange={(value) => set('description', value)} rows={2} maxLength={CATALOG_LIMITS.descriptionMax} error={errors.description} />
        <label className="tx-catalog-edit__toggle">
          <input type="checkbox" checked={form.active} onChange={(event) => set('active', event.target.checked)} />
          <span>
            <strong>Accepting new applications</strong>
            <span className="tx-catalog-edit__hint">Pause a service to stop new submissions without affecting open cases.</span>
          </span>
        </label>
      </section>

      <section className="tx-catalog-edit__preview" aria-live="polite" aria-label="What the customer pays">
        <h3 className="tx-catalog-edit__heading">What the customer pays</h3>
        {needsSample ? (
          <InputField
            id={id('sample')}
            label={form.model === 'PERCENTAGE' ? `Try a ${form.percentOf.trim() || 'value'} (₹)` : 'Try a quote (₹)'}
            value={form.sampleAmount}
            onChange={(value) => set('sampleAmount', sanitize(value, false))}
            inputMode="numeric"
            placeholder="e.g. 20000"
          />
        ) : null}
        {preview ? (
          <dl className="tx-catalog-edit__bill">
            <div><dt>Price</dt><dd>{formatInr(preview.listPrice)}</dd></div>
            {preview.promotion ? <div><dt>Promotional price</dt><dd>{formatInr(update.promotion.price ?? 0)}</dd></div> : null}
            {preview.discount > 0 ? <div><dt>Discount</dt><dd>− {formatInr(preview.discount)}</dd></div> : null}
            <div><dt>Fee</dt><dd>{formatInr(preview.fee)}</dd></div>
            <div><dt>GST {update.gstRate}%</dt><dd>{formatInr(preview.gst)}</dd></div>
            <div className="tx-catalog-edit__total"><dt>Customer pays</dt><dd>{formatInr(preview.total)}</dd></div>
            {update.commission.value > 0 ? <div className="tx-catalog-edit__earn"><dt>Commission earned</dt><dd>{formatInr(adjustmentOn(update.commission, preview.fee))}</dd></div> : null}
            {update.staffIncentive.value > 0 ? <div className="tx-catalog-edit__earn"><dt>Agent incentive</dt><dd>{formatInr(adjustmentOn(update.staffIncentive, preview.fee))}</dd></div> : null}
          </dl>
        ) : (
          <p className="tx-catalog-edit__hint">{needsSample ? 'Enter an amount above to see the bill.' : 'Fix the highlighted fields to see the bill.'}</p>
        )}
      </section>

      {service.requiredDocuments.length > 0 ? (
        <details className="tx-catalog-edit__docs">
          <summary>Required documents ({service.requiredDocuments.length})</summary>
          <ul>{service.requiredDocuments.map((doc) => <li key={doc}>{doc}</li>)}</ul>
        </details>
      ) : null}
    </WorkflowModal>
  );
}
