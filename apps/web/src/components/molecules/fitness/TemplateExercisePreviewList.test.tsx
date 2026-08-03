import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TemplateExercisePreviewList } from '@/components/molecules/fitness/TemplateExercisePreviewList';

describe('TemplateExercisePreviewList', () => {
  const nameById = { a: 'Bench press', b: 'Row', c: 'Curl' };

  it('shows empty copy when no exercises', () => {
    render(<TemplateExercisePreviewList exerciseIds={[]} nameById={nameById} onChange={vi.fn()} />);
    expect(screen.getByText('Add exercises to preview order.')).toBeInTheDocument();
  });

  it('renders ordered rows with names and Remove actions', () => {
    render(
      <TemplateExercisePreviewList
        exerciseIds={['a', 'b']}
        nameById={nameById}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('Bench press')).toBeInTheDocument();
    expect(screen.getByText('Row')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Reorder/ })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(2);
  });

  it('removes an exercise when Remove is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TemplateExercisePreviewList
        exerciseIds={['a', 'b', 'c']}
        nameById={nameById}
        onChange={onChange}
      />
    );
    await user.click(screen.getAllByRole('button', { name: 'Remove' })[1]!);
    expect(onChange).toHaveBeenCalledWith(['a', 'c']);
  });
});
