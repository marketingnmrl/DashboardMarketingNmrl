# Test Plan: Migration to Next.js

## Test Cases

### Authentication
- [ ] **Login Success**: Enter valid credentials -> Redirect to Dashboard.
- [ ] **Login Failure**: Enter invalid credentials -> Show error message.
- [ ] **Logout**: Click logout -> Redirect to Login page.
- [ ] **Protected Route**: Try to access `/` without cookie -> Redirect to `/login`.

### Dashboard
- [ ] **Data Loading**: Verify that data loads correctly from Hotmart/Zouti.
- [ ] **Filters**: Change period or source -> Data updates.
- [ ] **UI Rendering**: Verify Sidebar, Header, and Charts render correctly.

### API
- [ ] **GET /api/data**: Returns JSON with dashboard data.
- [ ] **POST /api/auth/login**: Returns success/cookie.
