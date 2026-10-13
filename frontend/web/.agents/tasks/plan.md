# Implementation Plan: FURKO Admin UI Comprehensive Expansion

This plan expands all 12 FURKO System Administrator pages from basic layouts to comprehensive, production-ready admin interfaces.

**Note:** This work has been decomposed into 5 independent features (FEAT-001 through FEAT-005). See the FEAT artifacts in `.agents/tasks/task-admin-ui-expansion/features/` for detailed implementation steps. If the workflow was restructured, each FEAT will be implemented sequentially by dedicated coder steps. Otherwise, this plan serves as the implementation guide.

## Feature Overview

### FEAT-001: Shared Layout & Reusable Components
- Expand AdminTopBar with functional notifications dropdown
- Update AdminSidebar with collapsible sections
- Create reusable components: FilterPanel, SummaryCards, ActionButton, NotificationDropdown
- Expand mock notifications data

**Dependencies:** None (implements foundation used by all other features)

### FEAT-002: Dashboard, Users, and Institutions Pages
- Expand Dashboard with 8 stat cards, time-range filters, institutional performance table, expanded activity
- Expand Users page with summary cards, detailed table columns, bulk actions, user details modal
- Expand Institutions page with summary cards, detailed table, institution details modal with tabs
- Expand mock data for users and institutions

**Dependencies:** FEAT-001 (uses SummaryCards, FilterPanel, ActionButton components)

### FEAT-003: Categories, Service Areas, and Routing Rules Pages
- Expand Categories with usage tracking, category details modal, relationship visualization
- Expand Service Areas with dependency tracking, service area details modal
- Expand Routing Rules with conflict detection, effectiveness scoring, rule details modal
- Expand mock data for categories, service areas, and routing rules

**Dependencies:** FEAT-001 (uses SummaryCards, FilterPanel components)

### FEAT-004: Fallback Queue, Reports, and Audit Log Pages
- Expand Fallback Queue with review workflow, bulk actions, review modal
- Expand Reports & Monitoring with analytics charts, comprehensive filters, report details modal
- Expand Audit Log with detailed tracking, audit details modal
- Expand mock data for fallback queue, reports, and audit log

**Dependencies:** FEAT-001 (uses SummaryCards, FilterPanel components)

### FEAT-005: System Settings and Admin Profile Pages
- Add missing profile route to AdminApp.jsx
- Expand System Settings with platform config, email config, backup/maintenance, reports config, integrations
- Expand Admin Profile with security section, preferences, active sessions, login history, password change
- Create supporting modals and components

**Dependencies:** None (independent page expansions)

## Verification Strategy

Each feature includes specific verification steps. Overall verification:

1. **Visual Verification**: Run `npm run dev` and navigate through all 12 admin pages. Verify consistent styling, proper spacing, green branding preserved.

2. **Functional Verification**: Test all interactive features:
   - Notifications dropdown opens and allows dismissing
   - Sidebar sections collapse/expand
   - All filters update their respective tables
   - All modals open correctly with proper data
   - All forms validate and show appropriate messages
   - All bulk actions work on frontend

3. **Data Verification**: Verify mock data displays correctly across all pages, relationships between entities (categories → routing rules → institutions) are accurate.

4. **Console Verification**: Check browser console for errors on each page - should be clean.

5. **Responsive Verification**: Test at desktop widths (1024px, 1440px, 1920px) - layout should adapt appropriately.

## Technology Stack

- **Framework**: React 18.3 with JSX
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React 1.52
- **Routing**: React Router DOM 6.26
- **Data**: Mock data in src/data/ files
- **Charts**: CSS-based bar charts (no chart library installed)

## File Organization

```
src/
├── pages/Admin/              # All admin pages
│   ├── Dashboard/
│   ├── Users/
│   ├── Institutions/
│   ├── Categories/
│   ├── ServiceAreas/
│   ├── RoutingRules/
│   ├── FallbackQueue/
│   ├── Reports/
│   ├── Settings/
│   ├── Profile/
│   └── AuditLog/
├── components/admin/         # Admin-specific components
│   ├── layout/              # Layout components
│   ├── tables/              # Table components
│   ├── dashboard/           # Dashboard widgets
│   └── ui/                  # Admin UI helpers
├── components/ui/           # Shared UI components
├── data/                    # Mock data files
│   └── mockAdminData.js     # Main admin mock data
└── services/admin/          # API service files (return mock data)
```

## Implementation Notes

1. **Preserve Existing Patterns**: All pages follow the established pattern of white cards with rounded borders, green primary buttons, consistent spacing.

2. **Mock Data Integrity**: All timestamps use ISO format. All IDs use consistent prefixes (USR-, INST-, CAT-, etc.). Relationships between entities are maintained (e.g., routing rules reference valid categories and institutions).

3. **Frontend-Only Features**: Many features (notifications, bulk actions, export, backup) work entirely on the frontend. Clear indicators distinguish mock data from backend integration points.

4. **Validation**: All forms validate on the frontend. Error messages are clear and actionable.

5. **Accessibility**: Use semantic HTML, aria labels where appropriate, keyboard navigation support.

6. **No Breaking Changes**: All existing functionality is preserved. New features are additive.

## Success Criteria

- All 12 admin pages are significantly more comprehensive than before
- Each page includes multiple sections with meaningful content
- All interactive features work without backend
- Mock data is realistic and demonstrates platform capabilities
- No console errors across any page
- Consistent visual design maintained throughout
- Profile and Settings pages are fully accessible via navigation

