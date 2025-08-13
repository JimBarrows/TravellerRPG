import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}: CardProps) => {
  const variantClasses = {
    default: 'bg-card text-card-foreground border border-border',
    bordered: 'bg-card text-card-foreground border-2 border-border',
    elevated: 'bg-card text-card-foreground shadow-lg',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      className={`rounded-lg ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const CardHeader = ({
  children,
  title,
  subtitle,
  className = '',
  ...props
}: CardHeaderProps) => {
  return (
    <div className={`pb-4 ${className}`} {...props}>
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      {!title && !subtitle && children}
    </div>
  );
};

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardContent = ({
  children,
  className = '',
  ...props
}: CardContentProps) => {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardFooter = ({
  children,
  className = '',
  ...props
}: CardFooterProps) => {
  return (
    <div className={`pt-4 mt-4 border-t border-border ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;