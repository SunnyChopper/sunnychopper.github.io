# Growth System - Implementation Plan

## 🎯 Instructions for LLM Agents

**CRITICAL: READ THIS ENTIRE DOCUMENT BEFORE STARTING ANY WORK**

### How to Use This Plan

1. **First, read this entire plan** from top to bottom to understand the full scope
2. **Check the Strafing Run Status** section to see what has been completed
3. **Find your assigned strafing run** and read its objectives and deliverables
4. **Review dependencies** - ensure all prerequisite runs are marked as COMPLETED
5. **Execute the work** for your strafing run
6. **Update this document** when done:
   - Change status from `🔲 NOT STARTED` to `✅ COMPLETED`
   - Add completion date
   - Add brief notes about what was implemented
   - Update any relevant context for future runs
7. **Run the build** to ensure nothing is broken: `npm run build`

### Key Technical Decisions

- **NO DATABASE**: Use mocked API requests with localStorage persistence
- **TypeScript Contracts**: Maintain strong typing for all API interactions
- **LLM-Enhanced**: AI features are core to the experience, not afterthoughts
- **Text-Focused MVP**: No images, media, or complex visualizations in logbook entries
- **Component Architecture**: Follow Atomic Design (atoms/molecules/organisms/templates)

---

## 📊 Strafing Run Status

| Run | Name | Status | Completed | Notes |
|-----|------|--------|-----------|-------|
| 1 | Foundation & Types | ✅ COMPLETED | 2026-01-04 | Complete TypeScript types, API contracts, mock storage infrastructure, and sample data seeded |
| 2 | Shared UI Components | ✅ COMPLETED | 2026-01-04 | All entity display, interactive, and LLM components created with demo page at /admin/components-demo. Components reorganized into proper atomic design hierarchy (Dialog, AIAssistPanel, RelationshipPicker moved to organisms; AISuggestionCard, AIInsightBanner moved to molecules) |
| 3 | Tasks Page - Basic CRUD | ✅ COMPLETED | 2026-01-04 | Full Tasks page implemented with list view, create/edit/delete operations, filtering by area/status/priority, search functionality, and responsive UI. Components: TaskListItem, TaskFilters, TaskCreateForm, TaskEditPanel, TasksPage. Route added to /admin/tasks |
| 4 | Tasks Page - Advanced Features | ✅ COMPLETED | 2026-01-04 | Kanban board with drag-and-drop, calendar view, dependency management, relationship linking to Projects and Goals, view toggles (List/Kanban/Calendar), enhanced TaskEditPanel with dependencies and relationships sections. Components: TaskKanbanBoard, TaskCalendarView, TaskEditPanelAdvanced, TasksPageAdvanced. All three views working with persistence |
| 5 | Projects Page | ✅ COMPLETED | 2026-01-04 | Full Projects page with card grid, detail view, filters, create/edit/delete operations. Components: ProjectCard, ProjectCreateForm, ProjectEditForm, ProjectsPage. Displays linked tasks and goals, progress calculation, timeline visualization. Route added to /admin/projects |
| 6 | Goals Page | ✅ COMPLETED | 2026-01-04 | Full Goals page with vision board layout, grouped by Time Horizon and Area views. Components: GoalCard, GoalCreateForm, GoalEditForm, GoalsPage. Success criteria management, progress tracking from completed criteria, linked projects display. 10 diverse seed goals added covering all time horizons and statuses. Route added to /admin/goals |
| 7 | Metrics Page | ✅ COMPLETED | 2026-01-04 | Full Metrics dashboard with card grid, detail view, filters, quick logging. Components: MetricCard with trend indicators, MetricLogForm, MetricCreateForm, MetricEditForm, MetricsPage. Log history display, on-track status indicators, target tracking. 8 diverse seed metrics added covering multiple areas and units with log history. Route added to /admin/metrics |
| 8 | Habits Page | ✅ COMPLETED | 2026-01-04 | Full Habits page with today-focused tracker, habit loop visualization, streak tracking, and quick logging. Components: HabitCard with streak counter, HabitLogWidget for completion tracking, HabitCreateForm, HabitEditForm, HabitsPage with type grouping. 5 diverse seed habits added (Build/Maintain/Reduce/Quit types). Route added to /admin/habits |
| 9 | Logbook Page | ✅ COMPLETED | 2026-01-04 | Full Logbook page with list view, mood tracking (High/Steady/Low), energy slider (1-10), and rich editor. Components: LogbookEntryCard with mood-based coloring, LogbookEditor with mood picker and energy slider, LogbookPage with list view. 5 seed entries added with different moods and energy levels. Route added to /admin/logbook |
| 10 | Dependency Graph | 🔲 NOT STARTED | - | - |
| 11 | LLM - Tasks & Projects | 🔲 NOT STARTED | - | - |
| 12 | LLM - Goals & Metrics | 🔲 NOT STARTED | - | - |
| 13 | LLM - Habits & Logbook | 🔲 NOT STARTED | - | - |
| 14 | AI Intelligence Hub | 🔲 NOT STARTED | - | - |
| 15 | Polish & Integration | 🔲 NOT STARTED | - | - |

