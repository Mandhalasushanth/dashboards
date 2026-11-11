import { useState, type InputHTMLAttributes } from 'react';
import { Icon } from '@/shared';
import './RevealablePasswordInput.css';

export type RevealablePasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/** Password input with an eye button that shows or hides what was typed. */
export function RevealablePasswordInput({ disabled, ...inputProps }: RevealablePasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="tx-reveal-input">
      <input {...inputProps} type={visible ? 'text' : 'password'} disabled={disabled} />
      <button
        type="button"
        className="tx-reveal-input__toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        disabled={disabled}
      >
        <Icon name={visible ? 'eye-off' : 'eye'} size="sm" />
      </button>
    </div>
  );
}
