import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly loading?: boolean;
  /** Replaces the label while loading, e.g. "Signing in…". */
  readonly loadingLabel?: string;
  readonly iconName?: IconName;
  readonly fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingLabel,
    iconName,
    fullWidth = false,
    className = '',
    type = 'button',
    disabled,
    ...rest
  },
  ref
) {
  const classes = [
    'tx-button',
    `tx-button--${variant}`,
    `tx-button--${size}`,
    fullWidth ? 'tx-button--full' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');
  const leading = loading ? <LoadingSpinner /> : iconName ? <Icon name={iconName} size="sm" /> : null;

  return (
    <button ref={ref} {...rest} type={type} className={classes} disabled={disabled || loading} aria-busy={loading}>
      {leading}
      <span className="tx-button__label">{loading && loadingLabel ? loadingLabel : children}</span>
    </button>
  );
});
