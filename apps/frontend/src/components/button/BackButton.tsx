import Link from 'next/link';

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  iconClassName?: string;
}

export function BackButton(props: BackButtonProps) {
  const {
    href,
    onClick,
    className = '',
    ariaLabel = 'Go back',
    iconClassName = 'text-2xl',
  } = props;

  const baseClassName =
    'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 no-underline';

  const icon = <i className={`bi bi-caret-left-fill ${iconClassName}`} />;

  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={`${baseClassName} ${className}`}
      >
        {icon}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`${baseClassName} ${className}`}
    >
      {icon}
    </button>
  );
}
