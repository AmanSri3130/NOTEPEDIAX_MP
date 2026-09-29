# NotepediaX — Data Model & Database Schemas (MongoDB Atlas)

This document outlines the complete data model for NotepediaX, including indexes, relationships, and DPDP Act 2023 compliance fields.

## Core Schemas

### 1. `users` Collection
- `_id`: ObjectId
- `phone`: String (Indexed, Unique, Primary login for India)
- `email`: String (Indexed, Sparse)
- `name`: String
- `role`: Enum [`student`, `teacher`, `admin`, `content_editor`] (Default: `student`)
- `tenantId`: ObjectId (Optional, for B2B2C School/Coaching multi-tenancy)
- `cohortId`: ObjectId (Optional, for school cohort grouping)
- `targetExam`: String (Indexed, e.g., `JEE_MAIN`, `NEET_UG`, `NDA`, `CBSE_CLASS_12`)
- `languagePreference`: Enum [`hi`, `en`, `ta`, `te`, `mr`, `bn`] (Default: `hi`)
- `isMinor`: Boolean (Calculated if age < 18)
- `parentConsent`: Object
  - `status`: Enum [`pending`, `granted`, `revoked`]
  - `verifiedAt`: Date
  - `parentPhone`: String
- `dpdpConsent`: Object
  - `consentGiven`: Boolean
  - `consentedAt`: Date
  - `version`: String
- `isVerified`: Boolean (Default: `false`)
- `createdAt`, `updatedAt`: Date

**Indexes:**
- `{ phone: 1 }` (Unique)
- `{ email: 1 }` (Sparse, Unique)
- `{ role: 1, targetExam: 1 }`
- `{ tenantId: 1, cohortId: 1 }`

---

### 2. `exams`, `courses`, `subjects`, `chapters`, `lessons`

#### `exams`
- `_id`: ObjectId
- `code`: String (Unique, e.g. `JEE_MAIN`, `NEET_2026`)
- `title`: String
- `category`: Enum [`K12`, `ENGINEERING`, `MEDICAL`, `DEFENCE`, `CIVIL_SERVICES`]
- `isActive`: Boolean

#### `courses`
- `_id`: ObjectId
- `examId`: ObjectId (Ref: `exams`)
- `tenantId`: ObjectId (Optional)
- `title`: String
- `description`: String
- `price`: Number
- `discountPrice`: Number
- `thumbnailUrl`: String
- `isPublished`: Boolean

#### `subjects` $\rightarrow$ `chapters` $\rightarrow$ `lessons`
- **Lessons** include:
  - `type`: Enum [`video`, `pdf`, `quiz`, `text`]
  - `videoUrl`: String (S3 HLS stream path)
  - `durationSeconds`: Number
  - `isFreePreview`: Boolean

---

### 3. `notes` & `note_chunks` (RAG Engine)

#### `notes` (ENote)
- `_id`: ObjectId
- `title`: String
- `subjectId`: ObjectId
- `chapterId`: ObjectId
- `examId`: ObjectId
- `isFree`: Boolean (Default: `false`)
- `fileUrl`: String (S3 PDF path)
- `pageCount`: Number
- `author`: String

#### `note_chunks` (Vector Store Schema)
- `_id`: ObjectId
- `noteId`: ObjectId (Ref: `notes`, Indexed)
- `chapterId`: ObjectId (Indexed)
- `headingPath`: String (e.g. "Chapter 4 > Wave Optics > Huygens Principle")
- `content`: String (Text chunk content)
- `embedding`: Array of Number (1536-dim or 768-dim vector)
- `metadata`:
  - `examCode`: String
  - `subject`: String
  - `language`: String
  - `pageNumber`: Number
  - `startChar`: Number
  - `endChar`: Number

**Indexes:**
- Atlas Vector Index on `embedding` (Cosine Similarity)
- `{ noteId: 1, headingPath: 1 }`

---

### 4. `enrollments` & `orders` (Payments)
- `orders`:
  - `orderId`: String (Unique Razorpay/Cashfree order ID)
  - `userId`: ObjectId (Ref: `users`)
  - `itemType`: Enum [`course`, `note`, `subscription`]
  - `itemId`: ObjectId
  - `amount`: Number
  - `currency`: String (Default: `INR`)
  - `status`: Enum [`created`, `paid`, `failed`, `refunded`]
  - `paymentGateway`: Enum [`razorpay`, `cashfree`]
  - `paymentSignature`: String
  - `idempotencyKey`: String (Unique)

---

### 5. `quizzes`, `attempts`, & `leaderboard_snapshots`
- `attempts`:
  - `userId`: ObjectId (Ref: `users`)
  - `quizId`: ObjectId
  - `score`: Number
  - `maxScore`: Number
  - `accuracyPercentage`: Number
  - `timeSpentSeconds`: Number
  - `weakTopics`: Array of String
  - `attemptedAt`: Date

---

### 6. `tool_usage` (Quota Engine)
- `userId`: ObjectId (Ref: `users`, Indexed)
- `toolId`: String (e.g. `doubt_solver`, `quiz_gen`)
- `dateString`: String (YYYY-MM-DD, Indexed)
- `count`: Number
- `lastUsedAt`: Date

**Indexes:**
- `{ userId: 1, toolId: 1, dateString: 1 }` (Unique compound index)
