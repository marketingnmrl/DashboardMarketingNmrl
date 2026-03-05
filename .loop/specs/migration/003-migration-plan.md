# Implementation Plan: Migration to Next.js

## Phase 1: Project Setup
- [ ] Configure `next.config.js`.
- [ ] Organize folder structure for Next.js (App Router).
- [ ] Move static assets to the correct location.

## Phase 2: Backend Migration (API & Auth)
- [ ] Migrate `services/` (already compatible, just ensure paths are correct).
- [ ] Create `app/api/auth/login/route.js`.
- [ ] Create `app/api/auth/logout/route.js`.
- [ ] Create `app/api/auth/me/route.js`.
- [ ] Create `app/api/data/route.js`.
- [ ] Implement `middleware.js` for route protection.

## Phase 3: Frontend Migration
- [ ] Create `app/layout.js` and import global styles.
- [ ] Create `app/login/page.js` (Login UI).
- [ ] Create `app/page.js` (Dashboard UI).
- [ ] Create necessary components (`Sidebar`, `Header`, `DashboardFilters`).

## Phase 4: Cleanup & Deployment
- [ ] Remove Express-specific files (`server.js`, `app.js`, `routes/`, `views/`).
- [ ] Update `package.json` scripts.
- [ ] Verify `vercel.json` or remove if not needed (Next.js handles this).
