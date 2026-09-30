# DOCUMENT 2: SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

**Project:** FURKO — Digital Community Problem Reporting & Resolution Platform  
**Target Environment:** Jimma City, Ethiopia  
**Document ID:** FURKO-SRS-V2.0  

---

## 1. Functional Requirements Matrix

| ID | Requirement Name | Actor | Requirement Statement | Priority |
|---|---|---|---|---|
| **FR-001** | Report Submission | Citizen | The system shall allow an authenticated citizen to submit a community problem report. | Must |
| **FR-002** | Problem Category | Citizen | The system shall allow the citizen to select a problem category from configured options (Roads, Water, Waste, Lighting). | Must |
| **FR-003** | Problem Description | Citizen | The system shall require the citizen to provide a clear textual description of the reported issue. | Must |
| **FR-004** | Photographic Evidence | Citizen | The system shall allow the citizen to attach photo evidence via native camera or gallery, with a "Skip" option. | Should |
| **FR-005** | Problem Location | Citizen | The system shall automatically capture device GPS coordinates upon permission, with map preview verification. | Must |
| **FR-006** | Report Confirmation | Citizen | The system shall return a unique human-readable tracking number (e.g., `FRK-2026-0814`) upon submission. | Must |
| **FR-007** | Report Review | Institution Staff | The system shall allow authorized institution staff to view and triage reports routed to their institution inbox. | Must |
| **FR-008** | Report Validation | Institution Staff | The system shall allow staff to verify and accept incoming reports into the active work queue. | Must |
| **FR-009** | Invalid Report Handling | Institution Staff | The system shall allow staff to reject a report by selecting a reason (Duplicate, Out of Jurisdiction, Insufficient Data). | Must |
| **FR-010** | Priority Handling | Institution Staff | The system shall allow staff to assign or update report priority (Low, Medium, High, Emergency). | Should |
| **FR-011** | Direct Service Routing | Automated Engine | The system shall evaluate Category + GPS location against PostGIS spatial rules and dispatch the report directly to the target institution inbox. | Must |
| **FR-012** | Institution Receipt | Institution Staff | The system shall display incoming reports in the institution's dedicated web dashboard inbox. | Must |
| **FR-013** | Status Update | Institution Staff | The system shall allow authorized staff to update report lifecycle status (`Submitted`, `Under Review`, `In Progress`, `Resolved`, `Rejected`). | Must |
| **FR-014** | Resolution Information | Institution Staff | The system shall require resolution notes and allow resolution proof photos when marking an issue as `Resolved`. | Must |
| **FR-015** | Citizen Tracking | Citizen | The system shall allow citizens to view real-time status progression, timestamps, and notes on their submitted reports. | Must |
| **FR-016** | Status & Assignment History | System | The system shall maintain an immutable, chronological 1-to-many audit trail of all status and assignment changes. | Must |
| **FR-017** | Authentication | All Users | The system shall enforce JWT-based authentication for protected operations. | Must |
| **FR-018** | Role Authorization (RBAC) | All Users | The system shall enforce strict RBAC across `Citizen`, `Institution Staff`, and `Administrator` roles. | Must |
| **FR-019** | User Management | Administrator | The system shall allow administrators to view, activate, deactivate, and assign roles to platform accounts. | Should |
| **FR-020** | Category Management | Administrator | The system shall allow administrators to create, edit, activate, or deactivate problem categories. | Should |
| **FR-021** | Routing Rule Management | Administrator | The system shall allow administrators to configure category mappings, institution targets, and PostGIS boundary geometries. | Should |
| **FR-022** | Report Monitoring & Analytics | Administrator | The system shall provide platform-level oversight of submission volumes, response times, and resolution rates. | Should |
| **FR-023** | Resolution Feedback | Citizen | The system shall allow citizens to submit a 1–5 star rating and comment on resolved reports. | Could |
| **FR-024** | Notifications | Citizen / Staff | The system should deliver status update alerts to citizens when their ticket progresses. | Could |
| **FR-025** | Search & Filtering | Staff / Admin | The system shall allow searching by tracking number, keyword, location, date, and status. | Could |
| **FR-026** | Assisted Suggestions | Citizen / Staff | The system may provide assistive classification suggestions without replacing human authority. | Could |

---

## 2. Non-Functional Requirements (NFRs)

- **NFR-001 (Performance):** REST API endpoints must respond within `< 300ms` under typical pilot loads.
- **NFR-002 (Responsive UI):** Citizen client optimized for mobile form factors (iOS & Android via Expo); Web dashboard optimized for modern desktop browsers (`>= 1280px`).
- **NFR-003 (Usability):** Citizens with basic smartphone literacy should be able to submit a complete report in under 90 seconds.
- **NFR-004 (Data Integrity):** Foreign key constraints, unique tracking numbers, and transactional safety on status history.
- **NFR-005 (Security):** Passwords hashed using bcrypt (cost factor >= 10); JWT tokens signed with secure secrets; input sanitization on all endpoints.
- **NFR-006 (Spatial Accuracy):** PostGIS coordinate system standard `SRID 4326` (WGS 84) used for all spatial calculations.
- **NFR-007 (Auditability):** Every status transition and institutional redirection must record the acting `user_id`, timestamp, and justification note.

---

## 3. Core Business Rules

- **BR-001:** Citizens do not select the responsible institution. Selection is based purely on Category + Location processed by the Direct Service Routing Engine.
- **BR-002:** A report cannot be marked `Resolved` without mandatory resolution text and optional proof-of-work photo evidence.
- **BR-003:** A report cannot be marked `Rejected` without selecting a standardized reason code and providing an explanatory note.
- **BR-004:** Redirection from Institution A to Institution B requires explicit justification notes and creates an immutable assignment audit record.
- **BR-005:** Only the citizen who submitted the original report can submit satisfaction feedback upon resolution.
- **BR-006:** In the event that no PostGIS routing rule matches a report's coordinates, the report is dispatched to the **Fallback Administration Queue** (no dropped tickets).
