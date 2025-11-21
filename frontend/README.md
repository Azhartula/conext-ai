# Frontend (Next.js + React)

This folder hosts the React UI for uploading contact cards and visualizing AI-extracted contacts. Stack:

- Next.js 14+ with the App Router
- TypeScript
- Tailwind CSS for rapid styling

Key directories:
- `app/` – routes and shared layout
- `app/components/` – UI building blocks (upload widget, contact list, etc.)
- `hooks/` – client-side state management hooks
- `lib/` – API clients and utilities
- `public/` – static assets such as sample card images
- `styles/` – global CSS (e.g., Tailwind base)

## Commands

```powershell
npm install
npm run dev   # http://localhost:3000
npm run build # typecheck + production build
```
