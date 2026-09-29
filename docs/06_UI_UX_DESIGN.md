# DOCUMENT 6: UI/UX DESIGN SPECIFICATION & GUIDELINES

**Project:** FURKO — CivicTech Platform  
**Design Direction:** Mobile-first for Citizens, Desktop Web-first for Institutional/Admin Staff  
**Document ID:** FURKO-UIUX-V2.0  

---

## 1. Design Principles

1. **Simplicity Over Bureaucracy:** Citizens should never need to navigate organizational hierarchies. The interface only asks *what* is broken, *where* it is, and for *photo proof*.
2. **Mobile-First Accessibility:** The citizen mobile app is optimized for rapid touch interaction, single-handed operation, low-bandwidth conditions, and native camera/GPS hardware.
3. **High-Efficiency Triage:** The institutional web dashboard is optimized for dense data tables, rapid keyboard shortcuts, quick filter toggles, and clear visual audit logs.
4. **Transparent Accountability:** Every status change shows exact timestamps, responsible institution names, and proof-of-work visual evidence.

---

## 2. Citizen Mobile UI (React Native / Expo)

### 2.1 Screen Architecture
```
[Auth / Splash] ──> [Home / Active Reports Feed]
                          │
                          ├──> [5-Step Incident Reporting Wizard]
                          │       ├── Step 1: Category Picker (Visual Grid)
                          │       ├── Step 2: Photo Capture (Camera + Gallery + Skip)
                          │       ├── Step 3: Location (Auto GPS + Pin Preview)
                          │       ├── Step 4: Description (Text + Voice/Notes)
                          │       └── Step 5: Summary & Direct Submission
                          │
                          └──> [Report Detail & Live Timeline Tracker]
                                  ├── Ticket Header & Current Status Badge
                                  ├── Responsible Institution Card
                                  ├── Visual Audit History Progress Bar
                                  └── Resolution Proof & 5-Star Feedback Modal
```

### 2.2 5-Step Reporting UX Flow
1. **Category Selection:** 4 high-contrast cards:
   - 🚧 **Roads & Streets** (potholes, sidewalks, traffic signs)
   - 💧 **Water & Sewerage** (pipe leaks, drainage, contaminated supply)
   - 🗑️ **Waste Management** (overflowing trash, illegal dumps)
   - 💡 **Street Lighting** (dark intersections, broken poles)
2. **Photo Capture:** Native camera preview with clear shutter button, gallery picker, and a non-punitive **"Skip (Low Light/Hazard)"** button.
3. **GPS Auto-Detection:** Automatically invokes device GPS upon permission (`expo-location`), calculates accuracy radius, and renders an interactive OpenStreetMap Leaflet pin preview.
4. **Description:** Clean multiline input with character counter and optional landmark hint (e.g., "Opposite Aba Jifar Palace").
5. **Review & Direct Submit:** Shows category, photo thumbnail, address snippet, and anticipated routing institution. Single-tap submit emits `POST /api/v1/reports`.

---

## 3. Institution & Admin Web Dashboard (React + Tailwind)

### 3.1 Primary Operational Views
1. **Institution Inbox (`/inbox`):**
   - KPI counters: `New Reports`, `In Review`, `In Progress`, `Resolved This Week`.
   - Data Table: Tracking Number, Category Badge, Priority Tag, Time Elapsed, Location, Action menu.
   - Batch filters: Category, Status, Severity, Date Range.
2. **Incident Triage Modal (`/reports/:id`):**
   - Left Pane: Citizen photo evidence, full description, interactive Leaflet map pin.
   - Right Pane: Direct routing breakdown, institution jurisdiction, and action toolbar:
     - 🟢 **Accept Ticket** (Sets to `in_progress`)
     - 🔄 **Redirect / Transfer** (Requires target institution dropdown & justification reason)
     - 🔴 **Reject Report** (Requires standardized reason: Duplicate, Out of Bounds, Insufficient Proof)
     - 🏁 **Submit Resolution** (Requires resolution notes + proof-of-work photo upload)
3. **Immutable Audit History Timeline:**
   - Displays every status progression, staff re-assignment, and timestamp in reverse chronological order.
4. **Admin Spatial Boundary Manager (`/admin/routing-rules`):**
   - Map polygon drawer allowing administrators to draw and update PostGIS boundary zones linked to specific institutions.
