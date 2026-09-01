import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MentorInviteModal from './MentorInviteModal';

vi.mock('../../hooks/useSoul', () => ({
  useSoul: () => ({ soul: 'student', nebula: { from: '#22d3ee', to: '#3b82f6' } }),
}));
vi.mock('../haptics', () => ({
  Haptic: { light: vi.fn(), medium: vi.fn(), heavy: vi.fn() },
}));

const renderModal = (props = {}) =>
  render(
    <MemoryRouter>
      <MentorInviteModal
        invite={{ kind: 'top_swapper', metrics: { swaps: 14, avgRating: 4.7 } }}
        onDismiss={vi.fn()}
        onAccept={vi.fn()}
        {...props}
      />
    </MemoryRouter>
  );

describe('MentorInviteModal', () => {
  it('renders nothing when there is no invite', () => {
    const { container } = render(
      <MemoryRouter>
        <MentorInviteModal invite={null} />
      </MemoryRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the swap metrics in the intro step', () => {
    renderModal();
    expect(screen.getByText(/14 peer swaps in 90 days, 4\.7★ average/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tell me more/i })).toBeInTheDocument();
    expect(screen.getByText('Not now')).toBeInTheDocument();
  });

  it('collects the two questions and fires onAccept', () => {
    const onAccept = vi.fn();
    renderModal({ onAccept });

    fireEvent.click(screen.getByRole('button', { name: /tell me more/i }));
    const boxes = screen.getAllByRole('textbox');
    expect(boxes).toHaveLength(2);

    const submit = screen.getByRole('button', { name: /submit/i });
    expect(submit).toBeDisabled();

    fireEvent.change(boxes[0], { target: { value: 'I love teaching' } });
    fireEvent.change(boxes[1], { target: { value: 'Intro to guitar' } });
    expect(submit).not.toBeDisabled();
    fireEvent.click(submit);

    expect(onAccept).toHaveBeenCalledWith({ q1: 'I love teaching', q2: 'Intro to guitar' });
    expect(screen.getByText(/Sent\./i)).toBeInTheDocument();
  });

  it('fires onDismiss on "Not now"', () => {
    const onDismiss = vi.fn();
    renderModal({ onDismiss });
    fireEvent.click(screen.getByText('Not now'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
