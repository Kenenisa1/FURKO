# FURKO — CivicTech Community Problem Reporting & Resolution Platform

> **"See it. Report it. Track it. Fix it."**  
> *Civic problem reporting, automated institutional dispatch, transparent tracking, and verifiable resolution.*

---

## 📌 Project Overview

**FURKO** is a multi-platform civic technology system designed to transform fragmented, phone-based community problem reporting into a structured, transparent, and verifiable civic resolution pipeline. Piloted in **Jimma City, Ethiopia**, FURKO bridges citizens and municipal service providers (electricity, water/sewerage, sanitation/waste, road infrastructure).

### Core Philosophy
**Citizens report. Institutions act. The platform provides transparency.**

Citizens do **not** need to understand internal government bureaucratic structures or manually guess which department handles their problem. Instead, citizens report using intuitive categories, photo evidence, and automatic GPS capture. FURKO’s **Direct Service Routing Rule Engine** evaluates problem categories and geographic boundaries to dispatch tickets directly into the designated institution's operational inbox.

---

## 👥 Project Team & Stakeholders

- **Project:** INSA Summer Camp Students
- **Team Size:** 5 Members
- **Duration:** 2 Months
- **Pilot Location:** Jimma City, Ethiopia

### Participating Pilot Institutions
1. **Ethiopian Electric Utility (EEU)** – Jimma Branch
2. **Jimma City Water & Sewerage Authority**
3. **Jimma City Sanitation & Waste Management Office**
4. **Jimma City Road & Infrastructure Development Bureau**

---

## 🏗 System Architecture

FURKO is built as a modular layered monolith with clean client-side separation:

```
                      ┌─────────────────────────────────────────┐
                      │          Citizen Mobile Client          │
                      │           React Native (Expo)           │
                      └────────────────────┬────────────────────┘
                                           │ HTTPS (REST API)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                FURKO Unified Backend                                   │
│                            (Node.js + Express + TypeScript)                            │
│  ┌────────────────────┐   ┌───────────────────────────────┐   ┌─────────────────────┐  │
│  │   Auth & RBAC      │   │  Direct Service Routing Engine│   │ Ticket & Audit Log  │  │
│  │ (Citizen/Staff/Adm)│   │  (Category + PostGIS Bounds)  │   │ Lifecycle Manager   │  │
│  └────────────────────┘   └───────────────────────────────┘   └─────────────────────┘  │
└───────────────────┬─────────────────────────────────────────────────┬──────────────────┘
                    │                                                 │
                    ▼                                                 ▼
┌─────────────────────────────────────────┐         ┌────────────────────────────────────┐
│         PostgreSQL + PostGIS            │         │        File / Media Storage        │
│   (Relational Data & Spatial Indexing)  │         │   (Evidence & Proof of Work)       │
└─────────────────────────────────────────┘         └────────────────────────────────────┘
                    ▲
                    │ REST API
┌───────────────────┴─────────────────────┐
│    Institution & Admin Web Dashboard    │
│    (React + TypeScript + Tailwind CSS)  │
└─────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```
furko/
├── docs/                                  # Complete Project Documentation & Engineering Specs
│   ├── 01_PROJECT_CHARTER.md              # Vision, scope, stakeholders, roadmap
│   ├── 02_REQUIREMENTS_SPECIFICATION.md   # SRS, FR-001 to FR-026, NFRs, Business Rules
│   ├── 03_SYSTEM_ARCHITECTURE.md          # Modular architecture, routing engine, workflows
│   ├── 04_DATABASE_DESIGN.md              # PostgreSQL + PostGIS schema, relational design
│   ├── 05_API_SPECIFICATION.md            # REST API endpoints (/api/v1) & schemas
│   └── 06_UI_UX_DESIGN.md                 # Mobile citizen journey & Web dashboard UX
├── backend/                               # Unified Node.js / Express / TypeScript REST API
├── web/                                   # Institution & Admin Web Dashboard (React + Tailwind)
├── mobile/                                # Citizen Mobile Application (React Native + Expo)
└── docker-compose.yml                     # Local development environment (Postgres/PostGIS, etc.)
```

---

## 🚦 Report Lifecycle

1. **Submitted**: Incident logged with photo, category, and GPS.
2. **Under Review**: Routed directly to responsible institution inbox for triage.
3. **In Progress**: Accepted and assigned to operational staff / maintenance crew.
4. **Resolved**: Maintenance complete with mandatory proof-of-work photo attachment.
5. **Closed**: Confirmed by citizen or archived after satisfaction feedback.
*Alternative paths:* **Redirected** (reassigned with required justification) or **Rejected** (with documented reason).

---

## 🛠 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Citizen Mobile App** | React Native (Expo) | Cross-platform citizen reporting (Camera + GPS) |
| **Institution / Admin Web** | React, TypeScript, Tailwind CSS | High-efficiency desktop inbox triage & analytics |
| **Backend API** | Node.js, Express.js, TypeScript | REST API (`/api/v1`), RBAC & Routing Engine |
| **Database** | PostgreSQL + PostGIS | Geospatial boundary queries & relational data |
| **Media Storage** | Local / S3-compatible Object Storage | Secure photo evidence & resolution proofs |
| **Containerization** | Docker & Docker Compose | Uniform local development and test environment |
