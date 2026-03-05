# Task List: Migration to Next.js

- [ ] **Setup Next.js Configuration**
  - Create `next.config.js`.
  - Update `package.json` scripts (`dev`, `build`, `start`).

- [ ] **Migrate Static Assets**
  - Ensure `public/css` and `public/js` are accessible.
  - Move `static/` content to `public/static/` if necessary or configure Next.js to serve it.

- [ ] **Implement Authentication Middleware**
  - Create `middleware.js` in the root.
  - Implement logic to check cookies and redirect.

- [ ] **Migrate API Routes**
  - Create `app/api/auth/login/route.js` based on `routes/auth.js`.
  - Create `app/api/auth/logout/route.js` based on `routes/auth.js`.
  - Create `app/api/auth/me/route.js` based on `routes/auth.js`.
  - Create `app/api/data/route.js` based on `routes/api.js`.

- [ ] **Migrate Login Page**
  - Create `app/login/page.js`.
  - Convert EJS form to React form.
  - Handle form submission via API call.

- [ ] **Migrate Dashboard Page**
  - Create `app/layout.js` (Root Layout).
  - Create `app/page.js` (Dashboard Main).
  - Componentize Sidebar and Header.
  - Implement data fetching from `/api/data`.

- [ ] **Cleanup**
  - Delete `server.js`, `app.js`.
  - Delete `routes/` folder.
  - Delete `views/` folder.
