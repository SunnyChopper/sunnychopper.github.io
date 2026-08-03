import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ScaleSelector } from './ScaleSelector';

function dispatchPointerDown(element: Element, clientX: number) {
  const event = createEvent.pointerDown(element, { pointerId: 1 });
  Object.defineProperty(event, 'clientX', { value: clientX });
  fireEvent(element, event);
}

describe('ScaleSelector', () => {
  it('renders a slider with committed value and primary thumb styling', () => {
    render(
      <ScaleSelector
        min={1}
        max={10}
        value={4}
        onChange={vi.fn()}
        aria-label="Sleep quality from 1 to 10"
      />
    );

    const slider = screen.getByRole('slider', { name: 'Sleep quality from 1 to 10' });
    expect(slider).toHaveAttribute('aria-valuemin', '1');
    expect(slider).toHaveAttribute('aria-valuemax', '10');
    expect(slider).toHaveAttribute('aria-valuenow', '4');
    expect(slider).toHaveAttribute('aria-valuetext', '4');

    const thumb = screen.getByTestId('scale-selector-thumb');
    expect(thumb.className).toContain('bg-primary');
    expect(thumb.className).toContain('scale-110');
  });

  it('shows unset aria-valuetext when value is null', () => {
    render(
      <ScaleSelector
        min={1}
        max={10}
        value={null}
        onChange={vi.fn()}
        aria-label="Energy from 1 to 10"
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '1');
    expect(slider).toHaveAttribute('aria-valuetext', 'unset');

    const thumb = screen.getByTestId('scale-selector-thumb');
    expect(thumb.className).not.toContain('bg-primary');
  });

  it('commits onChange and onSelectFeedback on track click', () => {
    const onChange = vi.fn();
    const onSelectFeedback = vi.fn();

    render(
      <ScaleSelector
        min={1}
        max={5}
        value={null}
        onChange={onChange}
        onSelectFeedback={onSelectFeedback}
        aria-label="Energy from 1 to 5"
      />
    );

    const slider = screen.getByRole('slider');
    const rect = {
      left: 0,
      width: 100,
      top: 0,
      height: 20,
      right: 100,
      bottom: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
    vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);

    dispatchPointerDown(slider, 50);

    expect(onChange).toHaveBeenCalledWith(3);
    expect(onSelectFeedback).toHaveBeenCalledWith(3);
  });

  it('commits immediately on arrow keys', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ScaleSelector
        min={1}
        max={5}
        value={2}
        onChange={onChange}
        aria-label="Soreness from 1 to 5"
      />
    );

    const slider = screen.getByRole('slider');
    slider.focus();

    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(3);

    onChange.mockClear();
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenCalledWith(1);

    onChange.mockClear();
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenCalledWith(1);

    onChange.mockClear();
    await user.keyboard('{End}');
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('blocks interaction when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ScaleSelector
        min={1}
        max={5}
        value={null}
        onChange={onChange}
        aria-label="Disabled scale"
        disabled
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('tabindex', '-1');

    dispatchPointerDown(slider, 50);
    expect(onChange).not.toHaveBeenCalled();

    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows floating label on focus with numeric value', async () => {
    const user = userEvent.setup();

    render(
      <ScaleSelector
        min={1}
        max={10}
        value={7}
        onChange={vi.fn()}
        aria-label="Stress from 1 to 10"
      />
    );

    const slider = screen.getByRole('slider');
    await user.tab();
    expect(slider).toHaveFocus();

    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('shows floating label on hover', async () => {
    const user = userEvent.setup();

    render(
      <ScaleSelector
        min={1}
        max={10}
        value={5}
        onChange={vi.fn()}
        aria-label="Stress from 1 to 10"
      />
    );

    const slider = screen.getByRole('slider');
    await user.hover(slider);

    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
