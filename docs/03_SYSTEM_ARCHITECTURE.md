# DOCUMENT 3: SYSTEM ARCHITECTURE SPECIFICATION

**Project:** FURKO — CivicTech Platform  
**Architecture Style:** Layered Modular Monolith  
**Document ID:** FURKO-ARCH-V2.0  

---

## 1. Architectural Philosophy

FURKO utilizes a **modular monolithic architecture** designed to maximize development velocity, maintainability, and operational simplicity for the 5-member student engineering team during the 2-month development timeline.

Rather than fragmenting business logic across microservices, FURKO centralizes business rules, authentication, and the routing engine inside a single, robust **Node.js / Express / TypeScript** service while strictly decoupling the client applications:
1. **Citizen Mobile Application** (React Native / Expo)
2. **Institution & Admin Web Dashboard** (React / Tailwind CSS / TypeScript)

---

## 2. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|                                                                                   |
|    +-----------------------------+           +-------------------------------+    |
|    |    Citizen Mobile App       |           |   Institution / Admin Web     |    |
|    |    (React Native / Expo)    |           |   (React + Vite + Tailwind)   |    |
|    |  • Camera Photo Evidence    |           |  • Institution Inbox Triage   |    |
|    |  • GPS Geolocation Hook     |           |  • Status & Reassignment UI   |    |
|    |  • Real-Time Ticket Status  |           |  • PostGIS Boundary Config    |    |
|    +--------------+--------------+           +---------------+---------------+    |
+-------------------|------------------------------------------|--------------------+
                    |                                          |
                    | HTTPS / JSON REST API                    | HTTPS / JSON REST API
                    | Bearer JWT                               | Bearer JWT
                    v                                          v
+-----------------------------------------------------------------------------------+
|                              APPLICATION TIER                                     |
|                       (Node.js + Express.js + TypeScript)                         |
|                                                                                   |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  |   Auth Middleware  |  |  Validation Pipes  |  | Direct Service Routing      |  |
|  |  (JWT / RBAC Guard)|  |   (Zod / Joi)      |  | Engine Module (PostGIS)     |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                             Service Layer                                   |  |
|  |  • ReportService     • AssignmentService   • StatusHistoryService           |  |
|  |  • CategoryService   • InstitutionService  • MediaUploadService             |  |
|  +-----------------------------------------------------------------------------+  |
+-------------------|------------------------------------------|--------------------+
                    |                                          |
                    | SQL / PostGIS ST_Contains                | Multipart File /
                    v                                          | Disk Storage Stream
+---------------------------------------------+                v
|                 DATA TIER                   |  +----------------------------------+
|            PostgreSQL + PostGIS             |  |        File / Media Storage      |
|                                             |  |   (Local Static / Cloud Object)  |
|  • Users & Roles (Citizen, Staff, Admin)    |  |                                  |
|  • Reports & PostGIS Geometries             |  |  • /uploads/evidence/            |
|  • Routing Rules (Spatial Polygons)         |  |  • /uploads/resolutions/         |
|  • Immutable Status & Assignment Histories  |  +----------------------------------+
+---------------------------------------------+
```

---

## 3. Direct Service Routing Rule Engine

The core operational differentiator of FURKO is the **Direct Service Routing Rule Engine**.

### 3.1 Routing Workflow
1. Citizen submits a report containing:
   - `category_id` (e.g., Water & Sewerage)
   - `latitude` and `longitude` (e.g., Jimma Town coordinates: `7.6734° N, 36.8344° E`)
2. The Routing Engine queries PostgreSQL with PostGIS:
   ```sql
   SELECT target_institution_id, jurisdiction_name 
   FROM routing_rules
   WHERE category_id = $1 
     AND is_active = TRUE
     AND ST_Contains(location_bounds, ST_SetSRID(ST_Point($2, $3), 4326))
   ORDER BY priority_weight DESC
   LIMIT 1;
   ```
3. **If a match is found:** The report is directly assigned to `target_institution_id`, enters that institution's inbox, and initial status is set to `submitted`.
4. **Fallback Handling (Exception Safeguard):** If no spatial rule matches (e.g. coordinates outside current boundary definitions), the report is assigned to the **Admin Fallback Inbox** (`is_fallback = TRUE`) for manual triage, ensuring zero dropped reports.

---

## 4. Security & Access Control (RBAC)

The application enforces role-based access control across three user classes:

| Capability | Citizen | Institution Staff | Administrator |
|---|---|---|---|
| Register / Login | Yes | Yes (Invited) | Yes |
| Submit New Incident Report | Yes | No | No |
| View Own Incidents & Status | Yes | No | Yes |
| View Institution Inbox | No | Yes (Scoped to own inst.) | Yes (All inst.) |
| Accept / Change Status | No | Yes (Scoped to own inst.) | Yes |
| Reassign / Redirect Report | No | Yes (With reason note) | Yes |
| Upload Resolution Proof | No | Yes | Yes |
| Submit Citizen Feedback | Yes | No | No |
| Manage Categories & Routing Rules | No | No | Yes |
| Manage Users & Roles | No | No | Yes |
