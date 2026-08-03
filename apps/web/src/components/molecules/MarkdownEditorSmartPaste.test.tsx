import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarkdownEditor from './MarkdownEditor';

function renderEditor(initial = '') {
  let value = initial;
  const onChange = vi.fn((next: string) => {
    value = next;
  });
  const view = render(<MarkdownEditor value={value} onChange={onChange} />);
  const rerenderWithValue = () => {
    view.rerender(<MarkdownEditor value={value} onChange={onChange} />);
  };
  return { onChange, rerenderWithValue, getValue: () => value };
}

async function flushAnimationFrames() {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function pasteIntoEditor(text: string) {
  const textarea = screen.getByRole('textbox');
  await userEvent.click(textarea);
  Object.defineProperty(textarea, 'selectionStart', {
    configurable: true,
    value: 0,
    writable: true,
  });
  Object.defineProperty(textarea, 'selectionEnd', {
    configurable: true,
    value: 0,
    writable: true,
  });
  fireEvent.paste(textarea, {
    clipboardData: {
      getData: (type: string) => (type === 'text/plain' ? text : ''),
      types: ['text/plain'],
    },
  });
  Object.defineProperty(textarea, 'value', {
    configurable: true,
    value: text,
    writable: true,
  });
  Object.defineProperty(textarea, 'selectionEnd', {
    configurable: true,
    value: text.length,
    writable: true,
  });
  fireEvent.input(textarea, { target: { value: text } });
  await flushAnimationFrames();
}

describe('MarkdownEditor smart paste', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1100);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows Format as list chip for multi-line paste', async () => {
    renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Edit Mode' }));
    await pasteIntoEditor('apple\nbanana\ncherry');

    await waitFor(() => {
      expect(screen.getByTestId('smart-paste-chip')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Format as list' })).toBeInTheDocument();
    });
  });

  it('shows Format as table chip for tab-separated paste', async () => {
    renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Edit Mode' }));
    await pasteIntoEditor('Name\tAge\nAlice\t30');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Format as table' })).toBeInTheDocument();
    });
  });

  it('does not show chip for single-line paste without tabs', async () => {
    renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Edit Mode' }));
    await pasteIntoEditor('just one line');

    await waitFor(() => {
      expect(screen.queryByTestId('smart-paste-chip')).toBeNull();
    });
  });

  it('replaces pasted span when accepting list format', async () => {
    const { onChange, rerenderWithValue } = renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Edit Mode' }));
    await pasteIntoEditor('apple\nbanana\ncherry');
    rerenderWithValue();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Format as list' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Format as list' }));

    expect(onChange).toHaveBeenCalledWith('- apple\n- banana\n- cherry');
    expect(screen.queryByTestId('smart-paste-chip')).toBeNull();
  });

  it('leaves raw paste when dismiss is clicked', async () => {
    const { onChange, rerenderWithValue } = renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Edit Mode' }));
    await pasteIntoEditor('apple\nbanana\ncherry');
    rerenderWithValue();

    await waitFor(() => {
      expect(screen.getByTestId('smart-paste-chip')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onChange).not.toHaveBeenCalledWith(expect.stringContaining('- apple'));
    expect(screen.queryByTestId('smart-paste-chip')).toBeNull();
  });

  it('hides chip after 5 seconds without changing content', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { onChange, rerenderWithValue } = renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Edit Mode' }));
    await pasteIntoEditor('apple\nbanana\ncherry');
    rerenderWithValue();

    await waitFor(() => {
      expect(screen.getByTestId('smart-paste-chip')).toBeInTheDocument();
    });

    const callsBefore = onChange.mock.calls.length;
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByTestId('smart-paste-chip')).toBeNull();
    });
    expect(onChange.mock.calls.length).toBe(callsBefore);
  });
});
