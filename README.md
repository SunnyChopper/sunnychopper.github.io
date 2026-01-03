# Sunny Singh Portfolio - React App

A modern, production-ready React application built with TypeScript, Vite, and Tailwind CSS. This is a complete migration of the original HTML/CSS portfolio website to a modern React stack.

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

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### GitHub Pages

This project is configured for GitHub Pages deployment with a custom domain.

1. Make sure you have the `gh-pages` branch set up in your repository
2. Deploy with:

```bash
npm run deploy
```

This will:
- Build the production version
- Deploy to the `gh-pages` branch
- Preserve the CNAME file for custom domain

The site will be available at your custom domain (sunnysingh.tech).

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
