# Sunny Singh Portfolio & Personal Growth System

A modern, production-ready React application built with TypeScript, Vite, and Tailwind CSS. This portfolio website includes an AI-powered personal growth system with comprehensive task management, goal tracking, habit formation, metrics tracking, and reflective journaling capabilities.

## Tech Stack

- **React 19** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS v3** for utility-first styling
- **Framer Motion** for smooth animations
- **React Router** for client-side navigation
- **Zustand** for lightweight state management (configured, ready to use)
- **TanStack Query** for server state management (configured, ready to use)
- **Lucide React** for icons

## Project Structure

The project follows the Atomic Design methodology:

```
src/
├── components/
│   ├── atoms/          # Basic building blocks (Button, Dialog)
│   ├── molecules/      # Simple component combinations (SkillCard, ProjectCard, BlogCard)
│   ├── organisms/      # Complex component sections (Header, Hero, Skills, Portfolio, etc.)
│   └── templates/      # Page layouts (MainLayout)
├── pages/              # Page components (HomePage, ProductsPage)
├── data/               # Static data (skills, projects, blog posts)
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── hooks/              # Custom React hooks (ready for use)
```

## Features

### Public Portfolio Site
- Responsive design that works on all devices
- Smooth scroll animations with Framer Motion
- Interactive skill cards with modal details
- Portfolio showcase with project descriptions
- Blog section linking to Medium articles
- Contact section with email and phone links
- Mobile-friendly navigation menu
- Loading animation
- SEO-friendly with proper meta tags
- Google Analytics integration

### Personal Growth System (Admin Area)
- **Tasks Management**: Kanban board, list view, calendar view, dependency tracking
- **Projects**: Project health tracking, task generation, risk assessment
- **Goals**: Goal hierarchy, success criteria, progress tracking by time horizon
- **Metrics**: Quantitative tracking with trend analysis and target monitoring
- **Habits**: Habit design, streak tracking, habit loop visualization
- **Logbook**: Daily journaling with mood and energy tracking
- **33 AI-Powered Features**: Comprehensive AI assistance across all areas (see below)

## Development

### Prerequisites

- Node.js 18+ and npm

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Accessing the Growth System

The Personal Growth System is located in the admin area. To access it:

1. Navigate to `/admin/login` in your browser
2. Use the demo credentials (or configure your own authentication)
3. You'll be redirected to the Growth System dashboard

Available admin routes:
- `/admin/dashboard` - Overview and AI insights
- `/admin/tasks` - Task management with Kanban/List/Calendar views
- `/admin/projects` - Project tracking and management
- `/admin/goals` - Goal hierarchy and success criteria
- `/admin/metrics` - Quantitative tracking and analytics
- `/admin/habits` - Habit formation and tracking
- `/admin/logbook` - Daily journaling and reflection
- `/admin/settings` - AI provider configuration
- `/admin/chatbot` - AI chatbot assistant
- `/admin/components-demo` - Component showcase

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## AI Features Guide

The Growth System includes 33 AI-powered features across all entity types. To use AI features, you must first configure an AI provider in Settings.

### Configuring AI Providers

1. Go to `/admin/settings`
2. Navigate to the "AI Settings" tab
3. Add API keys for one or more providers:
   - Anthropic (Claude)
   - OpenAI (GPT-4)
   - Google (Gemini)
   - Groq (Llama)
   - xAI (Grok)
   - DeepSeek
   - Cerebras
4. Configure which provider to use for each AI feature
5. Save your configuration

### Using AI Tools on Each Page

Once configured, AI tools appear in the detail view of each entity:

#### Tasks AI Tools
When viewing a task detail, click "AI Task Tools" to access:
- **Parse Natural Language**: Convert plain text into structured tasks
- **Breakdown Task**: Decompose complex tasks into subtasks
- **Priority Advisor**: Get recommendations on task prioritization
- **Effort Estimation**: Estimate time and effort required
- **Categorization**: Suggest area and subcategory
- **Dependency Detection**: Identify task dependencies
- **Blocker Resolution**: Get suggestions for unblocking tasks

#### Projects AI Tools
When viewing a project detail, click "AI Project Tools" to access:
- **Health Analysis**: Assess overall project health and risks
- **Generate Tasks**: Create comprehensive task breakdown
- **Risk Assessment**: Identify potential project risks

