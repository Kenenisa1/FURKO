# FURKO Admin Interface - Feature Guide

## 🎯 Quick Navigation

After logging in at `/admin/login`, you'll see a clean sidebar with these sections:

### Main Navigation
- 🏠 **Overview** - Dashboard with statistics and insights
- 👥 **Users & Roles** - Manage all platform users
- 🏢 **Institutions** - Manage participating organizations
- 📁 **Problem Categories** - Configure report categories
- 🔀 **Routing Rules** - Set up automatic report routing
- 📥 **Fallback Review Queue** - Handle unmatched reports
- 📊 **Reports & Monitoring** - Platform-wide oversight
- ⚙️ **System Settings** - Configuration options
- 📋 **Audit Log** - Complete action history

---

## 📄 Page-by-Page Feature List

### 1. Dashboard Overview (`/admin`)

**What You See:**
- 8 summary cards with key platform metrics
- Reports by status chart (horizontal bars)
- Reports by category breakdown
- Recent activity timeline (last 5 actions)
- Quick action shortcuts

**Key Metrics Displayed:**
- Total Reports: 1,247
- New Reports: 23
- In Progress: 45
- Resolved: 1,098
- Active Institutions: 4
- Registered Users: 3,421
- Fallback Queue: 3 pending
- Average Resolution Time: 3.2 days

**Quick Actions:**
- Jump to Institutions management
- Jump to Users management
- Jump to Routing configuration
- Review Fallback Queue (if items pending)

---

### 2. Users & Roles Management (`/admin/users`)

**Features:**
- ✅ View all users in a sortable table
- ✅ Search by name or email
- ✅ Filter by role (Citizen, Staff, Admin)
- ✅ Filter by status (Active, Inactive)
- ✅ Create new user accounts
- ✅ Edit user details
- ✅ Assign roles (Citizen, Institution Staff, Administrator)
- ✅ Link staff to institutions
- ✅ Activate/deactivate accounts
- ✅ Delete users (with confirmation)

**Table Columns:**
- Name & Email
- Role badge
- Associated Institution
- Status badge
- Registration date
- Actions (Edit, Toggle Status, Delete)

**Form Fields:**
- Full Name (required)
- Email Address (required)
- Role selection (required)
- Institution (required for staff)
- Account Status

**Sample Users:**
- 6 demo users including citizens, staff, and admin

---

### 3. Institutions Management (`/admin/institutions`)

**Features:**
- ✅ View all institutions
- ✅ Search by name or type
- ✅ Filter by status (Active, Inactive)
- ✅ Add new institutions
- ✅ Edit institution details
- ✅ Configure service areas (multi-select)
- ✅ Manage contact information
- ✅ Activate/deactivate institutions
- ✅ Delete institutions (with warning)
- ✅ See assigned report count
- ✅ See staff count

**Table Columns:**
- Institution name & type
- Contact email & phone
- Service areas (with "more" indicator)
- Assigned reports count
- Status badge
- Actions

**Form Fields:**
- Institution Name (required)
- Type (Government, Public Utility, Municipal Service)
- Contact Email (required)
- Contact Phone
- Physical Address
- Service Areas (checkboxes):
  - Roads & Streets
  - Water Supply
  - Sewerage
  - Waste & Sanitation
  - Drainage
  - Street Lighting
  - Parks & Green Spaces
- Status

**Sample Institutions:**
- Roads & Infrastructure Bureau
- Jimma Water Service
- Waste Management Bureau
- Street Lighting Department
- Parks & Recreation (inactive example)

---

### 4. Problem Categories (`/admin/categories`)

**Features:**
- ✅ View all report categories
- ✅ Search categories
- ✅ Filter by status
- ✅ Add new categories
- ✅ Edit category details
- ✅ Set category icons (emoji)
- ✅ Enable/disable categories
- ✅ See routing rule count
- ✅ Delete categories (with impact warning)

**Table Columns:**
- Icon (emoji)
- Category name & description
- Associated routing rules count
- Status badge
- Actions

