# DOCUMENT 5: API SPECIFICATION

**Project:** FURKO — CivicTech Platform  
**Protocol:** REST API over HTTPS  
**Base URL:** `/api/v1`  
**Data Format:** JSON  
**Auth Header:** `Authorization: Bearer <JWT_TOKEN>`  
**Document ID:** FURKO-API-V2.0  

---

## 1. Authentication Endpoints

### 1.1 Register Citizen Account
- **Endpoint:** `POST /api/v1/auth/register`
- **Auth:** Public
- **Request Body:**
```json
{
  "full_name": "Dawit Tadesse",
  "email": "dawit@example.com",
  "password": "StrongPassword123!",
  "phone_number": "+251911234567"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "c4b31a0e-473d-4c31-9f93-0e86b03c8091",
      "full_name": "Dawit Tadesse",
      "email": "dawit@example.com",
      "role": "citizen"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Auth:** Public
- **Request Body:**
```json
{
  "email": "dawit@example.com",
  "password": "StrongPassword123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "c4b31a0e-473d-4c31-9f93-0e86b03c8091",
      "full_name": "Dawit Tadesse",
      "email": "dawit@example.com",
      "role": "citizen",
      "institution_id": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 2. Report Lifecycle Endpoints

### 2.1 Submit Problem Report (Direct Routing Dispatch)
- **Endpoint:** `POST /api/v1/reports`
- **Auth:** Required (`citizen` role)
- **Request Body:**
```json
{
  "category_id": "7b3b9b42-1456-4c28-bb88-3488f7236d22",
  "title": "Severe road pothole causing traffic blockage",
  "description": "Large deep pothole on Main Avenue near Jimma Aba Jifar Palace entrance.",
  "latitude": 7.6734102,
  "longitude": 36.8344151,
  "address_text": "Jimma Aba Jifar Road, Kebele 04",
  "landmark": "Near Aba Jifar Palace gate",
  "photo_url": "https://storage.furko.et/evidence/pothole_01.jpg"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "report_id": "1f8e6c43-9823-4217-91f3-21c613e54b67",
    "tracking_number": "FRK-2026-0814",
    "status": "submitted",
    "verification_status": "pending",
    "routed_institution": {
      "id": "a90184b2-297c-482f-b054-c9f131a403d1",
      "name": "Jimma City Road & Infrastructure Development Bureau"
    },
    "is_fallback": false,
    "submitted_at": "2026-09-24T08:15:30Z"
  }
}
```

### 2.2 Get Citizen Submitted Reports
- **Endpoint:** `GET /api/v1/reports/my`
- **Auth:** Required (`citizen` role)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1f8e6c43-9823-4217-91f3-21c613e54b67",
      "tracking_number": "FRK-2026-0814",
      "title": "Severe road pothole causing traffic blockage",
      "category_name": "Roads & Streets",
      "status": "in_progress",
      "institution_name": "Jimma City Road & Infrastructure Development Bureau",
      "submitted_at": "2026-09-24T08:15:30Z"
    }
  ]
}
```

### 2.3 Get Institution Report Inbox
- **Endpoint:** `GET /api/v1/reports/inbox`
- **Auth:** Required (`staff` or `admin` role)
- **Query Params:** `status=submitted,under_review&page=1&limit=20`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 42,
    "reports": [
      {
        "id": "1f8e6c43-9823-4217-91f3-21c613e54b67",
        "tracking_number": "FRK-2026-0814",
        "title": "Severe road pothole causing traffic blockage",
        "category_name": "Roads & Streets",
        "priority": "high",
        "status": "submitted",
        "latitude": 7.6734102,
        "longitude": 36.8344151,
        "submitted_at": "2026-09-24T08:15:30Z"
      }
    ]
  }
}
```

