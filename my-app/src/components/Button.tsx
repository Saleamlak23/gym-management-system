import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import '../styles/components.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseClass = `btn btn-${variant} btn-${size}`;
  const finalClass = className ? `${baseClass} ${className}` : baseClass;

  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={finalClass}
    >
      {loading ? <span className="spinner-small"></span> : children}
    </button>
  );
}
