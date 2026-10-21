# FireWatch Frontend

React 19 + Vite 7 + Tailwind CSS 4 dashboard for the FireWatch fire detection system.

## Setup

```bash
cp .env.example .env    # Optionally set VITE_BACKEND_URL
npm install
npm run dev             # http://localhost:5173
```

## Build for Production

```bash
npm run build           # Output: dist/
npm run preview         # Preview production build locally
```

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/register` | Register | Create account (org registration) |
| `/login` | Login | Sign in |
| `/` | Dashboard | Stats, charts, live gallery |
| `/history` | History | Filterable detection table + CSV export |
| `/map` | MapView | Leaflet map with fire/smoke markers |
| `/insights` | Insights | AI risk assessment + Q&A chatbot |
| `/settings` | Settings | Profile, password, hardware access code |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Backend API URL (defaults to `http://localhost:5000` in dev) |