### 2.4 Update Report Status & Proof of Work
- **Endpoint:** `PUT /api/v1/reports/:id/status`
- **Auth:** Required (`staff` or `admin` role)
- **Request Body:**
```json
{
  "status": "resolved",
  "comment": "Asphalt patch work completed by Road Maintenance Team 2.",
  "resolution_information": "Pothole filled and leveled with hot asphalt mix.",
  "proof_photo_url": "https://storage.furko.et/resolutions/pothole_fixed_01.jpg"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Report status updated to resolved",
  "data": {
    "report_id": "1f8e6c43-9823-4217-91f3-21c613e54b67",
    "status": "resolved",
    "resolved_at": "2026-09-24T10:45:00Z"
  }
}
```

### 2.5 Redirect / Reassign Report
- **Endpoint:** `PUT /api/v1/reports/:id/redirect`
- **Auth:** Required (`staff` or `admin` role)
- **Request Body:**
```json
{
  "target_institution_id": "b11894b3-397c-482f-b054-c9f131a403d2",
  "justification_notes": "Issue relates to water main rupture underneath road surface; transferring to Water & Sewerage Authority."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Report successfully redirected to Water & Sewerage Authority",
  "data": {
    "report_id": "1f8e6c43-9823-4217-91f3-21c613e54b67",
    "current_institution_id": "b11894b3-397c-482f-b054-c9f131a403d2",
    "audit_assignment_id": "58c301d2-0943-41bb-bcf9-54316fa71390"
  }
}
```

### 2.6 Submit Resolution Feedback
- **Endpoint:** `POST /api/v1/reports/:id/feedback`
- **Auth:** Required (`citizen` owner role)
- **Request Body:**
```json
{
  "rating": 5,
  "comment": "Road was repaired promptly and traffic is moving smoothly again. Thank you!"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

---

## 3. Administrative & Configuration Endpoints

- `GET /api/v1/categories` — List active problem categories.
- `POST /api/v1/categories` — Create category (`admin` only).
- `GET /api/v1/institutions` — List active institutions.
- `POST /api/v1/institutions` — Register new institution (`admin` only).
- `GET /api/v1/routing-rules` — List active spatial routing rules (`admin` only).
- `POST /api/v1/routing-rules` — Add category + PostGIS boundary rule (`admin` only).
- `GET /api/v1/admin/analytics/overview` — Platform resolution KPIs & response metrics (`admin` only).

---

## 4. Evidence & Photo Upload Endpoints

### 4.1 Upload Evidence Photo
- **Endpoint:** `POST /api/v1/evidence/upload`
- **Auth:** Public / Authenticated
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `file` or `evidence` or `photo` (File, required, max 10MB; JPG, PNG, WEBP, HEIC)
  - `report_id` (UUID, optional)
  - `file_type` (`evidence` | `resolution_proof`, default `evidence`)
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "att-uuid-001",
    "report_id": "rep-uuid-001",
    "file_name": "evidence-1791918689383-8499d1db.jpg",
    "original_name": "camera-photo.jpg",
    "file_url": "http://localhost:5000/uploads/evidence-1791918689383-8499d1db.jpg",
    "file_type": "evidence",
    "mime_type": "image/jpeg",
    "file_size": 102400,
    "created_at": "2026-10-13T12:00:00Z"
  }
}
```

### 4.2 Upload Evidence for Existing Report
- **Endpoint:** `POST /api/v1/reports/:id/evidence`
- **Auth:** Required
- **Content-Type:** `multipart/form-data`
- **Response (201 Created):** Same format as 4.1 linked to report `:id`.

