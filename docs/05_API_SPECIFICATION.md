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
