import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ToolApprovalCategoryAccordion } from '@/components/molecules/settings/ToolApprovalCategoryAccordion';
import type { AssistantToolRegistryEntry } from '@/types/api-contracts';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

const tools: AssistantToolRegistryEntry[] = [
  {
    name: 'create_goal',
    description: 'Create a goal',
    category: 'Goals',
    safeRead: false,
  },
  {
    name: 'delete_goal',
    description: 'Delete a goal',
    category: 'Goals',
    safeRead: false,
  },
];

describe('ToolApprovalCategoryAccordion', () => {
  it('marks closed panels inert so hidden checkboxes are not focusable', () => {
    render(
      <ToolApprovalCategoryAccordion
        category="Goals"
        tools={tools}
        approvedCount={0}
        isOpen={false}
        isToolChecked={() => false}
        onToggleCategory={() => {}}
        onToggleTool={() => {}}
      />
    );

    const panel = screen.getByTestId('tool-approval-panel-tool-approval-panel-goals');
    expect(panel).toHaveAttribute('inert');
    expect(panel).toHaveAttribute('aria-hidden', 'true');
    expect(panel).toHaveAttribute('data-panel-open', 'false');
  });

  it('removes inert when the panel is open', () => {
    render(
      <ToolApprovalCategoryAccordion
        category="Goals"
        tools={tools}
        approvedCount={1}
        isOpen
        isToolChecked={(name) => name === 'create_goal'}
        onToggleCategory={() => {}}
        onToggleTool={() => {}}
      />
    );

    const panel = screen.getByTestId('tool-approval-panel-tool-approval-panel-goals');
    expect(panel).not.toHaveAttribute('inert');
    expect(panel).toHaveAttribute('aria-hidden', 'false');
    expect(panel).toHaveAttribute('data-panel-open', 'true');
    expect(screen.getByRole('checkbox', { name: /create_goal/i })).toBeInTheDocument();
  });
});
