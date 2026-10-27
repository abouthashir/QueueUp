import type { ComponentPropsWithoutRef } from 'react';
import styles from './TextField.module.css';

type SelectFieldProps = ComponentPropsWithoutRef<'select'> & {
  id: string;
  label: string;
  options: readonly string[];
};

// A drop-down that looks exactly like TextField, so it shares TextField's styles.
export default function SelectField({ id, label, options, className, ...rest }: SelectFieldProps) {
  return (
    <div className={`${styles.field} ${className ?? ''}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <select id={id} className={styles.input} {...rest}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
