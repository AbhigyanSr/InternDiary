# Software Requirements Specification (SRS)

## Intern Diary - Internship Application Management Platform

**Version:** 1.0  
**Date:** February 17, 2026  
**Author:** Abhigyan Srivastava  
**Project Type:** Web Application

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features and Requirements](#3-system-features-and-requirements)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Database Requirements](#6-database-requirements)
7. [Security Requirements](#7-security-requirements)
8. [Appendix](#8-appendix)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the Intern Diary application. It details the functional and non-functional requirements for a web-based platform designed to help students manage internship applications, track opportunities, and organize interview preparation tasks.

### 1.2 Scope

Intern Diary is a full-stack web application that enables users to:
- Browse and filter internship opportunities, hackathons, and webinars
- Track application status and deadlines
- Manage interview preparation tasks organized by categories
- Upload and manage professional profiles and resumes
- Access admin functionality for posting and managing opportunities

### 1.3 Definitions, Acronyms, and Abbreviations

- **SRS**: Software Requirements Specification
- **JWT**: JSON Web Token
- **CRUD**: Create, Read, Update, Delete
- **API**: Application Programming Interface
- **UI**: User Interface
- **UX**: User Experience
- **MERN**: MongoDB, Express.js, React, Node.js

### 1.4 Intended Audience

- Students seeking internships
- Educational institutions
- Career counselors
- System administrators
- Development and maintenance teams

### 1.5 Product Scope

The Intern Diary platform provides an end-to-end solution for internship application management, from discovering opportunities to tracking applications and preparing for interviews.

---

## 2. Overall Description

### 2.1 Product Perspective

Intern Diary is a standalone web application built using the MERN stack. It consists of:
- **Frontend**: React 18-based single-page application
- **Backend**: RESTful API built with Node.js and Express.js
- **Database**: MongoDB for persistent data storage
- **Authentication**: JWT-based secure authentication system

### 2.2 Product Functions

The system provides the following major functions:

1. **User Authentication & Authorization**
   - User registration and login
   - Role-based access control (Student/Admin)
   - Secure session management

2. **Opportunity Management**
   - Browse opportunities (Internships, Hackathons, Webinars)
   - Filter by type and deadline
   - View detailed opportunity information
   - Admin capability to post/edit/delete opportunities

3. **Application Tracking**
   - Mark opportunities as applied
   - Track application status (Applied, Interviewing, Rejected, Offer)
   - Add custom applications not listed in feed
   - View application history and notes

4. **Preparation Planner**
   - Create preparation tasks
   - Categorize tasks (DSA, Resume, Behavioral, Application, Other)
   - Mark tasks as complete
   - Delete tasks
   - Track preparation progress

5. **Profile Management**
   - Update user profile information
   - Upload and manage resume
   - Store academic details (Branch, CGPA)

### 2.3 User Classes and Characteristics

#### 2.3.1 Student Users
- Primary users of the system
- Can browse opportunities, track applications, and manage tasks
- Technical proficiency: Basic to intermediate
- Frequency of use: Daily to weekly

#### 2.3.2 Admin Users
- Privileged users with content management capabilities
- Can perform all student actions plus post/edit/delete opportunities
- Technical proficiency: Intermediate to advanced
- Frequency of use: Weekly

### 2.4 Operating Environment

- **Client-side**: Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Server-side**: Node.js runtime environment
- **Database**: MongoDB (local or cloud-hosted)
- **Minimum Browser Requirements**: ES6+ JavaScript support

### 2.5 Design and Implementation Constraints

- Must use React for frontend development
- Must use Express.js for backend API
- Must use MongoDB for data persistence
- Must implement JWT-based authentication
- Must follow RESTful API design principles
- Must support responsive design for mobile and desktop

### 2.6 Assumptions and Dependencies

**Assumptions:**
- Users have internet connectivity
- Users have access to modern web browsers
- Users have valid email addresses

**Dependencies:**
- MongoDB database availability
- Node.js runtime environment
- Third-party npm packages
- File system access for resume uploads

---

## 3. System Features and Requirements

### 3.1 User Authentication System

#### 3.1.1 Description
Secure user authentication and authorization system using JWT tokens.

#### 3.1.2 Functional Requirements

**FR-AUTH-01**: The system shall allow new users to register with name, email, and password.

**FR-AUTH-02**: The system shall validate email format and ensure email uniqueness.

**FR-AUTH-03**: The system shall hash passwords using bcrypt before storage.

**FR-AUTH-04**: The system shall authenticate users with email and password credentials.

**FR-AUTH-05**: The system shall issue JWT tokens upon successful authentication.

**FR-AUTH-06**: The system shall maintain user sessions using JWT tokens.

**FR-AUTH-07**: The system shall allow users to logout and invalidate sessions.

**FR-AUTH-08**: The system shall assign roles (student/admin) to users.

**FR-AUTH-09**: The system shall protect routes based on user authentication status.

**FR-AUTH-10**: The system shall redirect unauthenticated users to login page.

### 3.2 Opportunity Dashboard

#### 3.2.1 Description
A centralized dashboard displaying available internship opportunities, hackathons, and webinars.

#### 3.2.2 Functional Requirements

**FR-OPP-01**: The system shall display opportunities posted within the last 24 hours.

**FR-OPP-02**: The system shall allow filtering by type (All, Internship, Hackathon, Webinar).

**FR-OPP-03**: The system shall display opportunity card with title, company, type, and deadline.

**FR-OPP-04**: The system shall provide a link to the external application page.

**FR-OPP-05**: The system shall allow users to expand opportunity cards for detailed view.

**FR-OPP-06**: The system shall display opportunity description in expanded view.

**FR-OPP-07**: The system shall show "Applied" status for tracked opportunities.

**FR-OPP-08**: The system shall provide "Applied?" button for untracked opportunities.

**FR-OPP-09**: The system shall separate active and missed opportunities.

**FR-OPP-10**: The system shall display missed opportunities with visual indication.

**FR-OPP-11**: The system shall show active opportunity count.

### 3.3 Application Tracker

#### 3.3.1 Description
Comprehensive application tracking system with status management and notes.

#### 3.3.2 Functional Requirements

**FR-APP-01**: The system shall allow users to mark opportunities as applied.

**FR-APP-02**: The system shall prevent duplicate applications for the same opportunity.

**FR-APP-03**: The system shall allow manual application entry without linked opportunity.

**FR-APP-04**: The system shall store company name, role, status, and applied date.

**FR-APP-05**: The system shall support four status types: Applied, Interviewing, Rejected, Offer.

**FR-APP-06**: The system shall allow users to update application status.

**FR-APP-07**: The system shall allow users to add and edit notes for applications.

**FR-APP-08**: The system shall allow users to delete applications.

**FR-APP-09**: The system shall display all applications in a filterable list.

**FR-APP-10**: The system shall filter applications by status.

**FR-APP-11**: The system shall display application statistics by status.

**FR-APP-12**: The system shall show application history with timestamps.

### 3.4 Preparation Planner

#### 3.4.1 Description
Task management system for organizing interview preparation activities.

#### 3.4.2 Functional Requirements

**FR-TASK-01**: The system shall allow users to create new preparation tasks.

**FR-TASK-02**: The system shall require task title for creation.

**FR-TASK-03**: The system shall support five task categories: DSA, Resume, Behavioral, Application, Other.

**FR-TASK-04**: The system shall allow users to categorize tasks.

**FR-TASK-05**: The system shall allow users to mark tasks as completed.

**FR-TASK-06**: The system shall allow users to unmark completed tasks.

**FR-TASK-07**: The system shall allow users to delete tasks.

**FR-TASK-08**: The system shall display tasks grouped by category.

**FR-TASK-09**: The system shall show completed and pending task counts per category.

**FR-TASK-10**: The system shall display tasks in reverse chronological order.

**FR-TASK-11**: The system shall persist task completion state.

### 3.5 Profile Management

#### 3.5.1 Description
User profile management with resume upload functionality.

#### 3.5.2 Functional Requirements

**FR-PROF-01**: The system shall display user profile information (name, email).

**FR-PROF-02**: The system shall allow users to upload resume files.

**FR-PROF-03**: The system shall support PDF resume format.

**FR-PROF-04**: The system shall store uploaded resume in server file system.

**FR-PROF-05**: The system shall store resume file path in database.

**FR-PROF-06**: The system shall allow users to view uploaded resume.

**FR-PROF-07**: The system shall allow users to update profile information.

**FR-PROF-08**: The system shall store academic details (Branch, CGPA).

**FR-PROF-09**: The system shall display profile completion status.

### 3.6 Admin Panel

#### 3.6.1 Description
Administrative interface for managing opportunities.

#### 3.6.2 Functional Requirements

**FR-ADMIN-01**: The system shall restrict admin panel access to admin users only.

**FR-ADMIN-02**: The system shall allow admins to create new opportunities.

**FR-ADMIN-03**: The system shall require title, company, type, apply link, and deadline for opportunities.

**FR-ADMIN-04**: The system shall allow admins to add optional descriptions.

**FR-ADMIN-05**: The system shall allow admins to upload PDF attachments.

**FR-ADMIN-06**: The system shall allow admins to edit existing opportunities.

**FR-ADMIN-07**: The system shall allow admins to delete opportunities.

**FR-ADMIN-08**: The system shall display "Admin Tools" section in sidebar for admins.

**FR-ADMIN-09**: The system shall track opportunity creator (postedBy field).

---

## 4. External Interface Requirements

### 4.1 User Interface Requirements

#### 4.1.1 General UI Requirements

**UI-01**: The system shall implement responsive design for mobile and desktop.

**UI-02**: The system shall use a consistent premium dark theme.

**UI-03**: The system shall provide clear visual feedback for user actions.

**UI-04**: The system shall display loading states during data fetching.

**UI-05**: The system shall show error messages for failed operations.

**UI-06**: The system shall use accessible color contrast ratios.

**UI-07**: The system shall implement keyboard navigation support.

#### 4.1.2 Layout Structure

**UI-LAYOUT-01**: The system shall display a persistent sidebar on desktop views.

**UI-LAYOUT-02**: The system shall show navigation items: Opportunities, My Applications, Prep Planner.

**UI-LAYOUT-03**: The system shall display user information in sidebar footer.

**UI-LAYOUT-04**: The system shall show logout button in sidebar.

**UI-LAYOUT-05**: The system shall display creator watermark at bottom of sidebar.

**UI-LAYOUT-06**: The system shall show mobile header on small screens.

#### 4.1.3 Component Design

**UI-COMP-01**: Opportunity cards shall display type badge, deadline, title, company.

**UI-COMP-02**: Status badges shall use color coding (success, warning, danger).

**UI-COMP-03**: Buttons shall follow primary and outline style variants.

**UI-COMP-04**: Form inputs shall have consistent styling and validation feedback.

**UI-COMP-05**: Modal overlays shall blur background content.

### 4.2 API Interface Requirements

#### 4.2.1 Authentication Endpoints

- **POST /api/auth/register** - User registration
  - Input: { name, email, password }
  - Output: { message, token, user }

- **POST /api/auth/login** - User login
  - Input: { email, password }
  - Output: { token, user }

#### 4.2.2 Opportunity Endpoints

- **GET /api/jobs** - Fetch all opportunities
  - Output: Array of opportunity objects

- **POST /api/jobs** - Create opportunity (Admin only)
  - Input: { title, company, type, description, applyLink, deadline }
  - Output: Created opportunity object

- **PATCH /api/jobs/:id** - Update opportunity (Admin only)
  - Input: Partial opportunity object
  - Output: Updated opportunity object

- **DELETE /api/jobs/:id** - Delete opportunity (Admin only)
  - Output: Success message

#### 4.2.3 Application Endpoints

- **GET /api/applications** - Fetch user applications
  - Output: Array of application objects

- **POST /api/applications** - Create application
  - Input: { company, role, opportunity, status }
  - Output: Created application object

- **PATCH /api/applications/:id** - Update application
  - Input: { status, notes }
  - Output: Updated application object

- **DELETE /api/applications/:id** - Delete application
  - Output: Success message

#### 4.2.4 Task Endpoints

- **GET /api/tasks** - Fetch user tasks
  - Output: Array of task objects

- **POST /api/tasks** - Create task
  - Input: { title, category }
  - Output: Created task object

- **PATCH /api/tasks/:id** - Update task
  - Input: { isCompleted }
  - Output: Updated task object

- **DELETE /api/tasks/:id** - Delete task
  - Output: Success message

#### 4.2.5 User Endpoints

- **GET /api/users/me** - Fetch current user profile
  - Output: User object

- **PATCH /api/users/me** - Update user profile
  - Input: Partial user object
  - Output: Updated user object

- **POST /api/users/upload-resume** - Upload resume
  - Input: FormData with file
  - Output: { resumePath }

### 4.3 Database Interface Requirements

**DB-01**: The system shall use MongoDB for data persistence.

**DB-02**: The system shall use Mongoose ODM for data modeling.

**DB-03**: The system shall implement proper indexing for query optimization.

**DB-04**: The system shall enforce referential integrity through ObjectId references.

**DB-05**: The system shall use timestamps for all documents.

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

**NFR-PERF-01**: The system shall load the dashboard within 3 seconds on standard internet connections.

**NFR-PERF-02**: API responses shall return within 500ms for 95% of requests.

**NFR-PERF-03**: The system shall support at least 100 concurrent users.

**NFR-PERF-04**: Database queries shall be optimized with proper indexing.

**NFR-PERF-05**: Frontend assets shall be minified and optimized for production.

### 5.2 Security Requirements

**NFR-SEC-01**: Passwords shall be hashed using bcrypt with salt rounds ≥ 10.

**NFR-SEC-02**: JWT tokens shall have appropriate expiration times.

**NFR-SEC-03**: API endpoints shall validate and sanitize all inputs.

**NFR-SEC-04**: File uploads shall be restricted to allowed file types.

**NFR-SEC-05**: Admin routes shall be protected with role-based middleware.

**NFR-SEC-06**: The system shall prevent SQL injection and XSS attacks.

**NFR-SEC-07**: CORS shall be properly configured to restrict origins.

**NFR-SEC-08**: Sensitive data shall not be exposed in error messages.

### 5.3 Reliability Requirements

**NFR-REL-01**: The system shall have 99% uptime during business hours.

**NFR-REL-02**: Database operations shall be wrapped in error handling.

**NFR-REL-03**: Failed operations shall display user-friendly error messages.

**NFR-REL-04**: The system shall gracefully handle network failures.

**NFR-REL-05**: Data backups shall be performed regularly.

### 5.4 Usability Requirements

**NFR-USE-01**: New users shall be able to register and create their first application within 5 minutes.

**NFR-USE-02**: The interface shall be intuitive without requiring a user manual.

**NFR-USE-03**: Error messages shall be clear and actionable.

**NFR-USE-04**: The system shall provide visual feedback for all user actions.

**NFR-USE-05**: Navigation shall be consistent across all pages.

### 5.5 Maintainability Requirements

**NFR-MAINT-01**: Code shall follow consistent formatting and naming conventions.

**NFR-MAINT-02**: Components shall be modular and reusable.

**NFR-MAINT-03**: API routes shall be organized by resource type.

**NFR-MAINT-04**: Environment variables shall be used for configuration.

**NFR-MAINT-05**: Code shall include appropriate comments for complex logic.

### 5.6 Scalability Requirements

**NFR-SCALE-01**: The database schema shall support future feature additions.

**NFR-SCALE-02**: The API shall be stateless to support horizontal scaling.

**NFR-SCALE-03**: File storage shall support migration to cloud storage.

**NFR-SCALE-04**: The system architecture shall support microservices migration.

---

## 6. Database Requirements

### 6.1 Data Models

#### 6.1.1 User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: Enum ['student', 'admin'] (default: 'student'),
  profile: {
    resume: String,
    branch: String,
    cgpa: Number
  },
  resumePath: String,
  timestamps: true
}
```

#### 6.1.2 Opportunity Model
```javascript
{
  title: String (required),
  company: String (required),
  type: Enum ['Internship', 'Hackathon', 'Webinar'],
  description: String,
  applyLink: String (required),
  deadline: Date (required),
  pdfUrl: String,
  postedBy: ObjectId (ref: User),
  timestamps: true
}
```

#### 6.1.3 Application Model
```javascript
{
  user: ObjectId (ref: User, required),
  company: String (required),
  role: String (required),
  opportunity: ObjectId (ref: Opportunity),
  status: Enum ['applied', 'interviewing', 'rejected', 'offer'],
  appliedDate: Date (default: now),
  notes: String,
  timestamps: true,
  unique: [user, opportunity] where opportunity exists
}
```

#### 6.1.4 Task Model
```javascript
{
  user: ObjectId (ref: User, required),
  title: String (required),
  category: Enum ['DSA', 'Resume', 'Behavioral', 'Application', 'Other'],
  isCompleted: Boolean (default: false),
  dueDate: Date,
  timestamps: true
}
```

### 6.2 Database Constraints

**DB-CONST-01**: Email addresses must be unique in the User collection.

**DB-CONST-02**: User-Opportunity pairs must be unique in Application collection.

**DB-CONST-03**: All foreign key references must be valid ObjectIds.

**DB-CONST-04**: Deadline dates must be valid Date objects.

**DB-CONST-05**: Enum fields must contain only allowed values.

---

## 7. Security Requirements

### 7.1 Authentication Security

**SEC-AUTH-01**: Passwords must meet minimum complexity requirements.

**SEC-AUTH-02**: Failed login attempts shall be logged.

**SEC-AUTH-03**: JWT tokens shall be stored securely on client-side.

**SEC-AUTH-04**: Tokens shall be transmitted only over HTTPS in production.

### 7.2 Authorization Security

**SEC-AUTHZ-01**: All protected routes shall verify JWT token validity.

**SEC-AUTHZ-02**: Admin routes shall verify user role.

**SEC-AUTHZ-03**: Users shall only access their own data.

**SEC-AUTHZ-04**: Direct object reference shall be prevented.

### 7.3 Data Security

**SEC-DATA-01**: Sensitive data shall not be logged.

**SEC-DATA-02**: Database connection strings shall be environment variables.

**SEC-DATA-03**: API keys and secrets shall not be committed to version control.

**SEC-DATA-04**: User passwords shall never be returned in API responses.

---

## 8. Appendix

### 8.1 Technology Stack Summary

**Frontend:**
- React 18.2.0
- React Router DOM 6.x
- Tailwind CSS 3.x

**Backend:**
- Node.js (v14+)
- Express.js 4.x
- Mongoose 6.x
- bcrypt
- jsonwebtoken
- multer (file uploads)

**Database:**
- MongoDB 4.x+

### 8.2 Deployment Configuration

**Environment Variables Required:**
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `PORT`: Server port (default: 5000)

### 8.3 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 8.4 Project Repository

- **GitHub**: https://github.com/AbhigyanSr/InternDiary

### 8.5 Future Enhancements

1. Email notifications for deadlines
2. Calendar integration
3. Advanced analytics and insights
4. Collaboration features
5. Mobile native applications
6. Resume parsing and suggestions
7. Company research integration
8. Interview preparation resources
9. Networking features
10. AI-powered recommendations

---

**Document Approval**

This SRS document serves as the official specification for the Intern Diary application.

**Created by:** Abhigyan Srivastava  
**Date:** February 17, 2026  
**Version:** 1.0