#### Goals AI Tools
When viewing a goal detail, click "AI Goal Tools" to access:
- **Refine Goal**: Improve goal clarity and specificity
- **Success Criteria**: Generate measurable success criteria
- **Suggest Metrics**: Recommend metrics to track progress
- **Forecast Achievement**: Predict likelihood of goal completion
- **Check Conflicts**: Identify conflicting goals
- **Progress Analysis**: Analyze current progress and trajectory

#### Metrics AI Tools
When viewing a metric detail, click "AI Metric Tools" to access:
- **Pattern Recognition**: Identify trends and patterns in your data
- **Anomaly Detection**: Flag unusual data points
- **Correlations**: Discover relationships between metrics
- **Target Recommendations**: Suggest appropriate targets
- **Health Analysis**: Assess metric tracking consistency

#### Habits AI Tools
When viewing a habit detail, click "AI Habit Tools" to access:
- **Habit Design**: Optimize trigger-action-reward loop
- **Habit Stacking**: Suggest habit combinations
- **Streak Recovery**: Get back on track after missing days
- **Pattern Analysis**: Understand completion patterns
- **Trigger Optimization**: Improve habit cues
- **Goal Alignment**: Check alignment with your goals

#### Logbook AI Tools
When viewing a journal entry, click "AI Logbook Tools" to access:
- **Reflection Prompts**: Get thoughtful journaling questions
- **Daily Digest**: Summarize your day's activities
- **Pattern Insights**: Discover patterns in your journaling
- **Sentiment Analysis**: Analyze emotional trends
- **Weekly Review**: Generate comprehensive weekly summaries
- **Connection Suggestions**: Link entries to tasks, goals, and habits

### AI Assistant Chatbot

The chatbot at `/admin/chatbot` provides conversational AI assistance:
- Ask questions about your growth system
- Get personalized recommendations
- Analyze patterns across all your data
- Plan your day, week, or month
- Receive motivational insights

### Cost Optimization

To optimize API costs:
1. Go to Settings > AI Settings
2. Click "Apply Cost-Optimized Mix"
3. This configures faster, cheaper models for simple tasks
4. More complex analysis uses powerful models

### Privacy Note

All AI features can work with:
- **Direct API calls**: Your data sent directly to providers (configure API keys)
- **Backend proxy**: Route through your own backend (configure in settings)
- **Mock mode**: Simulated AI responses for testing (default when not configured)

## Deployment

### GitHub Pages

This project is configured for automatic GitHub Pages deployment with a custom domain.

#### Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys your site whenever you push to the `master` branch.

**Setup Steps:**

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save the settings

2. **Configure your custom domain (sunnysingh.tech):**
   - In the same Pages settings, enter your custom domain: `sunnysingh.tech`
   - GitHub will automatically create/update the CNAME file
   - Update your DNS records to point to GitHub Pages:
     - Add a CNAME record: `sunnysingh.tech` → `yourusername.github.io`
     - Or add A records pointing to GitHub's IP addresses

3. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin master
   ```

4. **Monitor deployment:**
   - Go to the **Actions** tab in your GitHub repository
   - Watch the deployment workflow run
   - Once complete, your site will be live at `https://sunnysingh.tech`

#### Manual Deployment (Alternative)

If you prefer manual deployment using `gh-pages`:

```bash
npm run deploy
```

This will:
- Build the production version
- Deploy to the `gh-pages` branch
- Preserve the CNAME file for custom domain

**Note:** The manual method requires the `gh-pages` package (already installed) and will deploy to the `gh-pages` branch. For automatic deployments, use the GitHub Actions workflow instead.

#### Important Notes

- The `404.html` file ensures that React Router works correctly with GitHub Pages (handles client-side routing)
- The CNAME file is automatically copied to the `dist` folder during build
- Make sure your default branch is `main` (or update the workflow file if using `master`)

## Customization

### Updating Content

- **Skills**: Edit `src/data/skills.ts`
- **Projects**: Edit `src/data/projects.ts`
- **Blog Posts**: Edit `src/data/blog.ts`

### Styling

The project uses Tailwind CSS. The main colors are defined in `tailwind.config.js`:
- Primary: `#007bff` (Bootstrap blue)
- Fonts: Montserrat (sans-serif) and Playfair Display (serif)

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Update the navigation in `src/components/organisms/Header.tsx`

## Assets

All images and fonts are located in the `public/` directory:
- `public/images/` - Portfolio images, logos, GIFs
- `public/fonts/` - Icon fonts (icomoon, flaticon)

## Performance

The production build is optimized with:
- Code splitting
- Asset optimization
- Tree shaking
- Minification

Current bundle size: ~283KB (main bundle)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This template uses the Colorlib template which is licensed under CC BY 3.0.
