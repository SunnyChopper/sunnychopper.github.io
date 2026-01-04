export interface ResponsePattern {
  keywords: string[];
  response: string;
}

export const chatbotResponses: ResponsePattern[] = [
  {
    keywords: ['task', 'create', 'add', 'new task'],
    response: `I can help you create a task! Based on your message, I'll add this to your task list. Tasks in Personal OS connect to your projects and goals, helping you break down strategic objectives into actionable steps.

Would you like me to:
1. Create this as a high-priority task
2. Link it to an existing project
3. Set a specific deadline`,
  },
  {
    keywords: ['goal', 'progress', 'how'],
    response: `Let me check your goals progress. In Personal OS, goals are part of the Strategic Layer, driving your projects and daily actions.

Your active goals show:
- Goal completion tracking
- Linked projects and their status
- Key metrics aligned with each goal

Would you like me to show detailed progress on a specific goal?`,
  },
  {
    keywords: ['metric', 'progress', 'performance', 'analytics'],
    response: `Your metrics dashboard provides data-driven insights. The Measurement Layer tracks KPIs tied to your goals and projects.

I can help you:
- View current metric values
- Analyze trends over time
- Identify what's working well
- Suggest areas for improvement

Which metrics would you like to review?`,
  },
  {
    keywords: ['habit', 'routine', 'daily'],
    response: `Habits are part of the Tactical Layer, turning your strategy into consistent daily action. I can help you:

- Review your current habits and streaks
- Create new habits aligned with your goals
- Analyze habit completion patterns
- Suggest optimal times for habits

What habit would you like to work on?`,
  },
  {
    keywords: ['project', 'status', 'milestone'],
    response: `Let me pull up your project statuses. Projects bridge strategy and execution, breaking down goals into manageable milestones.

I can show you:
- Active project progress percentages
- Upcoming milestones
- Tasks per project
- Blocked items needing attention

Which project would you like details on?`,
  },
  {
    keywords: ['logbook', 'journal', 'reflection', 'entry'],
    response: `The Logbook is your Reflection Layer, capturing daily insights and learning. It helps you:

- Connect activities to outcomes
- Track what's working and what isn't
- Identify patterns in your growth
- Document key learnings

Would you like to:
1. Create a new journal entry
2. Review recent reflections
3. Analyze patterns in your entries`,
  },
  {
    keywords: ['help', 'what can you do', 'capabilities'],
    response: `I'm your Personal OS Assistant! I have access to all your Growth System data and can help you:

📋 **Tasks**: Create, update, or review your tasks
🎯 **Goals**: Track progress and align actions
📊 **Metrics**: Analyze performance data
📅 **Habits**: Build consistent routines
📁 **Projects**: Manage complex initiatives
📖 **Logbook**: Reflect on your journey

I can create items, provide insights, and help you understand how everything connects. What would you like to work on?`,
  },
  {
    keywords: ['integration', 'layers', 'how it works', 'connect'],
    response: `The Growth System uses a four-layer architecture where everything connects:

**Strategic Layer** (Goals & Projects) → defines what you want to achieve
↓
**Tactical Layer** (Tasks & Habits) → drives daily execution
↓
**Measurement Layer** (Metrics) → tracks progress with data
↓
**Reflection Layer** (Logbook) → captures insights that inform strategy

This creates a continuous improvement cycle where each layer reinforces the others. Would you like to explore how to leverage these connections?`,
  },
  {
    keywords: ['prioritize', 'what should i do', 'next', 'focus'],
    response: `Let me help you prioritize! Based on your Growth System data, I can suggest:

1. **Urgent Tasks** with approaching deadlines
2. **High-Impact Activities** aligned with your top goals
3. **Habit Streaks** that need attention today
4. **Project Milestones** coming up soon

I can also help you understand which activities will have the biggest impact on your goals. What area would you like to focus on?`,
  },
  {
    keywords: ['report', 'summary', 'overview', 'status'],
    response: `Here's a comprehensive overview of your Personal OS:

**Strategic Health**: Your goals and projects status
**Tactical Momentum**: Task completion and habit consistency
**Performance Insights**: Key metrics and trends
**Growth Patterns**: Recent logbook insights

I can dive deeper into any of these areas. Which would you like to explore first?`,
  },
];

export const defaultResponse = `I'm your Personal OS Assistant! I have access to all your Growth System data and can help you:

📋 **Tasks**: Create, update, or review your tasks
🎯 **Goals**: Track progress and align actions
📊 **Metrics**: Analyze performance data
📅 **Habits**: Build consistent routines
📁 **Projects**: Manage complex initiatives
📖 **Logbook**: Reflect on your journey

I can create items, provide insights, and help you understand how everything connects. What would you like to work on?`;

export function findBestResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  for (const pattern of chatbotResponses) {
    if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return pattern.response;
    }
  }

  return defaultResponse;
}