### 4.3 Get Report Evidence Attachments
- **Endpoint:** `GET /api/v1/reports/:id/evidence`
- **Auth:** Required
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "att-uuid-001",
      "report_id": "rep-uuid-001",
      "file_url": "http://localhost:5000/uploads/pothole.jpg",
      "file_type": "evidence"
    }
  ]
}
```

---

## 5. Rule-Based Routing Engine Endpoints

### 5.1 Preview Routing Decision
- **Endpoint:** `POST /api/v1/routing/preview`
- **Auth:** Public / Authenticated
- **Request Body:**
```json
{
  "category_id": "cat-roads-001",
  "latitude": 7.6734,
  "longitude": 36.8344,
  "address_text": "Jimma Aba Jifar Road, Kebele 04"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "target_institution": {
      "id": "a90184b2-297c-482f-b054-c9f131a403d1",
      "name": "Jimma City Road & Infrastructure Development Bureau",
      "code": "JCRIDB"
    },
    "matched_rule_id": "mem-rule-roads-streets-central",
    "is_fallback": false,
    "routing_reason": "Direct spatial match: Located in Jimma Central District for category \"Roads & Streets\". Dispatched to Jimma City Road & Infrastructure Development Bureau.",
    "jurisdiction_name": "Jimma Central District",
    "confidence": "direct_boundary_match"
  }
}
```

### 5.2 List Pilot Institutions
- **Endpoint:** `GET /api/v1/routing/institutions`
- **Auth:** Public
- **Response (200 OK):** Array of pilot institutions.

### 5.3 List Pilot Problem Categories
- **Endpoint:** `GET /api/v1/routing/categories`
- **Auth:** Public
- **Response (200 OK):** Array of pilot categories with mapping metadata.

---

## 6. Institution Workflow Endpoints

### 6.1 Institution Inbox
- **Endpoint:** `GET /api/v1/institutions/reports`
- **Auth:** Required (`staff` role with active institution assignment)
- **Response (200 OK):** List of reports assigned to staff member's institution.

### 6.2 Review Report
- **Endpoint:** `GET /api/v1/institutions/reports/:id`
- **Auth:** Required (`staff` role)
- **Response (200 OK):** Full report detail including location, category, and citizen metadata.

### 6.3 Transition Report Status
- **Endpoint:** `POST /api/v1/institutions/reports/:id/action`
- **Auth:** Required (`staff` role)
- **Request Body:**
```json
{
  "action": "accept",
  "comment": "Crew assigned to inspect location"
}
```
*(Supported actions: `accept`, `reject`, `redirect`, `start`, `resolve`)*

### 6.4 Assign Report to Staff
- **Endpoint:** `POST /api/v1/institutions/reports/:id/assign`
- **Auth:** Required (`staff` role)
- **Request Body:**
```json
{
  "staff_user_id": "usr-staff-002",
  "comment": "Assigned to asphalt repair field team"
}
```

### 6.5 Workflow Audit History
- **Endpoint:** `GET /api/v1/institutions/reports/:id/history`
- **Auth:** Required (`staff` role)
- **Response (200 OK):** Sequential log of all transitions, assignees, and timestamps.

---

## 7. Report Tracking & Resolution Endpoints

### 7.1 Track Report by Tracking Number (Public)
- **Endpoint:** `GET /api/v1/reports/track/:trackingNumber`
- **Auth:** Public
- **Response (200 OK):** Complete report info, progress timeline, evidence attachments, and resolution proofs.

### 7.2 Get Status Timeline & Resolution Details
- **Endpoint:** `GET /api/v1/reports/:id/timeline` or `GET /api/v1/reports/:id`
- **Auth:** Public / Authenticated
- **Response (200 OK):** Full timeline history array, evidence, resolution proof attachments, and feedback.

### 7.3 Confirm Resolution (Citizen)
- **Endpoint:** `POST /api/v1/reports/:id/confirm`
- **Auth:** Required (`citizen` owner)
- **Request Body:**
```json
{
  "rating": 5,
  "comment": "Pothole filled cleanly, road is safe again. Excellent work!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Resolution successfully confirmed by citizen.",
  "report": {
    "id": "rep-demo-001",
    "status": "resolved",
    "citizen_confirmed": true,
    "citizen_confirmed_at": "2026-10-13T12:00:00Z"
  }
}
```

### 7.4 Reopen Report (Citizen)
- **Endpoint:** `POST /api/v1/reports/:id/reopen` or `PATCH /api/v1/reports/:id/reopen`
- **Auth:** Required (`citizen` owner)
- **Request Body:**
```json
{
  "reason": "The pothole opened up again after heavy rainfall."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Report reopened successfully and returned to under review queue.",
  "report": {
    "id": "rep-demo-001",
    "status": "reopened",
    "reopen_reason": "The pothole opened up again after heavy rainfall.",
    "updated_at": "2026-10-13T12:05:00Z"
  }
}
```

