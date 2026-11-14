# FURKO Admin API Contracts

This document defines the expected API endpoints and data structures for the admin frontend.

## Base URL
```
Development: http://localhost:3000
Production: https://api.furko.et
```

## Authentication

All admin endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

Token is obtained from `/api/admin/auth/login` and stored in `localStorage` as `furko_admin_user`.

---

## 1. Admin Authentication

### POST `/api/admin/auth/login`
Login admin user

**Request:**
```json
{
  "email": "admin@furko.local",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "id": "admin-001",
  "name": "System Administrator",
  "email": "admin@furko.local",
  "role": "system_admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "avatar": "https://example.com/avatar.jpg",
  "permissions": ["all"],
  "lastLogin": "2024-10-13T10:30:00Z"
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### POST `/api/admin/auth/logout`
Logout admin user

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### GET `/api/admin/auth/verify`
Verify admin token validity

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "admin-001",
    "email": "admin@furko.local"
  }
}
```

---

## 2. Users Management

### GET `/api/admin/users`
Get all users with optional filtering

**Query Parameters:**
- `role` (optional): Filter by role (system_admin, institution_admin, staff)
- `status` (optional): Filter by status (active, inactive)
- `institution` (optional): Filter by institution ID
- `search` (optional): Search by name or email
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "users": [
    {
      "id": "user-001",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "institution_admin",
      "institution": {
        "id": "inst-001",
        "name": "Jimma City Administration"
      },
      "status": "active",
      "lastLogin": "2024-10-13T10:30:00Z",
      "createdAt": "2024-01-15T08:00:00Z"
    }
  ],
  "pagination": {
    "total": 125,
    "page": 1,
    "limit": 10,
    "totalPages": 13
  }
}
```

---

### POST `/api/admin/users`
Create a new user

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword",
  "role": "institution_admin",
  "institutionId": "inst-001",
  "phone": "+251-91-234-5678"
}
```

**Response (201):**
```json
{
  "id": "user-125",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "institution_admin",
  "institution": {
    "id": "inst-001",
    "name": "Jimma City Administration"
  },
  "status": "active",
  "createdAt": "2024-10-13T11:00:00Z"
}
```

**Error (400):**
```json
{
  "error": "Email already exists"
}
```

---

### GET `/api/admin/users/:id`
Get user by ID

**Response (200):**
```json
{
  "id": "user-001",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "institution_admin",
  "institutionId": "inst-001",
  "phone": "+251-91-234-5678",
  "status": "active",
  "lastLogin": "2024-10-13T10:30:00Z",
  "createdAt": "2024-01-15T08:00:00Z"
}
```

---

### PUT `/api/admin/users/:id`
Update user

