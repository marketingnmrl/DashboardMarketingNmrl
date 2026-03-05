# Technical Specification: Migration to Next.js

## Architecture Overview
The application will be transformed from a monolithic Express app to a Next.js application using the App Router. The backend logic (API) will reside in Next.js Route Handlers, and the frontend (Views) will be React Server Components and Client Components.

## Technical Stack
- **Framework**: Next.js 15
- **Language**: JavaScript (Node.js)
- **Styling**: CSS (Global styles from existing `style.css`)
- **State Management**: React State (for filters and dashboard data)
- **Authentication**: Next.js Middleware + Cookies

## Component Design
- **Layout**: `app/layout.js` will handle the global HTML structure and import global styles.
- **Pages**:
  - `app/page.js`: The main dashboard view (protected).
  - `app/login/page.js`: The login page.
- **Components**:
  - `Sidebar`: Navigation component.
  - `Header`: Top bar with user info.
  - `DashboardContent`: Client component to fetch and display data.

## Data Model
- No changes to the data model. Data is fetched from external APIs (Hotmart, Zouti) and processed by existing services.

## API Endpoints
- `GET /api/data`: Fetches dashboard data (migrated from `routes/api.js`).
- `POST /api/auth/login`: Handles login (migrated from `routes/auth.js`).
- `POST /api/auth/logout`: Handles logout.
- `GET /api/auth/me`: Returns current user info.

## Technical Decisions
- **Middleware**: Use `middleware.js` to protect routes matching `/` and `/api/*`, redirecting unauthenticated users to `/login`.
- **Services**: The `services/` directory will be kept as is, as it contains pure Node.js logic.
- **Static Assets**: Move `public/` contents to the root `public/` folder in Next.js.

## Changes

### Create `app/layout.js`
**Description**: Root layout for the application.
**Technical patterns**: Next.js Root Layout.

### Create `app/page.js`
**Description**: Main dashboard page. Protected by middleware.
**Technical patterns**: React Server Component.

### Create `app/login/page.js`
**Description**: Login page with form handling.
**Technical patterns**: Client Component for form submission.

### Create `app/api/data/route.js`
**Description**: API route for fetching dashboard data.
**Technical patterns**: Next.js Route Handler.

### Create `middleware.js`
**Description**: Handles authentication checks.
**Technical patterns**: Next.js Middleware.
