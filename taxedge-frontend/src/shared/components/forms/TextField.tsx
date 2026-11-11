import { useState, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import './TextField.css';

type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'id' | 'type' | 'size'>;

export interface TextFieldProps extends NativeInputProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly type?: 'text' | 'password';
  readonly iconName?: IconName;
  readonly error?: string | null;
  /** Adds a show/hide toggle; only meaningful for password inputs. */
  readonly revealable?: boolean;
}

export function TextField({
  id,
  label,
  value,
  onValueChange,
  type = 'text',
  iconName,
  error,
  revealable = false,
  disabled,
  className = '',
  ...inputProps
}: TextFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const errorId = `${id}-error`;
  const inputType = revealable && revealed ? 'text' : type;
  const controlClasses = ['tx-field__control', error ? 'tx-field__control--invalid' : '', iconName ? 'tx-field__control--with-icon' : '']
    .filter(Boolean)
    .join(' ');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onValueChange(event.target.value);
  const toggleReveal = () => setRevealed((current) => !current);

  return (
    <div className={`tx-field ${className}`.trim()}>
      <label className="tx-field__label" htmlFor={id}>
        {label}
      </label>
      <div className={controlClasses}>
        {iconName ? <Icon name={iconName} className="tx-field__icon" /> : null}
        <input
          {...inputProps}
          id={id}
          type={inputType}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="tx-field__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        {revealable ? (
          <button
            type="button"
            className="tx-field__reveal"
            onClick={toggleReveal}
            disabled={disabled}
            aria-label={revealed ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={revealed}
            aria-controls={id}
          >
            <Icon name={revealed ? 'eye-off' : 'eye'} />
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="tx-field__error" role="alert">
          <Icon name="alert-circle" size="sm" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
