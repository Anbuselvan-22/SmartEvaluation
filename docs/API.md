# Smart Evaluation API Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All API endpoints (except auth endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All responses follow this format:

```json
{
  "success": true|false,
  "data": {}, // Only present if success is true
  "error": "Error message" // Only present if success is false
}
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "teacher|student"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "teacher"
    }
  }
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "teacher"
    }
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Verify Token
```http
GET /auth/verify
Authorization: Bearer <token>
```

## Teacher Endpoints

### Get Teacher's Students
```http
GET /teacher/students/:teacherId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "student-id",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "student"
    }
  ]
}
```

### Get Teacher Analytics
```http
GET /teacher/analytics/:teacherId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEvaluations": 45,
    "averageScore": 78.5,
    "recentEvaluations": [...],
    "performanceTrend": [...],
    "pendingEvaluations": 3
  }
}
```

### Create Subject
```http
POST /teacher/subjects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mathematics",
  "code": "MATH101",
  "description": "Advanced Mathematics",
  "maxMarks": 100,
  "passMarks": 40
}
```

### Add Student to Subject
```http
POST /teacher/subjects/add-student
Authorization: Bearer <token>
Content-Type: application/json

{
  "subjectId": "subject-id",
  "studentId": "student-id"
}
```

### Get Teacher's Subjects
```http
GET /teacher/subjects
Authorization: Bearer <token>
```

## Student Endpoints

### Get Student Marks
```http
GET /student/marks/:studentId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "mark-id",
      "subject": "Mathematics",
      "marks": 85,
      "feedback": "Good work!",
      "teacherName": "Mr. Smith",
      "date": "2024-01-15",
      "evaluationId": "EVAL_123"
    }
  ]
}
```

### Get Student Performance
```http
GET /student/performance/:studentId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "averageScore": 82.3,
    "totalEvaluations": 12,
    "improvementRate": 5.2,
    "rank": 5,
    "history": [
      {
        "date": "2024-01-15",
        "score": 85,
        "subject": "Mathematics"
      }
    ]
  }
}
```

### Get Feedback
```http
GET /student/feedback/:studentId/:evaluationId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "evaluationId": "EVAL_123",
    "subject": "Mathematics",
    "score": 85,
    "feedback": "Excellent problem-solving skills...",
    "strengths": ["Clear logic", "Good calculations"],
    "weaknesses": ["Need more detail"],
    "teacherName": "Mr. Smith",
    "date": "2024-01-15"
  }
}
```

### Get Student Profile
```http
GET /student/profile
Authorization: Bearer <token>
```

## Evaluation Endpoints

### Upload Answer Sheets
```http
POST /evaluate/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [file1, file2, ...]
subject: "Mathematics"
studentId: "student-id" (optional)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "evaluation-id",
      "evaluationId": "EVAL_123",
      "studentName": "Jane Doe",
      "subject": "Mathematics",
      "score": 85,
      "feedback": "Good work!",
      "strengths": ["Clear logic"],
      "weaknesses": ["More detail needed"],
      "date": "2024-01-15"
    }
  ]
}
```

### Get Evaluation Results
```http
GET /evaluate/results/:studentId
Authorization: Bearer <token>
```

### Assign Evaluation to Student
```http
POST /evaluate/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "evaluationId": "EVAL_123",
  "studentId": "student-id"
}
```

### Delete Evaluation
```http
DELETE /evaluate/:evaluationId
Authorization: Bearer <token>
```

### Get Teacher Evaluations
```http
GET /evaluate/teacher
Authorization: Bearer <token>
```

## AI Services

### OCR Service (Port 8001)
```http
POST http://localhost:8001/ocr/extract
Content-Type: multipart/form-data

image: file
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Extracted text here...",
    "confidence": 0.95,
    "words": [...],
    "lines": [...]
  }
}
```

### Evaluation Service (Port 8002)
```http
POST http://localhost:8002/evaluate
Content-Type: application/json

{
  "text": "Student answer here...",
  "subject": "Mathematics"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "feedback": "Good understanding...",
    "strengths": ["Clear logic"],
    "weaknesses": ["More detail"],
    "analysis": "Detailed analysis..."
  }
}
```

### Feedback Service (Port 8003)
```http
POST http://localhost:8003/feedback
Content-Type: application/json

{
  "text": "Student answer...",
  "score": 85,
  "subject": "Mathematics"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": "Great work...",
    "strengths": ["..."],
    "weaknesses": ["..."],
    "recommendations": ["..."],
    "studyPlan": {...}
  }
}
```

### Analytics Service (Port 8004)
```http
POST http://localhost:8004/analytics/student/:studentId
Content-Type: application/json

{
  "timeRange": "month|quarter|year|all"
}
```

### Study Planner Service (Port 8005)
```http
POST http://localhost:8005/trainer/generate
Content-Type: application/json

{
  "studentProfile": {...},
  "performanceData": {...},
  "goals": ["Goal 1", "Goal 2"]
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Upload Endpoints**: 10 requests per 15 minutes per IP
- **AI Services**: 50 requests per 15 minutes per IP

## File Upload Limits

- **Maximum File Size**: 10MB
- **Supported Formats**: JPEG, PNG, GIF, PDF
- **Maximum Files per Request**: 10

## WebSocket Events (Future Feature)

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:5000');

// Listen for evaluation updates
ws.on('evaluation:completed', (data) => {
  console.log('Evaluation completed:', data);
});

// Listen for real-time analytics
ws.on('analytics:update', (data) => {
  console.log('Analytics updated:', data);
});
```

## SDK Examples

### JavaScript/Node.js
```javascript
const SmartEvalAPI = require('smart-evaluation-sdk');

const client = new SmartEvalAPI({
  baseURL: 'http://localhost:5000/api',
  token: 'your-jwt-token'
});

// Upload and evaluate
const result = await client.evaluate.upload(file, 'Mathematics');
console.log('Score:', result.score);
```

### Python
```python
from smart_evaluation import SmartEvalClient

client = SmartEvalClient(
    base_url='http://localhost:5000/api',
    token='your-jwt-token'
)

# Get student performance
performance = client.student.get_performance(student_id)
print(f"Average Score: {performance['averageScore']}")
```

## Testing

### Postman Collection
Import the provided Postman collection to test all endpoints:

1. Download `smart-evaluation-postman.json`
2. Import into Postman
3. Set environment variables:
   - `base_url`: http://localhost:5000/api
   - `token`: Your JWT token

### cURL Examples
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"password123"}'

# Upload file
curl -X POST http://localhost:5000/api/evaluate/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@answer.jpg" \
  -F "subject=Mathematics"
```

## Changelog

### v1.0.0 (Current)
- Initial release
- Basic CRUD operations
- File upload and evaluation
- Authentication system
- AI integration

### Upcoming Features
- Real-time notifications
- Advanced analytics
- Mobile app support
- Integration with LMS systems