---

## 🌟 Vision & Goals

### The Four-Layer Integration Model

1. **Strategic Layer** (Goals) - Long-term vision and objectives
2. **Tactical Layer** (Projects, Tasks) - Execution and doing
3. **Measurement Layer** (Metrics, Habits) - Tracking and accountability
4. **Reflection Layer** (Logbook) - Learning and adjustment

### LLM Intelligence Philosophy

AI is not a chatbot on the side—it's woven into every interaction:
- **Proactive**: Suggests before you ask
- **Contextual**: Based on your actual data and patterns
- **Actionable**: Every insight has a clear next step
- **Transparent**: Shows reasoning and confidence

---

## 📋 Detailed Strafing Runs

### Strafing Run 1: Foundation & Types
**Status:** ✅ COMPLETED
**Dependencies:** None
**Estimated Effort:** 2-3 hours

#### Objectives
Set up the complete type system and mock data infrastructure that all other runs will depend on.

#### Deliverables

1. **Update TypeScript Types** (`src/types/growth-system.ts`)
   - All entity types: Task, Project, Goal, Metric, MetricLog, Habit, HabitLog, Logbook
   - All enums: Area, SubCategory, Priority, TaskStatus, ProjectStatus, GoalStatus, etc.
   - Relationship types: TaskProject, TaskGoal, ProjectGoal, etc.
   - LLM interaction types: AISuggestion, AIInsight, AIAnalysis

2. **Update API Contracts** (`src/types/api-contracts.ts`)
   - Request/Response types for all CRUD operations
   - Filter, sort, pagination types
   - Relationship management types

3. **Create Mock Data Infrastructure**
   - `src/mocks/storage.ts` - localStorage wrapper with TypeScript safety
   - `src/mocks/data-generator.ts` - Realistic sample data generation
   - `src/mocks/seed-data.ts` - Pre-seeded data with relationships

4. **Update Mock Services**
   - Update all services in `src/services/growth-system/` to use mock storage
   - Add artificial delays (100-500ms) to simulate network
   - Implement full CRUD with relationship management
   - Add filter/sort/pagination logic

#### Success Criteria
- All types compile without errors
- Mock services can create, read, update, delete all entities
- Sample data demonstrates all relationship types
- `npm run build` succeeds

---

### Strafing Run 2: Shared UI Components
**Status:** ✅ COMPLETED
**Dependencies:** Run 1
**Estimated Effort:** 3-4 hours

#### Objectives
Build the comprehensive component library that all pages will use.

#### Deliverables

1. **Entity Display Components** (`src/components/atoms/`)
   - `AreaBadge.tsx` - Color-coded area pills
   - `PriorityIndicator.tsx` - P1-P4 visual indicators
   - `StatusBadge.tsx` - Contextual status displays
   - `EntityLinkChip.tsx` - Clickable navigation chips
   - `DateDisplay.tsx` - Smart date formatting with warnings
   - `ProgressRing.tsx` - Animated circular progress
   - `DependencyBadge.tsx` - Blocked/blocking indicators

