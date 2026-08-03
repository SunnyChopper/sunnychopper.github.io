import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Dialog from '@/components/molecules/Dialog';
import { overlayBackdropClassName } from '@/lib/overlay-layer';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

describe('Dialog', () => {
  it('portals open dialog to document.body with overlay backdrop z-index', () => {
    render(
      <Dialog isOpen onClose={vi.fn()} title="Test dialog">
        Dialog content
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(document.body.contains(dialog)).toBe(true);
    expect(screen.getByText('Dialog content')).toBeInTheDocument();

    const backdrop = Array.from(document.body.querySelectorAll('div')).find((el) =>
      el.className.includes(overlayBackdropClassName)
    );
    expect(backdrop).toBeDefined();
    expect(backdrop?.className).toContain('fixed inset-0');
  });

  it('does not render when closed', () => {
    render(
      <Dialog isOpen={false} onClose={vi.fn()} title="Test dialog">
        Dialog content
      </Dialog>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders footer outside scroll body', () => {
    render(
      <Dialog
        isOpen
        onClose={vi.fn()}
        title="Test dialog"
        footer={<div data-testid="dialog-footer-actions">Footer</div>}
      >
        Dialog content
      </Dialog>
    );

    expect(screen.getByTestId('dialog-footer')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-footer-actions')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('renders sticky subheader outside scroll body', () => {
    render(
      <Dialog
        isOpen
        onClose={vi.fn()}
        title="Test dialog"
        stickySubheader={<div data-testid="sticky-chrome">Sticky facts</div>}
      >
        Body content
      </Dialog>
    );

    expect(screen.getByTestId('sticky-chrome')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('traps focus within dialog when trapFocus is enabled', async () => {
    const user = userEvent.setup();
    const trigger = document.createElement('button');
    trigger.textContent = 'Open';
    document.body.appendChild(trigger);
    trigger.focus();

    render(
      <Dialog isOpen onClose={vi.fn()} title="Trap test" trapFocus>
        <button type="button">Inside action</button>
      </Dialog>
    );

    const closeButton = screen.getByRole('button', { name: /close dialog/i });
    const insideButton = screen.getByRole('button', { name: 'Inside action' });

    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });

    await user.tab();
    expect(insideButton).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();
    expect(trigger).not.toHaveFocus();

    trigger.remove();
  });

  it('restores focus to opener when trapFocus dialog closes', async () => {
    const user = userEvent.setup();
    const trigger = document.createElement('button');
    trigger.textContent = 'Open';
    document.body.appendChild(trigger);
    trigger.focus();

    const onClose = vi.fn();
    const { rerender } = render(
      <Dialog isOpen onClose={onClose} title="Trap test" trapFocus>
        <button type="button">Inside action</button>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: /close dialog/i }));
    expect(onClose).toHaveBeenCalled();

    rerender(
      <Dialog isOpen={false} onClose={onClose} title="Trap test" trapFocus>
        <button type="button">Inside action</button>
      </Dialog>
    );

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
    trigger.remove();
  });
});
