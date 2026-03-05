# Business Specification: Migration to Next.js

## Goal
The primary goal is to migrate the existing Express.js and EJS-based CRM Dashboard application to a Next.js framework to enable seamless deployment and hosting on Vercel. This migration aims to modernize the codebase, improve performance, and leverage Vercel's serverless capabilities.

## User Stories
- As a system administrator, I want the application to be hosted on Vercel so that I can take advantage of serverless scaling and easy deployments.
- As a user, I want to log in securely using the existing authentication mechanism.
- As a user, I want to view the dashboard with real-time data from Hotmart and Zouti, just as I did in the previous version.
- As a developer, I want a structured Next.js codebase that is easier to maintain and extend.

## Specific Requirements
- **Framework**: Next.js 15 (App Router preferred).
- **Deployment**: Vercel.
- **Authentication**: Maintain cookie-based authentication compatible with Next.js Middleware.
- **Data Sources**: Integrate existing services (Hotmart, Zouti, Supabase) without logic changes.
- **Styling**: Reuse existing CSS where possible, or migrate to CSS Modules/Tailwind if efficient.

## Visual Design
- The visual design should remain consistent with the current EJS templates.
- The dashboard layout (Sidebar, Header, Main Content) must be preserved.

## Existing Code to Leverage
- **Services**: `services/auth.js`, `services/hotmart.js`, `services/supabase.js`, `services/zouti.js` can be reused directly or with minimal adaptation.
- **Styles**: `public/css/style.css` can be imported globally.
- **Logic**: The business logic in `routes/api.js` and `routes/auth.js` will be moved to Next.js API routes.

## Out of Scope
- Major UI redesign.
- Adding new features during the migration phase.
- Changing the underlying database or external service providers.
