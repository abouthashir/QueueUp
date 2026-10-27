import type { ComponentPropsWithoutRef } from 'react';
import styles from './TextField.module.css';

type TextFieldProps = ComponentPropsWithoutRef<'input'> & {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
};

export default function TextField({ id, label, hint, optional = false, className, ...rest }: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={`${styles.field} ${className ?? ''}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional && <span className={styles.optional}> (optional)</span>}
      </label>
      <input id={id} className={styles.input} aria-describedby={hintId} {...rest} />
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
