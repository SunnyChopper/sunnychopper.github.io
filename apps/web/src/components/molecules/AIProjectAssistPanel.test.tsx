import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AIProjectAssistPanel } from '@/components/molecules/AIProjectAssistPanel';
import type { Project, Task } from '@/types/growth-system';
import type { ProjectHealthOutput } from '@/types/llm';
import { llmService } from '@/services/llm.service';

vi.mock('@/lib/llm', () => ({
  llmConfig: {
    isConfigured: () => true,
  },
}));

vi.mock('@/services/llm.service', () => ({
  llmService: {
    analyzeProjectHealth: vi.fn(),
    generateProjectTasks: vi.fn(),
    identifyProjectRisks: vi.fn(),
  },
}));

const project: Project = {
  id: 'project-1',
  name: 'Course Project',
  description: null,
  area: 'Operations',
  subCategory: null,
  priority: 'P2',
  status: 'Active',
  impact: 5,
  startDate: '2026-05-01',
  targetEndDate: '2026-06-30',
  actualEndDate: null,
  notes: null,
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const linkedTask: Task = {
  id: 'task-1',
  title: 'Read Textbook and Complete Homework for Lesson 4',
  description: null,
  extendedDescription: null,
  area: 'Operations',
  subCategory: null,
  priority: 'P2',
  status: 'In Progress',
  size: 3,
  dueDate: '2026-06-30',
  scheduledDate: null,
  completedDate: null,
  notes: null,
  isRecurring: false,
  recurrenceRule: null,
  pointValue: 5,
  pointsAwarded: false,
  projectIds: ['project-1'],
  goalIds: [],
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const healthResult: ProjectHealthOutput = {
  overallHealth: 'good',
  healthScore: 82,
  healthFactors: [
    {
      factorName: 'Momentum & Activity',
      status: 'warning',
      description: 'No recent activity has been recorded for this project recently',
      impact: 'medium',
    },
    {
      factorName: 'Task Completion Rate',
      status: 'good',
      description: 'Most tasks are complete with a strong completion rate overall',
      impact: 'high',
    },
    {
      factorName: 'Timeline Risk',
      status: 'warning',
      description: 'One remaining task may delay completion if not started soon',
      impact: 'medium',
    },
    {
      factorName: 'Scope & Clarity',
      status: 'good',
      description: 'Tasks are well-defined with a clear sequential structure',
      impact: 'low',
    },
  ],
  positiveIndicators: ['Strong completion rate'],
  concerns: ['Final lesson not started'],
  priorityActions: [
    {
      text: "Begin 'Read Textbook and Complete Homework for Lesson 4' immediately",
      kind: 'createTask',
    },
    {
      text: 'Log activity updates regularly to keep the project record current',
      kind: 'logActivity',
    },
    {
      text: 'Set a personal deadline for completing Lesson 4 well before June 30',
      kind: 'createTask',
    },
  ],
  trajectory: 'stable',
};

describe('AIProjectAssistPanel health zero-tasks soft-fail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows soft-fail message and Generate first tasks without calling analyzeProjectHealth', async () => {
    const user = userEvent.setup();
    const onRequestGenerateTasks = vi.fn();

    render(
      <AIProjectAssistPanel
        mode="health"
        project={project}
        tasks={[]}
        onClose={vi.fn()}
        onRequestGenerateTasks={onRequestGenerateTasks}
      />
    );

    expect(screen.getByText(/Health analysis needs at least one linked task/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Analyze' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Generate first tasks' }));

    expect(onRequestGenerateTasks).toHaveBeenCalledTimes(1);
    expect(llmService.analyzeProjectHealth).not.toHaveBeenCalled();
  });

  it('shows Analyze idle CTA when project has linked tasks', () => {
    render(
      <AIProjectAssistPanel
        mode="health"
        project={project}
        tasks={[linkedTask]}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Generate first tasks' })).not.toBeInTheDocument();
  });
});

describe('AIProjectAssistPanel priority actions', () => {
  beforeEach(() => {
    vi.mocked(llmService.analyzeProjectHealth).mockResolvedValue({
      success: true,
      data: healthResult,
      error: null,
    });
  });

  it('renders Create task and Log activity buttons per action kind', async () => {
    const user = userEvent.setup();
    const onCreateTaskFromAction = vi.fn();
    const onLogActivityFromAction = vi.fn();

    render(
      <AIProjectAssistPanel
        mode="health"
        project={project}
        tasks={[linkedTask]}
        onClose={vi.fn()}
        onCreateTaskFromAction={onCreateTaskFromAction}
        onLogActivityFromAction={onLogActivityFromAction}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Analyze' }));

    expect(await screen.findByText(/Priority actions/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Create task' })).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Log activity' })).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Create task' })[0]);
    expect(onCreateTaskFromAction).toHaveBeenCalledWith(healthResult.priorityActions[0]);

    await user.click(screen.getByRole('button', { name: 'Log activity' }));
    expect(onLogActivityFromAction).toHaveBeenCalledWith(healthResult.priorityActions[1]);
  });
});

describe('AIProjectAssistPanel abandoned-risk banner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows abandoned-risk banner when health is critical and project is extreme overdue', async () => {
    const user = userEvent.setup();
    const extremeOverdueProject: Project = {
      ...project,
      targetEndDate: '2025-01-01',
    };
    const criticalHealth: ProjectHealthOutput = {
      ...healthResult,
      overallHealth: 'critical',
      healthScore: 35,
      trajectory: 'declining',
    };

    vi.mocked(llmService.analyzeProjectHealth).mockResolvedValue({
      success: true,
      data: criticalHealth,
      error: null,
    });

    render(
      <AIProjectAssistPanel
        mode="health"
        project={extremeOverdueProject}
        tasks={[linkedTask]}
        onClose={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Analyze' }));

    expect(await screen.findByText(/Stale \/ Abandoned risk/i)).toBeInTheDocument();
  });
});
