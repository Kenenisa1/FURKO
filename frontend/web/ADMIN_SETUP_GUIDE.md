# FURKO Admin Interface - Quick Setup Guide

## Step 1: Enable Admin Interface

Replace the content of `src/main.jsx` with the content from `src/main-new.jsx`:

```bash
cd FURKO/frontend/web

# Backup the original (optional)
cp src/main.jsx src/main-institution-only.jsx

# Copy new unified entry point
cp src/main-new.jsx src/main.jsx
```

**Alternative:** Manually edit `src/main.jsx` and change:
```javascript
import App from './App.jsx'
// to
import RootApp from './RootApp.jsx'

// and change
<App />
// to
<RootApp />
```

## Step 2: Start Development Server

```bash
npm run dev
```

## Step 3: Access the Admin Interface

Open your browser and navigate to:

**Admin Login:** `http://localhost:5173/admin/login`

**Demo Credentials:**
- Email: `admin@furko.local`
- Password: `admin123`

## Step 4: Test the Admin Features

After logging in, you'll see the admin dashboard. Test these pages:

1. **Dashboard** (`/admin`) - Overview and statistics
2. **Users** (`/admin/users`) - User management
3. **Institutions** (`/admin/institutions`) - Institution management
4. **Categories** (`/admin/categories`) - Problem categories
5. **Routing Rules** (`/admin/routing-rules`) - Routing configuration
6. **Fallback Queue** (`/admin/fallback-queue`) - Manual review queue
7. **Reports** (`/admin/reports`) - Platform-wide monitoring
8. **Settings** (`/admin/settings`) - System configuration
9. **Audit Log** (`/admin/audit-log`) - Action history

## Institution Dashboard Still Works

The existing institution dashboard is unaffected:

**Institution Login:** `http://localhost:5173/login`

**Demo Credentials:**
- Email: `institution@furko.local`
- Password: `password`

## Troubleshooting

### Port Already in Use

If port 5173 is busy:
```bash
npm run dev -- --port 3000
```

Then access:
- Admin: `http://localhost:3000/admin/login`
- Institution: `http://localhost:3000/login`

### Admin Routes Not Working

Make sure you've updated `src/main.jsx` to use `RootApp.jsx` instead of `App.jsx`.

### Blank Page

Check browser console for errors. Common issues:
- Missing import in RootApp.jsx
- Typo in file paths
- Incorrect BrowserRouter nesting

### Styling Issues

Clear browser cache and hard reload:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

## What's Next?

1. **Explore the Interface:** Click through all admin pages
2. **Test CRUD Operations:** Create, edit, delete users/institutions
3. **Check Mock Data:** Located in `src/data/mockAdminData.js`
4. **Review Code:** See component structure in `src/pages/Admin/`
5. **Plan Backend Integration:** When ready, update API services in `src/services/admin/`

## Backend Integration (Future)

When you're ready to connect to a real backend:

1. Update API base URL in service files
2. Implement proper JWT authentication
3. Replace mock data with real API calls
4. Add error handling for network failures
5. Implement proper authorization checks

See `ADMIN_README.md` for detailed integration guide.

## Need Help?

- **Admin code:** `src/pages/Admin/`, `src/components/admin/`
- **Mock services:** `src/services/admin/`
- **Mock data:** `src/data/mockAdminData.js`
- **API docs:** `docs/05_API_SPECIFICATION.md`
- **Database schema:** `docs/04_DATABASE_DESIGN.md`

---

**You're all set!** The admin interface is fully functional with mock data.