2. **Interactive Components** (`src/components/molecules/`)
   - `FilterPanel.tsx` - Collapsible filter sidebar
   - `RelationshipPicker.tsx` - Multi-select modal for linking entities
   - `QuickActionBar.tsx` - Floating bulk action bar
   - `EmptyState.tsx` - Contextual empty states
   - `CommandPalette.tsx` - Global Cmd+K interface

3. **LLM Components** (`src/components/atoms/`)
   - `AISuggestionCard.tsx` - Dismissible suggestion cards
   - `AIThinkingIndicator.tsx` - Animated thinking state
   - `AIInsightBanner.tsx` - Prominent insight banner
   - `AIAssistPanel.tsx` - Slide-over assistant panel
   - `AIConfidenceIndicator.tsx` - Confidence level display

4. **Storybook/Demo Page**
   - Create a `/components-demo` route showing all components
   - Demonstrates all variants and states

#### Success Criteria
- All components render correctly
- Props are fully typed
- Components are reusable and composable
- Demo page shows all variants
- `npm run build` succeeds

---

### Strafing Run 3: Tasks Page - Basic CRUD
**Status:** 🔲 NOT STARTED
**Dependencies:** Run 1, Run 2
**Estimated Effort:** 3-4 hours

#### Objectives
Create the core Tasks page with list view and basic operations.

#### Deliverables

1. **Tasks Page Route** (`src/pages/admin/TasksPage.tsx`)
   - List view with filter panel
   - Create task form (modal or slide-over)
   - Edit task slide-over
   - Delete confirmation

2. **Task List Components**
   - `TaskListItem.tsx` - Individual task row/card
   - `TaskFilters.tsx` - Area, Status, Priority filters
   - `TaskCreateForm.tsx` - New task form
   - `TaskEditPanel.tsx` - Full edit slide-over

3. **Basic Task Fields**
   - Title, Description, ExtendedDescription
   - Area, SubCategory, Priority
   - Status, Size
   - DueDate, ScheduledDate
   - Notes

4. **Task Service Integration**
   - Connect to mock task service
   - Implement CRUD operations
   - Show loading states
   - Handle errors gracefully

#### Success Criteria
- Can create, read, update, delete tasks
- Filters work correctly
- All task fields can be edited
- Data persists in localStorage
- `npm run build` succeeds

---

### Strafing Run 4: Tasks Page - Advanced Features
**Status:** 🔲 NOT STARTED
**Dependencies:** Run 3
**Estimated Effort:** 4-5 hours

#### Objectives
Add Kanban board, dependency management, and relationship linking.

#### Deliverables

1. **Kanban Board View**
   - `TaskKanbanBoard.tsx` - Board with status columns
   - Drag-and-drop to change status
   - Column summaries (count, effort)

2. **Dependency Management**
   - Dependency picker UI
   - Blocked/blocking status indicators
   - Dependency badge with count
   - Mini dependency graph in task detail

3. **Relationship Linking**
   - Link tasks to Projects
   - Link tasks to Goals
   - Link tasks to Logbook entries
   - Display linked entities with chips
   - Navigate to linked entities

4. **View Toggles**
   - Switch between List, Kanban, Calendar views
   - Calendar view showing tasks by due date
   - Save view preference

#### Success Criteria
- Kanban board works with drag-and-drop
- Dependencies can be added/removed
- Tasks can be linked to Projects and Goals
- All views display correctly
- `npm run build` succeeds

---

### Strafing Run 5: Projects Page
**Status:** 🔲 NOT STARTED
**Dependencies:** Run 4
**Estimated Effort:** 3-4 hours

#### Objectives
Build the Projects page with card grid and detail views.

#### Deliverables

1. **Projects Page Route** (`src/pages/admin/ProjectsPage.tsx`)
   - Card grid layout
   - Filter by Area, Status, Priority
   - Create project modal
   - Project detail page

2. **Project Components**
   - `ProjectCard.tsx` - Grid card with progress
   - `ProjectDetail.tsx` - Full detail page
   - `ProjectCreateForm.tsx` - New project form
   - `ProjectEditForm.tsx` - Edit form

