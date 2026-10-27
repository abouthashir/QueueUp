import type { ComponentPropsWithoutRef } from 'react';
import { Link, type LinkProps } from 'react-router';
import styles from './Button.module.css';

// primary: ink on paper · outline: quiet on paper · light / glass: on dark sections · signal: "Call next".
type Variant = 'primary' | 'outline' | 'ghost' | 'light' | 'glass' | 'signal';
type Size = 'md' | 'lg';

interface Look {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

function classes({ variant = 'primary', size = 'md', block = false }: Look, extra?: string) {
  return [styles.button, styles[variant], styles[size], block && styles.block, extra].filter(Boolean).join(' ');
}

type ButtonProps = Look & ComponentPropsWithoutRef<'button'>;

export function Button({ variant, size, block, className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={classes({ variant, size, block }, className)} {...rest} />;
}

type ButtonLinkProps = Look & LinkProps;

export function ButtonLink({ variant, size, block, className, ...rest }: ButtonLinkProps) {
  return <Link className={classes({ variant, size, block }, className)} {...rest} />;
}

type ButtonAnchorProps = Look & ComponentPropsWithoutRef<'a'>;

export function ButtonAnchor({ variant, size, block, className, ...rest }: ButtonAnchorProps) {
  return <a className={classes({ variant, size, block }, className)} {...rest} />;
}
