import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { ToastContainer, ToastItem } from './Toast';

describe('ToastItem', () => {
  it('renders optional action and invokes onClick after dismiss', () => {
    const onDismiss = vi.fn();
    const onRetry = vi.fn();

    render(
      <ToastItem
        toast={{
          id: 'toast-1',
          type: 'error',
          title: 'Could not save recovery',
          message: 'Network error',
          action: { label: 'Retry', onClick: onRetry },
        }}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('exposes a polite live region on ToastContainer', () => {
    render(<ToastContainer toasts={[]} onDismiss={() => {}} />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-relevant', 'additions');
  });
});
