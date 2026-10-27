import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  afterEach(cleanup);

  it('is a plain button unless told otherwise', () => {
    render(<Button>Leave queue</Button>);

    expect(screen.getByRole('button', { name: 'Leave queue' }).getAttribute('type')).toBe('button');
  });

  it('can still submit a form', () => {
    render(<Button type="submit">Log in</Button>);

    expect(screen.getByRole('button', { name: 'Log in' }).getAttribute('type')).toBe('submit');
  });
});
