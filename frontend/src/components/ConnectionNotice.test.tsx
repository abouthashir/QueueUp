import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ConnectionNotice from './ConnectionNotice';

describe('ConnectionNotice', () => {
  afterEach(cleanup);

  it('says nothing while live', () => {
    render(<ConnectionNotice liveStatus="live" />);

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('tells people when it is reconnecting', () => {
    render(<ConnectionNotice liveStatus="reconnecting" />);

    expect(screen.getByRole('status').textContent).toBe('Reconnecting…');
  });
});