3. **Project Features**
   - All project fields editable
   - Link projects to Goals
   - Show linked Tasks
   - Progress calculation from tasks
   - Timeline visualization

4. **Project-Task Integration**
   - Add tasks to project from detail page
   - Task completion affects project progress
   - Filter tasks by project

#### Success Criteria
- Can create, read, update, delete projects
- Projects display linked tasks and goals
- Progress calculates correctly
- Timeline shows project duration
- `npm run build` succeeds

---

### Strafing Run 6: Goals Page
**Status:** ✅ COMPLETED (2026-01-04)
**Dependencies:** Run 5
**Estimated Effort:** 3-4 hours

#### Objectives
Create the Goals page with vision board layout and cascade visualization.

#### Deliverables

1. **Goals Page Route** (`src/pages/admin/GoalsPage.tsx`)
   - Vision board grouped by TimeHorizon
   - Alternative view: grouped by Area
   - Create goal modal
   - Goal detail page

2. **Goal Components**
   - `GoalCard.tsx` - Card with progress ring
   - `GoalDetail.tsx` - Full detail page
   - `GoalCascadeView.tsx` - Hierarchical view of related goals
   - `GoalCreateForm.tsx` - New goal form

3. **Goal Features**
   - All goal fields editable
   - Success criteria management
   - Link to Metrics
   - Show linked Projects and derived Tasks
   - Progress from linked metrics

4. **Goal Hierarchy**
   - Visualize goal cascade (Yearly → Quarterly → Monthly → Weekly → Daily)
   - Show parent/child relationships
   - Navigate hierarchy easily

#### Success Criteria
- Can create, read, update, delete goals
- TimeHorizon grouping works correctly
- Cascade visualization shows relationships
- Linked metrics and projects display
- `npm run build` succeeds

---

### Strafing Run 7: Metrics Page
**Status:** ✅ COMPLETED (2026-01-04)
**Dependencies:** Run 6
**Estimated Effort:** 3-4 hours

#### Objectives
Build the Metrics page with dashboard and logging interface.

#### Deliverables

1. **Metrics Page Route** (`src/pages/admin/MetricsPage.tsx`)
   - Dashboard grid of metric cards
   - Create metric modal
   - Metric detail page with chart

2. **Metric Components**
   - `MetricCard.tsx` - Dashboard card with sparkline
   - `MetricDetail.tsx` - Full detail with chart
   - `MetricLogForm.tsx` - Quick logging interface
   - `MetricChart.tsx` - Time series visualization

3. **Metric Features**
   - All metric fields editable
   - Link metrics to Goals
   - Log values with timestamps
   - Trend visualization
   - Target tracking

4. **Metric Logging**
   - Quick log from dashboard card
   - Bulk import logs
   - Edit/delete logs
   - Show recent logs in detail view

#### Success Criteria
- Can create, read, update, delete metrics
- Can log values with proper units
- Charts display trends correctly
- Targets and thresholds work
- `npm run build` succeeds

---

### Strafing Run 8: Habits Page
**Status:** ✅ COMPLETED (2026-01-04)
**Dependencies:** Run 7
**Estimated Effort:** 3-4 hours

#### Objectives
Create the Habits page with daily tracker and habit design interface.

#### Deliverables

1. **Habits Page Route** (`src/pages/admin/HabitsPage.tsx`)
   - Today-focused checklist view
   - Group by HabitType
   - Create habit modal
   - Habit detail panel

2. **Habit Components**
   - `HabitCard.tsx` - Today's progress card
   - `HabitDetail.tsx` - Full detail panel
   - `HabitLogWidget.tsx` - Quick logging interface
   - `HabitStreakDisplay.tsx` - Streak visualization
   - `HabitHeatmap.tsx` - Calendar heatmap

3. **Habit Features**
   - All habit fields editable
   - Habit Loop visualization (Trigger → Action → Reward)
   - Friction strategies display
   - Link habits to Goals
   - Daily/weekly target tracking

