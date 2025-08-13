import { createElement } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'overline';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  children: ReactNode;
  as?: string;
}

const Typography = ({
  variant = 'body',
  color = 'default',
  align = 'left',
  weight = 'normal',
  children,
  className = '',
  as,
  ...props
}: TypographyProps) => {
  const variantClasses = {
    h1: 'text-5xl font-bold tracking-tight',
    h2: 'text-4xl font-semibold tracking-tight',
    h3: 'text-3xl font-semibold',
    h4: 'text-2xl font-medium',
    h5: 'text-xl font-medium',
    h6: 'text-lg font-medium',
    body: 'text-base',
    caption: 'text-sm',
    overline: 'text-xs uppercase tracking-wider',
  };
  
  const colorClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    muted: 'text-muted-foreground',
    accent: 'text-accent-foreground',
    destructive: 'text-destructive',
  };
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };
  
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };
  
  // Determine the element to render
  const elementMap = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body: 'p',
    caption: 'span',
    overline: 'span',
  };
  
  const Component = as || elementMap[variant] || 'p';
  
  return createElement(
    Component,
    {
      className: `${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]} ${weightClasses[weight]} ${className}`,
      ...props,
    },
    children
  );
};

export default Typography;