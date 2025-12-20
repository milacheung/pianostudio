# Assignment CRUD API Implementation

## Overview
Complete backend implementation of the Assignment CRUD API for PianoStudio. This includes all necessary layers: DTOs, exceptions, repositories, services, and controllers.

## Files Created

### DTOs (Data Transfer Objects)
1. **AssignmentRequest.java** - `/backend/src/main/java/com/pianostudio/dto/`
   - Fields: title, description, goalMinutes, dueDate, pointsValue, attachments
   - Includes Jakarta validation annotations (@NotBlank, @NotNull, @Positive)

2. **AssignmentResponse.java** - `/backend/src/main/java/com/pianostudio/dto/`
   - Returns assignment data with optional student progress
   - Static factory method: `fromEntity(Assignment, StudentAssignment)`
   - Includes studioId, studioName, and student-specific fields

3. **UpdateProgressRequest.java** - `/backend/src/main/java/com/pianostudio/dto/`
   - Single field: progressMinutes (validated as @PositiveOrZero)

4. **StudentAssignmentResponse.java** - `/backend/src/main/java/com/pianostudio/dto/`
   - Complete assignment details with student progress
   - Calculated fields: progressPercentage, isOverdue
   - Factory method: `fromEntity(StudentAssignment)`

### Exceptions
5. **AssignmentNotFoundException.java** - `/backend/src/main/java/com/pianostudio/exception/`
   - Custom exception for assignment not found scenarios
   - Handler added to GlobalExceptionHandler.java (returns 404)

### Services
6. **AssignmentService.java** - `/backend/src/main/java/com/pianostudio/service/`
   - Business logic layer with 7 public methods
   - Handles assignment CRUD operations
   - Manages student progress tracking
   - Awards points automatically when assignments are completed
   - Includes authorization checks

### Controllers
7. **AssignmentController.java** - `/backend/src/main/java/com/pianostudio/controller/`
   - REST API endpoints with proper security annotations
   - 7 endpoints (detailed below)

## API Endpoints

### 1. Create Assignment (Teacher Only)
```
POST /api/assignments?studioId={studioId}
Authorization: Teacher role required
Body: AssignmentRequest
Response: 201 Created with AssignmentResponse
```

### 2. Get All Assignments for Studio
```
GET /api/assignments?studioId={studioId}
Authorization: Teacher or Student in studio
Response: 200 OK with List<AssignmentResponse>
Note: Students see their progress, teachers see all assignments
```

### 3. Get Single Assignment
```
GET /api/assignments/{id}
Authorization: User must belong to assignment's studio
Response: 200 OK with AssignmentResponse
```

### 4. Get My Assignments (Student Only)
```
GET /api/assignments/my-assignments
Authorization: Student role required
Response: 200 OK with List<StudentAssignmentResponse>
Note: Returns active assignments (incomplete or completed within last 7 days)
```

### 5. Update Assignment (Teacher Only)
```
PUT /api/assignments/{id}
Authorization: Teacher who owns the studio
Body: AssignmentRequest
Response: 200 OK with AssignmentResponse
```

### 6. Delete Assignment (Teacher Only)
```
DELETE /api/assignments/{id}
Authorization: Teacher who owns the studio
Response: 204 No Content
```

### 7. Update Student Progress
```
PUT /api/assignments/{id}/progress
Authorization: Student role required
Body: UpdateProgressRequest
Response: 200 OK with StudentAssignmentResponse
```

## Service Layer Features

### AssignmentService Methods

1. **createAssignment(Long studioId, AssignmentRequest request, User teacher)**
   - Validates teacher owns the studio
   - Creates assignment
   - Automatically creates StudentAssignment records for all existing students
   - Returns AssignmentResponse

2. **updateAssignment(Long assignmentId, AssignmentRequest request, User teacher)**
   - Validates ownership
   - Updates all assignment fields
   - Returns updated AssignmentResponse

3. **deleteAssignment(Long assignmentId, User teacher)**
   - Validates ownership
   - Cascade deletes StudentAssignment records (via JPA)
   - Returns void

4. **getAssignmentsForStudio(Long studioId, User user)**
   - Validates studio access
   - For students: includes their progress on each assignment
   - For teachers: returns assignments without student-specific data
   - Returns List<AssignmentResponse>

