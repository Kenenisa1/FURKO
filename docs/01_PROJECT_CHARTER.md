# DOCUMENT 1: FURKO PROJECT FOUNDATION & CHARTER

**A Digital Community Problem Reporting and Resolution Platform**  
**Version:** 2.0  
**Project Team:** INSA Summer Camp Students (5 Members)  
**Project Duration:** 2 Months  
**Primary Pilot Focus:** Jimma City, Ethiopia  
**Tagline:** *See it. Report it. Track it. Fix it.*

---

## 1. Project Identification

| Item | Description |
|---|---|
| **Project Name** | FURKO |
| **Project Type** | CivicTech / Multi-Platform Community Problem Reporting and Resolution Platform |
| **Project Team** | INSA Summer Camp Students |
| **Team Size** | 5 Members |
| **Project Duration** | 2 Months |
| **Primary Delivery** | Functional citizen mobile application, web-based institutional/administrative dashboards, shared backend services, and supporting software engineering documentation |
| **Document Version** | 2.0 |

---

## 2. Project Background & Problem Statement

### 2.1 Background
Communities regularly encounter public-service problems such as:
- Damaged roads and open potholes
- Overflowing waste collection points and unmanaged dumpsites
- Water line leaks, pipe bursts, and contaminated supplies
- Streetlight failures and hazardous electrical lines

In Jimma City and across Ethiopia, reporting currently relies on informal, verbal channels: phone calls, in-person visits to municipal desks, personal contacts, or unstructured social media posts.

### 2.2 Problem Statement
- **Fragmented Channels:** Citizens do not know which specific office is responsible for a particular infrastructure fault.
- **Unverifiable Data:** Phone complaints lack visual proof and exact geographic coordinates, leading to wasted institutional dispatch time.
- **Black-Hole Processing:** Citizens receive zero visibility after submitting a complaint. No ticket IDs, no progress updates, and no resolution notices.
- **Institutional Inefficiency:** Public institutions lack a structured inbox to triage, prioritize, allocate, and monitor civic complaints.

---

## 3. Vision & Mission

### Vision
To create a more connected, responsive, and accountable community by enabling citizens and responsible institutions to work together in identifying and resolving community problems.

### Mission
To provide a simple, accessible, and transparent digital platform that enables citizens to report community problems and allows responsible institutions to manage and respond to those problems efficiently.

---

## 4. Key Stakeholders

| Stakeholder / User | Role and Interest |
|---|---|
| **Citizen** | Uses the mobile app to report issues with photo + GPS, track lifecycle, and provide resolution feedback. |
| **Ethiopian Electric Utility (EEU) – Jimma Branch** | Receives and resolves power outage, transformer, and streetlight issues. |
| **Jimma City Water & Sewerage Authority** | Receives and resolves pipe bursts, leakages, and sewerage blockage issues. |
| **Jimma City Sanitation & Waste Management Office** | Receives and resolves uncollected waste and overflowing dumpster issues. |
| **Jimma City Road & Infrastructure Development Bureau** | Receives and resolves road potholes, damaged walkways, and drainage issues. |
| **Administrator** | Manages system users, categories, institutions, routing rules, and platform health. |
| **INSA Summer Camp & Mentors** | Academic, technical oversight, and innovation support. |

---

## 5. Project Scope & Boundaries

### 5.1 In-Scope (MVP)
1. **Citizen Mobile App (React Native/Expo):**
   - Registration and JWT authentication
   - 4 Core Problem Categories (Roads, Water, Waste, Electricity/Lighting)
   - Photo evidence capture via native camera with "Skip" option
   - Automatic GPS coordinates capture with pinned map preview
   - Problem description and review
   - Automated routing dispatch (no citizen institutional selection required)
   - Real-time ticket status tracking and resolution confirmation with feedback
2. **Institution & Admin Web Dashboard (React + Tailwind CSS):**
   - Secure login and RBAC (Institution Staff, Admin)
   - Direct Institutional Report Inbox with triage actions
   - Report acceptance, internal staff assignment, status progression
   - Misallocation reassignment/redirection with mandatory justification notes
   - Resolution proof upload (photo + resolution notes)
   - Admin tools: User management, category management, PostGIS routing rule configuration
3. **Shared Backend & Spatial Database:**
   - Node.js + Express + TypeScript REST API (`/api/v1`)
   - Automated Routing Rule Engine (Category + GPS bounds matching)
   - PostgreSQL + PostGIS database with complete 1-to-many audit trail history
   - File/media storage for evidence and resolution proofs
   - Docker containerization

### 5.2 Out-of-Scope (Deferred Post-MVP)
- Complex predictive AI decision-making or autonomous routing
- Full USSD / SMS gateway integration
- Multi-city national rollout during initial pilot
- Deep legacy ERP government system integrations
- Payment processing or fine assessments

---

## 6. Team Roles & Milestones

### 6.1 Team Allocation (5 Members)
- **Project Coordination & Review:** Team Leader (Kenenisa Mieso & Leads)
- **Requirements Engineering:** Musab Abdulkadir & Team
- **UI/UX Design:** Kenenisa Mieso & Team
- **System Architecture & Database Design:** Abdurahman Zenu & Team
- **Development, Testing & DevOps:** Full Team Collaboration

### 6.2 8-Week Roadmap
- **Weeks 1–2:** Foundation, research, requirements validation, architecture, PostGIS schema design.
- **Weeks 2–3:** UI/UX wireframes & Figma prototypes, backend boilerplate, REST API scaffolding.
- **Weeks 3–4:** Auth (JWT/RBAC), database migrations, core report submission, routing engine.
- **Weeks 4–5:** Citizen mobile app reporting & real-time tracking workflow.
- **Weeks 5–6:** Institution & Admin web dashboards (inbox triage, status, resolution proofs).
- **Weeks 6–7:** End-to-end integration, automated testing, bug fixing, performance audit.
- **Week 8:** Pilot demonstration, documentation freeze, mentor evaluation.
