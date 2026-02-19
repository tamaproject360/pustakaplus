interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

export default function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
  const base = variant === 'outline'
    ? 'border border-current bg-transparent'
    : '';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${base} ${className}`}>
      {children}
    </span>
  );
}