**Form Fields:**
- Category Name (required)
- Description
- Icon (emoji, 2 chars max)
- Status

**Sample Categories:**
- 🛣️ Roads & Streets
- 💧 Water Supply
- 🗑️ Waste & Sanitation
- 🌊 Drainage
- 💡 Street Lighting
- 🌳 Parks & Green Spaces

---

### 5. Routing Rules Configuration (`/admin/routing-rules`)

**Features:**
- ✅ View all routing rules
- ✅ Search rules
- ✅ Add new routing rules
- ✅ Edit existing rules
- ✅ Map categories to institutions
- ✅ Define service areas
- ✅ Set rule priorities
- ✅ Enable/disable rules
- ✅ See last updated timestamp

**Table Columns:**
- Rule name & category
- Service area
- Target institution
- Priority badge
- Status badge
- Actions

**Form Fields:**
- Rule Name (required)
- Category (dropdown of active categories)
- Service Area description (required)
- Target Institution (dropdown of active institutions)
- Priority (number, default: 1)
- Status

**Sample Rules:**
- Roads - Central District
- Water - Citywide
- Waste - Residential Areas
- Drainage - Roads Bureau
- Street Lights - Citywide

**How It Works:**
When a citizen submits a report:
1. System checks selected institution
2. Validates against routing rules
3. If valid → routes to institution
4. If invalid → sends to fallback queue

---

### 6. Fallback Review Queue (`/admin/fallback-queue`)

**Purpose:**
Handle reports that cannot be automatically routed due to:
- No matching routing rule
- Institution inactive
- Multiple category conflicts
- Routing configuration errors

**Features:**
- ✅ View unmatched reports
- ✅ See reason for fallback
- ✅ Review report details
- ✅ Manually assign to institution
- ✅ Track review status

**Table Columns:**
- Report ID
- Title & category
- Location
- Review reason (yellow badge)
- Submission date
- Review status (Pending or Under Review)

**Sample Queue Items:**
- Mixed issue (road + water leak) → conflict
- Unknown facility → no rule match
- Waste in inactive area → institution inactive

**Alert Banner:**
Shows count of pending reviews with warning message

---

### 7. Reports & Monitoring (`/admin/reports`)

**Purpose:**
Platform-wide oversight without replacing institution operations

**Features:**
- ✅ View all platform reports
- ✅ Search by ID or title
- ✅ Monitor across all institutions
- ✅ Track status progression
- ✅ See submission dates

**Table Columns:**
- Report ID (monospace)
- Title & category
- Location
- Assigned institution
- Status badge (colored by status)
- Submission date

**What You Can Do:**
- Monitor platform health
- Identify bottlenecks
- Track resolution times
- Investigate issues
- Generate insights

**What You Cannot Do:**
- Perform institution staff operations (by design)
- Change report status (institution responsibility)
- Directly contact citizens (privacy)

**Sample Reports:**
- Large pothole - Resolved
- Water pipe burst - In Progress
- Uncollected garbage - Under Review

---

### 8. System Settings (`/admin/settings`)

**Current Display:**
- Platform Information (Name, Version, Environment)
- Security Settings (managed backend)
- Notifications (awaiting backend)
- Data Management (infrastructure level)

**Status:**
Configuration interface documented but awaiting backend integration. Shows informational cards explaining where actual settings are managed.

**Future Enhancements:**
- Email notification preferences
- Report attachment constraints
- Session timeout configuration
- Platform-wide announcements
- Maintenance mode toggle

---

### 9. Audit Log (`/admin/audit-log`)

**Purpose:**
Complete, read-only record of administrative actions for accountability and compliance

**Features:**
- ✅ View all administrative actions
- ✅ Search by action or actor
- ✅ See timestamps (date + time)
- ✅ View action descriptions
- ✅ Check success/failure status
- ✅ Read-only (cannot edit history)

**Table Columns:**
- Timestamp (date + time)
- Actor (who performed action)
- Action type (badge)
- Entity type (User, Institution, etc.)
- Description (what happened)
- Result (Success or Failed badge)

