# Frontend

This frontend is a React + Vite application that powers the LogScope SaaS-style observability UI.

## Main areas

- Authentication, signup, OAuth callback, and MFA
- Dashboard and analytics
- Applications workspace and live log detail pages
- Settings, profile, security, notifications, and appearance
- Shared modal, card, dialog, and navigation systems
- App-wide dark/light theme support

## Important files

- `src/main.jsx`: app bootstrap and providers
- `src/App.jsx`: authenticated shell
- `src/context/AuthContext.jsx`: auth state
- `src/context/ThemeContext.jsx`: app-wide theme state
- `src/pages/`: top-level routes
- `src/components/`: reusable feature and UI components
- `src/hooks/useLogs.js`: live log fetching and subscription logic
- `src/services/socket.js`: Socket.IO client
- `src/index.css`: design tokens and shared global styling

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Notes

- The app uses Tailwind-based styling with shared CSS variables for theme support
- Production builds are served through Nginx in the Docker image
- The frontend expects the backend API and Socket.IO server to be reachable from the configured environment