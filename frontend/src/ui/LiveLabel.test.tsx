import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import LiveLabel from './LiveLabel';

describe('LiveLabel', () => {
  afterEach(cleanup);

  it('says Live while updates arrive', () => {
    render(<LiveLabel status="live" />);

    expect(screen.getByRole('status').textContent).toBe('Live');
  });

  it('explains the fallback while offline', () => {
    render(<LiveLabel status="offline" />);

    expect(screen.getByRole('status').textContent).toBe('Checking every few seconds');
  });
});
