# Frontend Guide

This frontend is a React + Vite application for the LogScope user interface.

## Main product areas

- authentication, signup, OAuth callback, and MFA
- dashboard and analytics
- applications workspace and live log pages
- settings, profile, security, notifications, and appearance
- shared dialogs, cards, sidebars, and log components
- app-wide dark and light theme support

## Important files

- `src/main.jsx`: app bootstrap and global providers
- `src/App.jsx`: authenticated shell
- `src/context/AuthContext.jsx`: authentication state
- `src/context/ThemeContext.jsx`: theme state
- `src/context/AppStatusContext.jsx`: server reachability fallback state
- `src/pages/`: route-level screens
- `src/components/`: reusable UI and feature components
- `src/hooks/useLogs.js`: live log fetching and subscription logic
- `src/services/socket.js`: Socket.IO client
- `src/index.css`: global tokens and shared styling

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Notes

- Styling is based on Tailwind utilities and shared CSS variables
- Production builds are served by Nginx in the Docker image
- The app now includes global loading, error fallback, and server-unreachable states