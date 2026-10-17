# Resolving Pull Request Conflicts

## Current Situation

Your pull request #130 (`institution-admin-ui`) has conflicts that need to be resolved before merging.

From the screenshot, there are 2 PRs in a stack:
1. **#130** - institution-admin-ui (main) - **Not ready** ⚠️
2. **#126** - feat(admin): add complete inventory documentation for admin pages and... - **Not ready** ⚠️

## What Causes This?

The conflicts occur because:
- Multiple pull requests are stacked (one depends on another)
- Changes in the base branch conflict with your branch
- Files were modified in both branches differently

## Solution Steps

### Option 1: Resolve Conflicts on GitHub (Easiest)

1. **Click "Resolve conflicts" button** on the PR page
2. GitHub will show you the conflicting files
3. Edit the files to keep the correct version
4. Click "Mark as resolved"
5. Click "Commit merge"

### Option 2: Resolve Conflicts Locally (More Control)

```bash
# Make sure you're on institution-admin branch
git checkout institution-admin

# Pull the latest from the target branch (probably main)
git fetch origin
git merge origin/main

# This will show conflicts if any exist
# Resolve conflicts in the files git mentions

# After fixing conflicts, stage the files
git add <conflicted-files>

# Commit the merge
git commit -m "Resolve merge conflicts with main"

# Push
git push origin institution-admin
```

### Option 3: Rebase Instead of Merge (Cleanest)

```bash
# Make sure you're on institution-admin branch
git checkout institution-admin

# Rebase on top of main
git fetch origin
git rebase origin/main

# If conflicts occur, resolve them, then:
git add <resolved-files>
git rebase --continue

# Force push (since you rewrote history)
git push --force-with-lease origin institution-admin
```

## What Files Likely Have Conflicts?

Based on the earlier merge, likely conflicts are:
- `frontend/web/src/pages/Login/LoginPage.jsx`
- `frontend/web/src/assets/furko-logo.jpg`
- Possibly some citizen app files

## Quick Check - What Needs to Be Done

Run this to see what conflicts exist:

```bash
# See what's different from main
git fetch origin
git diff origin/main..institution-admin --name-only

# Or check the merge base
git merge-base origin/main institution-admin
```

## After Resolving Conflicts

Once conflicts are resolved:
1. ✅ PR will change from "Not ready" to "Ready to merge"
2. ✅ Green checkmark will appear
3. ✅ You can click "Merge pull request"

## Recommendation

**Use Option 1** (Resolve on GitHub) because:
- ✅ Visual interface shows conflicts clearly
- ✅ Easy to see what changed
- ✅ No command line needed
- ✅ Can't mess up your local repo

Just click the **"Resolve conflicts"** button on the PR page and GitHub will guide you through it!

## If You Get Stuck

You can also:
- Ask a team member to help resolve conflicts
- Close this PR and create a fresh one
- Merge the conflicting PRs first, then try again

---

**The admin pages are already pushed** - this is just about resolving conflicts to merge the PR into main/target branch.