**Sample Audit Entries:**
- User role changed
- Institution activated
- Routing rule created
- Category updated
- Report manually routed

**Audit Events Tracked:**
- User creation/updates/deletion
- Role assignments
- Institution changes
- Category modifications
- Routing rule changes
- Manual report routing
- Settings updates
- Failed login attempts (when backend integrated)

---

## 🎨 Design Elements

### Color Coding
- **Primary Actions:** Green (#1a6b3c)
- **Status - Active/Success:** Green
- **Status - Warning:** Yellow/Orange
- **Status - Error/Inactive:** Red/Gray
- **Info/Neutral:** Blue

### Status Badges
- **Reports:**
  - New → Orange
  - Under Review → Blue
  - In Progress → Purple
  - Resolved → Green
  - Rejected → Red

- **Users/Institutions:**
  - Active → Green
  - Inactive → Gray

- **Roles:**
  - Admin → Purple
  - Staff → Blue
  - Citizen → Gray

### Interactive Elements
- **Hover states** on all buttons and links
- **Loading spinners** during async operations
- **Confirmation dialogs** for destructive actions
- **Toast notifications** for success/error feedback
- **Empty states** with helpful messages

---

## 🔐 Security Features

### Authentication
- Separate admin login from institution staff
- Session-based authentication
- Auto-logout after session expires
- Password visibility toggle

### Authorization
- Admin role required for all pages
- Frontend guards redirect to login
- Backend must enforce actual permissions

### Audit Trail
- All actions logged with timestamp
- Actor recorded for accountability
- Immutable audit records
- Comprehensive action descriptions

---

## 📱 Responsive Behavior

**Desktop-First Design:**
- Optimized for 1440×900 and larger
- Collapsible sidebar for screen space
- Horizontal scrolling on tables if needed
- Stacked layout on narrower screens

**Not Mobile-Optimized:**
- Admin interface targets desktop use
- Mobile users should use desktop mode or wait for mobile-optimized version

---

## 💡 Usage Tips

### Keyboard Shortcuts (Future)
- Search inputs are immediately focusable
- Tab navigation works through forms
- Enter submits forms
- Escape closes modals

### Best Practices
1. Always search before creating (avoid duplicates)
2. Deactivate rather than delete (preserve history)
3. Test routing rules before activating
4. Review fallback queue regularly
5. Check audit log for suspicious activity

### Common Workflows

**Adding a New Institution:**
1. Navigate to Institutions
2. Click "Add Institution"
3. Fill required fields
4. Select service areas
5. Save and activate

**Creating a Routing Rule:**
1. Ensure category exists and is active
2. Ensure institution exists and is active
3. Navigate to Routing Rules
4. Click "Add Rule"
5. Select category and institution
6. Define service area
7. Set priority if needed
8. Save and activate

**Resolving Fallback Queue Item:**
1. Navigate to Fallback Review Queue
2. Click on report to review
3. Read reason for fallback
4. Identify correct institution
5. Manually assign report
6. Log reasoning in notes

---

## 🚀 Quick Demo Script

**5-Minute Admin Interface Demo:**

1. **Login** (`/admin/login`)
   - Use: admin@furko.local / admin123

2. **Dashboard** (`/admin`)
   - Show statistics
   - Point out charts
   - Click through quick actions

3. **Users** (`/admin/users`)
   - Search for a user
   - Create test user
   - Show role assignment

4. **Institutions** (`/admin/institutions`)
   - View institutions list
   - Edit an institution
   - Show service areas

5. **Routing Rules** (`/admin/routing-rules`)
   - Explain rule structure
   - Show category mapping

6. **Fallback Queue** (`/admin/fallback-queue`)
   - Explain purpose
   - Show pending items

7. **Audit Log** (`/admin/audit-log`)
   - Show recent actions
   - Explain accountability

8. **Logout**
   - Top right menu
   - Back to login screen

---

**The admin interface is complete, professional, and ready to manage the FURKO platform!** ✨
