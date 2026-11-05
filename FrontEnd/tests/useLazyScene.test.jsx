import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import useLazyScene from '../src/hooks/useLazyScene';

function CounterScene() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Scene count {count}</button>;
}

function Parent({ tick }) {
  const scene = useLazyScene(() => Promise.resolve({ default: CounterScene }));
  return <section aria-label={`Render ${tick}`}>{scene}</section>;
}

describe('useLazyScene', () => {
  it('preserves loaded scene state when an inline loader is recreated', async () => {
    const { rerender } = render(<Parent tick={0} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Scene count 0' }));
    expect(screen.getByRole('button', { name: 'Scene count 1' })).toBeTruthy();
    await act(async () => rerender(<Parent tick={1} />));
    expect(await screen.findByRole('button', { name: 'Scene count 1' })).toBeTruthy();
  });

  it('does not call the loader again on an unrelated parent render', async () => {
    const loader = vi.fn(() => Promise.resolve({ default: CounterScene }));
    function StableParent({ label }) {
      const scene = useLazyScene(loader);
      return <section aria-label={label}>{scene}</section>;
    }
    const { rerender } = render(<StableParent label="First" />);
    await screen.findByRole('button', { name: 'Scene count 0' });
    await act(async () => rerender(<StableParent label="Second" />));
    expect(loader).toHaveBeenCalledTimes(1);
  });
});