**Request:**
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "role": "staff",
  "phone": "+251-91-999-9999"
}
```

**Response (200):**
```json
{
  "id": "user-001",
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "role": "staff",
  "updatedAt": "2024-10-13T12:00:00Z"
}
```

---

### DELETE `/api/admin/users/:id`
Delete user

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## 3. Institutions Management

### GET `/api/admin/institutions`
Get all institutions

**Query Parameters:**
- `status` (optional): active, inactive, pending
- `type` (optional): municipality, health, transport, etc.
- `search` (optional): Search by name
- `page`, `limit`: Pagination

**Response (200):**
```json
{
  "institutions": [
    {
      "id": "inst-001",
      "name": "Jimma City Administration",
      "type": "municipality",
      "email": "info@jimmacity.gov.et",
      "phone": "+251-47-111-2233",
      "address": "Jimma, Oromia, Ethiopia",
      "logo": "https://example.com/logos/jimma.png",
      "status": "active",
      "serviceAreas": ["area-001", "area-002"],
      "categories": ["cat-001", "cat-003"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### POST `/api/admin/institutions`
Create institution

**Request:**
```json
{
  "name": "Agaro Town Administration",
  "type": "municipality",
  "email": "info@agaro.gov.et",
  "phone": "+251-47-222-3344",
  "address": "Agaro, Oromia, Ethiopia",
  "serviceAreaIds": ["area-010"],
  "categoryIds": ["cat-001", "cat-002"]
}
```

**Response (201):**
```json
{
  "id": "inst-019",
  "name": "Agaro Town Administration",
  "type": "municipality",
  "status": "active",
  "createdAt": "2024-10-13T12:00:00Z"
}
```

---

## 4. Categories Management

### GET `/api/admin/categories`
Get all categories

**Response (200):**
```json
{
  "categories": [
    {
      "id": "cat-001",
      "name": "Water Issues",
      "nameAm": "የውሃ ችግሮች",
      "description": "Water supply, quality, and sanitation issues",
      "icon": "droplet",
      "color": "#3b82f6",
      "priority": 1,
      "active": true,
      "reportCount": 342
    }
  ]
}
```

---

### POST `/api/admin/categories`
Create category

**Request:**
```json
{
  "name": "Street Lighting",
  "nameAm": "የመብራት ችግር",
  "description": "Street light maintenance and outages",
  "icon": "lightbulb",
  "color": "#f59e0b",
  "priority": 8
}
```

**Response (201):**
```json
{
  "id": "cat-013",
  "name": "Street Lighting",
  "active": true,
  "createdAt": "2024-10-13T12:00:00Z"
}
```

---

## 5. Service Areas Management

### GET `/api/admin/service-areas`
Get all service areas

**Response (200):**
```json
{
  "serviceAreas": [
    {
      "id": "area-001",
      "name": "Jimma Zone",
      "type": "zone",
      "parentId": null,
      "boundary": {
        "type": "Polygon",
        "coordinates": [[[37.0, 7.0], [37.5, 7.0], [37.5, 7.5], [37.0, 7.5], [37.0, 7.0]]]
      },
      "population": 500000,
      "institutions": ["inst-001", "inst-002"]
    }
  ]
}
```

---

### POST `/api/admin/service-areas`
Create service area

**Request:**
```json
{
  "name": "Kebele 01",
  "type": "kebele",
  "parentId": "area-005",
  "boundary": { /* GeoJSON */ },
  "population": 5000,
  "institutionIds": ["inst-001"]
}
```

---

## 6. Routing Rules Management

### GET `/api/admin/routing-rules`
Get all routing rules

**Response (200):**
```json
{
  "rules": [
    {
      "id": "rule-001",
      "name": "Water issues in Jimma Zone",
      "priority": 10,
      "categoryId": "cat-001",
      "serviceAreaId": "area-001",
      "institutionId": "inst-002",
      "active": true,
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

---

### POST `/api/admin/routing-rules`
Create routing rule

**Request:**
```json
{
  "name": "Road issues in Agaro",
  "priority": 8,
  "categoryId": "cat-002",
  "serviceAreaId": "area-010",
  "institutionId": "inst-019"
}
```

---

## 7. Fallback Queue Management

### GET `/api/admin/fallback-queue`
Get unrouted reports in fallback queue

**Query Parameters:**
- `status`: pending, assigned, rejected
- `category`, `serviceArea`: Filter options

**Response (200):**
```json
{
  "reports": [
    {
      "id": "report-500",
      "title": "Broken water pipe",
      "category": {
        "id": "cat-001",
        "name": "Water Issues"
      },
      "serviceArea": {
        "id": "area-001",
        "name": "Jimma Zone"
      },
      "location": {
        "latitude": 7.6697,
        "longitude": 36.8342,
        "address": "Near Jimma University"
      },
      "submittedBy": {
        "name": "Citizen Name",
        "phone": "+251-91-xxx-xxxx"
      },
      "submittedAt": "2024-10-13T09:00:00Z",
      "reviewStatus": "pending"
    }
  ],
  "pagination": { ... }
}
```

---

### POST `/api/admin/fallback-queue/:reportId/assign`
Manually assign report to institution

**Request:**
```json
{
  "institutionId": "inst-001",
  "notes": "Manually assigned due to location ambiguity"
}
```

**Response (200):**
```json
{
  "reportId": "report-500",
  "institutionId": "inst-001",
  "assignedAt": "2024-10-13T13:00:00Z",
  "assignedBy": "admin-001"
}
```

---

## 8. Reports & Monitoring

### GET `/api/admin/reports/statistics`
Get system-wide report statistics

**Query Parameters:**
- `startDate`, `endDate`: Date range
- `institutionId`: Filter by institution
- `categoryId`: Filter by category

**Response (200):**
```json
{
  "totalReports": 3420,
  "pendingReports": 342,
  "resolvedReports": 2985,
  "overdueReports": 93,
  "avgResolutionTime": 72,
  "resolutionRate": 87.3,
  "byCategory": [
    {
      "categoryId": "cat-001",
      "categoryName": "Water Issues",
      "count": 850
    }
  ],
  "byInstitution": [
    {
      "institutionId": "inst-001",
      "institutionName": "Jimma City Admin",
      "assigned": 1200,
      "resolved": 1050,
      "resolutionRate": 87.5
    }
  ],
  "trends": [
    {
      "date": "2024-10-01",
      "total": 45,
      "resolved": 38
    }
  ]
}
```

---

## 9. System Settings

### GET `/api/admin/settings`
Get system settings

**Response (200):**
```json
{
  "general": {
    "systemName": "FURKO - Jimma City",
    "contactEmail": "support@furko.et",
    "supportPhone": "+251-47-xxx-xxxx",
    "timezone": "Africa/Addis_Ababa",
    "language": "en"
  },
  "email": {
    "smtpHost": "smtp.example.com",
    "smtpPort": 587,
    "smtpUser": "noreply@furko.et",
    "notificationsEnabled": true
  },
  "security": {
    "sessionTimeout": 3600,
    "passwordMinLength": 8,
    "twoFactorEnabled": false
  }
}
```

---

### PUT `/api/admin/settings`
Update system settings

**Request:**
```json
{
  "general": {
    "systemName": "FURKO - Updated"
  }
}
```

---

## 10. Audit Log

### GET `/api/admin/audit-log`
Get audit log entries

**Query Parameters:**
- `eventType`: login, logout, user_create, user_update, etc.
- `userId`: Filter by user
- `startDate`, `endDate`: Date range
- `result`: success, failure
- `search`: Full-text search
- `page`, `limit`: Pagination

**Response (200):**
```json
{
  "logs": [
    {
      "id": "log-5000",
      "timestamp": "2024-10-13T13:00:00Z",
      "eventType": "user_create",
      "userId": "admin-001",
      "userName": "System Admin",
      "ipAddress": "192.168.1.100",
      "description": "Created user: jane@example.com",
      "result": "success",
      "metadata": {
        "targetUserId": "user-125",
        "targetUserEmail": "jane@example.com"
      }
    }
  ],
  "pagination": { ... }
}
```

---

## 11. Admin Profile

### GET `/api/admin/profile`
Get current admin profile

**Response (200):**
```json
{
  "id": "admin-001",
  "name": "System Administrator",
  "email": "admin@furko.local",
  "phone": "+251-91-xxx-xxxx",
  "avatar": "https://example.com/avatar.jpg",
  "role": "system_admin",
  "lastLogin": "2024-10-13T10:30:00Z",
  "preferences": {
    "emailNotifications": true,
    "language": "en",
    "timezone": "Africa/Addis_Ababa"
  }
}
```

---

### PUT `/api/admin/profile`
Update admin profile

**Request:**
```json
{
  "name": "System Admin Updated",
  "phone": "+251-91-999-9999",
  "preferences": {
    "emailNotifications": false
  }
}
```

---

### PUT `/api/admin/profile/password`
Change admin password

**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newsecurepassword"
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

---

## Error Responses

All endpoints may return these standard error responses:

**400 Bad Request:**
```json
{
  "error": "Validation error",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Data Types

### User Roles
- `system_admin`: Full system access
- `institution_admin`: Institution-scoped access
- `staff`: Limited operational access

### Institution Types
- `municipality`: City/town administration
- `health`: Health department
- `transport`: Transport authority
- `water`: Water & sanitation
- `roads`: Road maintenance
- `environment`: Environmental protection
- `education`: Education department
- `safety`: Public safety
- `utilities`: Utilities
- `other`: Other government agencies

### Service Area Types
- `zone`: Administrative zone
- `woreda`: Woreda/district
- `kebele`: Kebele/neighborhood

### Report Statuses
- `pending`: Awaiting assignment
- `assigned`: Assigned to institution
- `in_progress`: Being worked on
- `resolved`: Resolved by institution
- `rejected`: Rejected/invalid
- `closed`: Closed without action

---

## Notes for Backend Team

1. **All dates in ISO 8601 format** (e.g., `2024-10-13T10:30:00Z`)
2. **Pagination** uses `page` (1-indexed) and `limit` parameters
3. **Authentication** via JWT Bearer tokens
4. **CORS** must allow admin frontend origin
5. **File uploads** (logos, avatars) use multipart/form-data
6. **Validation errors** return 400 with detailed field errors
7. **Soft deletes** preferred over hard deletes for audit trail
8. **Rate limiting** recommended on authentication endpoints
9. **GeoJSON** format for service area boundaries (RFC 7946)
10. **Batch operations** needed for bulk user imports (future)

---

## Environment Variables

Frontend expects these:
```
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=FURKO
VITE_ENABLE_MOCK_DATA=true (development only)
```

Backend should provide:
```
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
SMTP_HOST=...
```