4. **Habit Logging**
   - Quick check-off for binary habits
   - Amount input for quantitative habits
   - Streak calculation
   - Completion statistics

#### Success Criteria
- Can create, read, update, delete habits
- Can log completions for today
- Streaks calculate correctly
- Heatmap shows completion history
- `npm run build` succeeds

---

### Strafing Run 9: Logbook Page
**Status:** ✅ COMPLETED (2026-01-04)
**Dependencies:** Run 8
**Estimated Effort:** 3-4 hours

#### Objectives
Build the Logbook page with calendar view and reflective journaling.

#### Deliverables

1. **Logbook Page Route** (`src/pages/admin/LogbookPage.tsx`)
   - Calendar view with mood indicators
   - List view with entry previews
   - Create entry for today
   - Entry detail/edit page

2. **Logbook Components**
   - `LogbookCalendar.tsx` - Month calendar with entries
   - `LogbookEntry.tsx` - Entry preview card
   - `LogbookEditor.tsx` - Entry creation/edit form
   - `MoodPicker.tsx` - Low/Steady/High selector
   - `EnergySlider.tsx` - 1-10 energy level

3. **Logbook Features**
   - Title and notes (text-focused, no media)
   - Mood and energy tracking
   - Link to Tasks, Projects, Goals, Habits
   - Auto-generated daily summary
   - Search and filter entries

4. **Entry Editor**
   - Rich text editor for notes
   - Entity linker for "what I worked on"
   - Show completed tasks and logged habits
   - Timestamp and date management

#### Success Criteria
- Can create, read, update, delete entries
- Calendar shows entries with mood colors
- Can link entries to other entities
- Daily summary auto-populates
- `npm run build` succeeds

---

### Strafing Run 10: Dependency Graph
**Status:** 🔲 NOT STARTED
**Dependencies:** Run 4
**Estimated Effort:** 4-5 hours

#### Objectives
Create an interactive dependency graph visualization for tasks.

#### Deliverables

1. **Graph Visualization Component** (`src/components/organisms/DependencyGraph.tsx`)
   - Force-directed graph layout
   - Interactive nodes (hover, click, drag)
   - Zoom and pan controls
   - Color-coded by status

2. **Graph Features**
   - Show all task dependencies
   - Highlight critical path
   - Filter by Area, Project, Status
   - Show/hide completed tasks
   - Node size reflects task size/effort

3. **Graph Integration**
   - Full-screen graph view from Tasks page
   - Mini-graph in task detail panel
   - Navigate to task from graph node
   - Update graph in real-time on changes

4. **Graph Controls**
   - Layout algorithm selector
   - Zoom controls
   - Filter panel
   - Legend for colors/sizes
   - Export graph as image

#### Success Criteria
- Graph renders all task dependencies
- Interactive navigation works
- Filtering updates graph correctly
- Critical path highlights properly
- `npm run build` succeeds

---

### Strafing Run 11: LLM - Tasks & Projects
**Status:** 🔲 NOT STARTED
**Dependencies:** Run 5, Run 10
**Estimated Effort:** 4-5 hours

#### Objectives
Integrate LLM-powered intelligence into Tasks and Projects pages.

#### Deliverables

1. **Mock LLM Service** (`src/services/llm.service.ts`)
   - Realistic mock responses with delays
   - Context-aware suggestions based on actual data
   - Multiple suggestion types and formats

2. **Tasks AI Features**
   - Smart task creation from natural language
   - Intelligent task breakdown suggestions
   - Blocker resolution assistant
   - Priority advisor
   - Effort estimation
   - Smart categorization
   - Dependency detection

3. **Projects AI Features**
   - Project scoping assistant
   - Health analysis
   - Task generation
   - Risk identification
   - Progress narrative generation

4. **AI UI Integration**
   - Suggestion cards throughout interface
   - AI assist button on forms
   - Proactive suggestions panel
   - Accept/reject suggestion actions

#### Success Criteria
- AI suggestions appear contextually
- Suggestions are based on actual user data
- Can accept/reject suggestions
- Mock responses feel realistic
- `npm run build` succeeds

---

