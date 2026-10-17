# How to Merge Admin Pages to institution-admin Branch

Follow these steps in your terminal to copy the admin pages from `institution-web-feature-branch` to `institution-admin`:

## Step 1: Abort any ongoing merge (if needed)
```bash
git merge --abort
```

## Step 2: Make sure you're on institution-admin branch
```bash
git checkout institution-admin
```

## Step 3: Cherry-pick or merge the admin pages

### Option A: Full merge (recommended - keeps all history)
```bash
# Merge all changes from institution-web-feature-branch
git merge institution-web-feature-branch -m "Merge admin pages from institution-web-feature-branch"
```

### Option B: Cherry-pick specific files only (if you want selective copy)
```bash
# Copy specific admin directories
git checkout institution-web-feature-branch -- frontend/web/src/pages/Admin
git checkout institution-web-feature-branch -- frontend/web/src/components/admin
git checkout institution-web-feature-branch -- frontend/web/src/data/mockAdminData.js

# Then commit
git add frontend/web/src/pages/Admin
git add frontend/web/src/components/admin
git add frontend/web/src/data/mockAdminData.js
git commit -m "Add comprehensive admin pages from institution-web-feature-branch"
```

### Option C: Copy only new admin enhancements (safest)
```bash
# Copy the enhanced admin pages
git checkout institution-web-feature-branch -- frontend/web/src/pages/Admin/Dashboard/AdminDashboardPage.jsx
git checkout institution-web-feature-branch -- frontend/web/src/pages/Admin/Profile/AdminProfilePage.jsx
git checkout institution-web-feature-branch -- frontend/web/src/pages/Admin/Settings/SystemSettingsPage.jsx
git checkout institution-web-feature-branch -- frontend/web/src/components/admin/layout/AdminTopBar.jsx
git checkout institution-web-feature-branch -- frontend/web/src/components/admin/ui/NotificationDropdown.jsx
git checkout institution-web-feature-branch -- frontend/web/src/data/mockAdminData.js

# Commit the changes
git add .
git commit -m "Add enhanced admin dashboard, profile, settings, and notifications"
```

## Step 4: Verify the merge
```bash
# Check what was changed
git log -1

# Verify files exist
ls frontend/web/src/pages/Admin/
```

## Step 5: Push to remote
```bash
git push origin institution-admin
```

## Recommendation

I recommend **Option A (full merge)** because:
- ✅ Preserves all commit history
- ✅ Keeps all admin enhancements together
- ✅ Easiest to track changes
- ✅ Can be easily reverted if needed

## If you get conflicts:

1. Git will show which files have conflicts
2. Open the conflicted files
3. Look for `<<<<<<<`, `=======`, `>>>>>>>` markers
4. Choose which version to keep
5. Remove the conflict markers
6. Run: `git add <filename>`
7. Run: `git commit`

## Current Status

Your admin pages on `institution-web-feature-branch` include:
- ✅ Enhanced Dashboard with 8 stats, 4 charts, performance table
- ✅ Profile page with edit functionality
- ✅ Settings page with save/reset
- ✅ Notification dropdown
- ✅ All 12 admin pages (Users, Institutions, Categories, etc.)
- ✅ Enhanced mock data
- ✅ All components and layouts

All of this will be copied to `institution-admin` branch.
