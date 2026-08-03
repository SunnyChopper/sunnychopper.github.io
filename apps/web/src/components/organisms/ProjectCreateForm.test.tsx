import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectCreateForm } from '@/components/organisms/ProjectCreateForm';
import { toLocalDateKey } from '@/utils/date-formatters';

describe('ProjectCreateForm', () => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    onSubmit.mockReset();
    onCancel.mockReset();
  });

  function renderForm() {
    return render(<ProjectCreateForm onSubmit={onSubmit} onCancel={onCancel} isLoading={false} />);
  }

  it('defaults impact to Medium (3 stars) with helper text', () => {
    renderForm();

    expect(screen.getByText('Medium Impact')).toBeInTheDocument();
    expect(screen.getByText('Impact is relative to your current active P1s.')).toBeInTheDocument();

    const starThree = screen.getByRole('radio', { name: /Impact score 3: Medium Impact/ });
    expect(starThree).toHaveAttribute('aria-checked', 'true');
  });

  it('keeps Start Date empty until the operator types a project name', async () => {
    const user = userEvent.setup();
    renderForm();

    const startDateInput = screen.getByLabelText('Start Date') as HTMLInputElement;
    expect(startDateInput.value).toBe('');

    await user.type(screen.getByLabelText(/Project name/i), 'New initiative');

    expect(startDateInput.value).toBe(toLocalDateKey(new Date()));
  });

  it('does not clear Start Date when the project name is cleared', async () => {
    const user = userEvent.setup();
    renderForm();

    const nameInput = screen.getByLabelText(/Project name/i);
    const startDateInput = screen.getByLabelText('Start Date') as HTMLInputElement;

    await user.type(nameInput, 'Temporary');
    const filledDate = startDateInput.value;
    expect(filledDate).toBe(toLocalDateKey(new Date()));

    await user.clear(nameInput);

    expect(startDateInput.value).toBe(filledDate);
  });

  it('allows clearing Start Date manually after auto-fill', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Project name/i), 'Named project');
    const startDateInput = screen.getByLabelText('Start Date') as HTMLInputElement;
    expect(startDateInput.value).not.toBe('');

    await user.clear(startDateInput);

    expect(startDateInput.value).toBe('');
  });

  it('does not submit when project name is empty (native required)', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Create Project' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