### Strafing Run 12: LLM - Goals & Metrics
**Status:** 🔲 NOT STARTED
**Dependencies:** Run 7
**Estimated Effort:** 4-5 hours

#### Objectives
Add LLM intelligence to Goals and Metrics pages.

#### Deliverables

1. **Goals AI Features**
   - Goal refinement assistant
   - Success criteria generator
   - Metric suggestions
   - Goal cascade assistant
   - Achievement forecasting
   - Goal conflict detection

2. **Metrics AI Features**
   - Intelligent metric suggestions
   - Pattern recognition
   - Anomaly explanation
   - Correlation discovery
   - Target recommendations
   - Metric health alerts

3. **AI-Powered Insights**
   - Progress trend analysis
   - Goal achievement probability
   - Metric-goal impact visualization
   - Proactive alerts and suggestions

4. **Coaching Interface**
   - AI coach section on goal detail
   - Weekly goal review summaries
   - Personalized guidance based on patterns

#### Success Criteria
- AI suggests relevant metrics for goals
- Pattern insights are meaningful
- Forecasting feels realistic
- Coaching guidance is actionable
- `npm run build` succeeds

---

### Strafing Run 13: LLM - Habits & Logbook
**Status:** 🔲 NOT STARTED
**Dependencies:** Run 9
**Estimated Effort:** 4-5 hours

#### Objectives
Integrate LLM intelligence into Habits and Logbook pages.

#### Deliverables

1. **Habits AI Features**
   - Habit design assistant
   - Habit stack suggestions
   - Friction engineering recommendations
   - Streak recovery coach
   - Trigger optimization
   - Habit-goal alignment

2. **Logbook AI Features**
   - Reflection prompts
   - Daily digest generation
   - Pattern insights
   - Sentiment analysis
   - Weekly review generator
   - Connection suggestions

3. **Behavioral Intelligence**
   - Habit completion pattern analysis
   - Energy/mood correlation with habits
   - Optimal timing recommendations
   - Streak maintenance strategies

4. **Reflective AI**
   - Contextual journal prompts
   - Entry sentiment tracking
   - Cross-reference with daily activities
   - Future self letters

#### Success Criteria
- Habit design assistant creates complete habits
- Journal prompts are contextual
- Pattern insights connect habits to outcomes
- Weekly reviews summarize accurately
- `npm run build` succeeds

---

### Strafing Run 14: AI Intelligence Hub
**Status:** 🔲 NOT STARTED
**Dependencies:** Run 11, Run 12, Run 13
**Estimated Effort:** 3-4 hours

#### Objectives
Create the central AI intelligence dashboard and cross-cutting features.

#### Deliverables

1. **AI Dashboard Widget**
   - `AIInsightsWidget.tsx` - Dashboard card showing top insights
   - Priority-ranked recommendations
   - One-click actions
   - Rotating suggestions

2. **Daily Planning Assistant**
   - Morning briefing generator
   - Top 3 tasks for today
   - Habits to maintain
   - Metrics to log
   - Energy-aware scheduling

3. **Weekly Planning Session**
   - AI-guided review flow
   - Progress summary
   - Next week priorities
   - Habit adjustments
   - Goal check-ins

4. **Universal AI Features**
   - Smart search across entities
   - Impact analysis ("What goals does this affect?")
   - Capacity planning
   - Motivation insights

#### Success Criteria
- Dashboard shows relevant daily insights
- Planning assistant provides actionable briefing
- Smart search finds relevant entities
- Impact analysis connects actions to outcomes
- `npm run build` succeeds

---

### Strafing Run 15: Polish & Integration
**Status:** 🔲 NOT STARTED
**Dependencies:** Run 14
**Estimated Effort:** 4-5 hours

#### Objectives
Final polish, integration, performance optimization, and documentation.

#### Deliverables

1. **Command Palette** (`src/components/organisms/CommandPalette.tsx`)
   - Global Cmd+K shortcut
   - Quick navigation to entities
   - Quick actions
   - Search across all entities

2. **Navigation & UX Polish**
   - Update main navigation with all pages
   - Breadcrumbs on detail pages
   - Back button behavior
   - Keyboard shortcuts
   - Loading states consistency