5. **getAssignment(Long assignmentId, User user)**
   - Validates access to assignment's studio
   - Includes student progress if user is a student
   - Returns AssignmentResponse

6. **getActiveAssignmentsForStudent(Long studentId)**
   - Returns incomplete assignments
   - Also includes recently completed assignments (last 7 days)
   - Returns List<StudentAssignmentResponse>

7. **updateStudentProgress(Long assignmentId, Integer progressMinutes, User student)**
   - Updates progress minutes
   - Auto-completes assignment when goal is reached
   - Awards points to student profile when completed
   - Creates StudentAssignment if doesn't exist (e.g., student joined after assignment was created)
   - Returns StudentAssignmentResponse

## Security Implementation

### Authorization Rules
- **Create, Update, Delete**: Only teachers can modify assignments in their own studio
- **View Assignments**: Students and teachers can view assignments in their studio
- **Update Progress**: Only students can update their own progress

### Validation
- All request DTOs include Jakarta validation annotations
- Service layer includes authorization checks
- Verifies studio ownership before modifications
- Validates user access to studio resources

## Database Integration

### Existing Repositories Used
- `AssignmentRepository`: Already exists with methods:
  - `findByStudioIdOrderByDueDateDesc(Long studioId)`
  - `findByStudioIdAndDueDateGreaterThanEqual(Long studioId, LocalDate date)`

- `StudentAssignmentRepository`: Already exists with methods:
  - `findByStudentId(Long studentId)`
  - `findByAssignmentId(Long assignmentId)`
  - `findByStudentIdAndAssignmentId(Long studentId, Long assignmentId)`

- `StudioRepository`: For studio validation
- `StudentProfileRepository`: For student lookup and points awarding

### Entities Used
- `Assignment`: Already exists with all required fields
- `StudentAssignment`: Tracks individual student progress
- `Studio`: For authorization and relationships
- `StudentProfile`: For points awarding
- `User`: For authentication

## Points System Integration

When a student completes an assignment (progressMinutes >= goalMinutes):
1. `StudentAssignment.completed` set to `true`
2. `StudentAssignment.completedAt` set to current timestamp
3. Assignment's `pointsValue` added to student's `totalPoints`
4. Points are awarded only once (checked via `completed` flag)

## Error Handling

### Custom Exceptions
- `AssignmentNotFoundException` - 404 Not Found
- `UnauthorizedAccessException` - 403 Forbidden (already exists)
- `StudioNotFoundException` - 404 Not Found (already exists)

### Validation Errors
- Returns 400 Bad Request with field-level error messages
- Handled by GlobalExceptionHandler's validation exception handler

## Testing Notes

### Compilation Issue
The project uses Java 25 with Lombok 1.18.34, which has compatibility issues.
To fix:
1. Downgrade to Java 17 (as specified in pom.xml)
2. OR upgrade Lombok to 1.18.36+ which supports Java 25
3. OR use Maven with Java 17: `JAVA_HOME=/path/to/java17 mvn clean install`

### Manual Testing Checklist
1. Create assignment as teacher
2. Verify students can see assignment
3. Update progress as student
4. Verify auto-completion when goal reached
5. Verify points awarded correctly
6. Update assignment as teacher
7. Delete assignment as teacher
8. Verify unauthorized access blocked
9. Test edge cases (new student joins after assignment created)

## Code Quality

- **Follows existing patterns**: All code matches the style and structure of existing services/controllers
- **Logging**: SLF4J logging at appropriate levels (info for operations, error for exceptions)
- **Transactional**: @Transactional on methods that modify data
- **Null-safe**: Proper handling of optional values
- **Documentation**: Javadoc comments on service methods
- **Validation**: Jakarta validation on all request DTOs
- **Security**: Spring Security @PreAuthorize annotations on endpoints

## Next Steps

1. **Fix Java version**: Ensure Java 17 is used for compilation
2. **Run tests**: `mvn test` to verify all functionality
3. **Integration testing**: Test with frontend or Postman
4. **Database migrations**: Ensure Flyway migrations are up to date
5. **Deploy**: Deploy to Fly.io once tested

## Dependencies

All required dependencies already exist in pom.xml:
- Spring Boot Web
- Spring Security
- Spring Data JPA
- Jakarta Validation
- Lombok
- PostgreSQL

No additional dependencies needed.
