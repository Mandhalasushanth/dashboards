import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import './VerificationCodeInput.css';

export interface VerificationCodeInputProps {
  readonly id: string;
  readonly length: number;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly label: string;
  readonly error?: string;
  readonly disabled?: boolean;
}

const digitsOnly = (text: string) => text.replace(/\D/g, '');

/** One box per digit: typing moves to the next box, Backspace moves back, and pasting fills every box. */
export function VerificationCodeInput({ id, length, value, onChange, label, error, disabled }: VerificationCodeInputProps) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const focusBox = (index: number) => boxes.current[Math.max(0, Math.min(index, length - 1))]?.focus();

  const setDigit = (index: number, typed: string) => {
    const digit = digitsOnly(typed).slice(-1);
    const next = `${value.slice(0, index)}${digit}${value.slice(index + 1)}`.slice(0, length);
    onChange(digitsOnly(next));
    if (digit) focusBox(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !value[index]) {
      event.preventDefault();
      onChange(value.slice(0, Math.max(0, index - 1)));
      focusBox(index - 1);
    }
    if (event.key === 'ArrowLeft') focusBox(index - 1);
    if (event.key === 'ArrowRight') focusBox(index + 1);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = digitsOnly(event.clipboardData.getData('text')).slice(0, length);
    onChange(pasted);
    focusBox(pasted.length);
  };

  return (
    <fieldset className="tx-code-input" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="tx-code-input__label">{label}</legend>
      <div className="tx-code-input__boxes">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              boxes.current[index] = element;
            }}
            id={index === 0 ? id : `${id}-${index}`}
            className={`tx-code-input__box${error ? ' tx-code-input__box--invalid' : ''}`}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={value[index] ?? ''}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={error ? true : undefined}
            disabled={disabled}
            onChange={(event) => setDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
          />
        ))}
      </div>
      {error ? (
        <p id={`${id}-error`} className="tx-code-input__error" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