3. **Cross-Entity Navigation**
   - Click entity chips to navigate
   - Show context when navigating
   - "Related items" sections
   - Timeline/activity feed

4. **Performance Optimization**
   - Lazy load components
   - Optimize re-renders
   - Virtual scrolling for long lists
   - Debounce search inputs

5. **Documentation**
   - Update README with features
   - Add JSDoc comments to components
   - Create user guide
   - Document mock data structure

#### Success Criteria
- Command palette works globally
- Navigation is intuitive and fast
- All pages are linked correctly
- Performance is smooth
- Documentation is complete
- `npm run build` succeeds
- Full application tested end-to-end

---

## 🎨 Design System

### Colors - Areas
- **Health**: Green (#10b981)
- **Wealth**: Gold (#f59e0b)
- **Love**: Pink (#ec4899)
- **Happiness**: Orange (#f97316)
- **Operations**: Gray (#6b7280)
- **DayJob**: Blue (#3b82f6)

### Colors - Priority
- **P1**: Red (#ef4444)
- **P2**: Orange (#f97316)
- **P3**: Yellow (#eab308)
- **P4**: Green (#10b981)

### Colors - Status
- **NotStarted**: Gray
- **InProgress**: Blue
- **Blocked**: Red
- **OnHold**: Yellow
- **Done**: Green
- **Cancelled**: Gray (strikethrough)

---

## 📦 File Organization

```
src/
├── components/
│   ├── atoms/          # Basic building blocks
│   ├── molecules/      # Composed components
│   ├── organisms/      # Complex components
│   └── templates/      # Page layouts
├── pages/
│   └── admin/          # All growth system pages
├── services/
│   ├── growth-system/  # Entity services
│   └── llm.service.ts  # LLM mock service
├── mocks/
│   ├── storage.ts      # localStorage wrapper
│   ├── data-generator.ts
│   └── seed-data.ts
├── types/
│   ├── growth-system.ts   # Entity types
│   ├── api-contracts.ts   # API types
│   └── llm.ts            # LLM types
└── hooks/
    └── useGrowthSystem.ts # Main hook
```

---

## 🚀 Getting Started for Each Run

```bash
# Always start by reading this plan
cat GROWTH_SYSTEM_PLAN.md

# Check current status
grep "Status:" GROWTH_SYSTEM_PLAN.md

# Do your work
# ... implement your strafing run ...

# Test your changes
npm run dev

# Build to ensure nothing broke
npm run build

# Update this plan with completion
# Change status to ✅ COMPLETED
# Add completion date and notes

# Commit your changes
# (git commits are automatic)
```

---

## 📝 Notes and Context

### Current State
- Portfolio site exists at HomePage
- Admin section exists at /admin routes
- Basic auth is set up (mock for now)
- Theme toggle exists
- Basic layouts are in place

### Technical Stack
- React 19 + TypeScript
- Vite for bundling
- TailwindCSS for styling
- React Router for navigation
- Zustand for state management (optional, can use React state)
- Framer Motion for animations
- No database - localStorage only

### Mock Data Strategy
- Use localStorage with key prefixes (e.g., `gs_tasks`, `gs_projects`)
- Generate realistic sample data on first load
- Maintain referential integrity in mocks
- Simulate API delays (100-500ms)

### LLM Mock Strategy
- Pre-written responses with variable interpolation
- Analyze actual user data to make contextual suggestions
- Multiple response variations for realism
- Delay responses to simulate processing (500-2000ms)

---

## ✅ Completion Checklist

When ALL strafing runs are complete:

- [ ] All pages accessible and functional
- [ ] All CRUD operations work
- [ ] All entity relationships work
- [ ] Dependency graph visualizes correctly
- [ ] LLM features feel intelligent and helpful
- [ ] Command palette works globally
- [ ] Navigation is intuitive
- [ ] Performance is acceptable
- [ ] `npm run build` succeeds
- [ ] Documentation is complete
- [ ] Ready for real backend integration

---

**Next Agent: Please update the status table when you complete your run!**
