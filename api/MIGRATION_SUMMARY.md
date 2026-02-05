# Database Migration Summary: MongoDB to MySQL

## Overview
This document summarizes the migration from MongoDB/Mongoose to MySQL/Prisma for the Institutional Dashboard Monitoring (IDM) system.

## Migration Details

### Database
- **From:** MongoDB (via Mongoose ODM)
- **To:** MySQL (via Prisma ORM v5.22.0)
- **Database Server:** localhost:3306
- **Database Name:** idm
- **Credentials:** root/root (update for production!)

### Schema Structure
The Prisma schema (`prisma/schema.prisma`) defines 13 models:

1. **User** - Application users with roles (admin, president, vice-president, director, office-head)
2. **Department** - Organizational departments
3. **Campus** - Campus locations
4. **Goal** - Institutional goals
5. **Objective** - Objectives linked to goals with monthly tracking
6. **ObjectiveBudget** - Budget allocations per objective
7. **Goallist** - Goal templates
8. **GoallistObjective** - Objectives within goal templates
9. **Notification** - User notifications
10. **Remark** - Remarks/comments on objectives
11. **Log** - Activity logs
12. **UserHistory** - User action history
13. **FileUpload** - Uploaded file records

### Backward Compatibility
All models include a `visibleId` field that maps to `id` in API responses to maintain frontend compatibility:
- Internal UUID: `id` (primary key)
- External ID: `visibleId` (returned as `id` to frontend)

## File Structure

### New Prisma Routes (api/routes/)
| File | Purpose |
|------|---------|
| `authentication.js` | User auth (updated for Prisma) |
| `users-prisma.js` | User CRUD operations |
| `department-prisma.js` | Department management |
| `goals-prisma.js` | Goals with aggregations |
| `objectives-prisma.js` | Objectives with calculations |
| `goallists-prisma.js` | Goal templates |
| `notification-prisma.js` | Role-based notifications |
| `remark-prisma.js` | Objective remarks |
| `log-prisma.js` | Activity logging |
| `userhistory-prisma.js` | User history |
| `campus-prisma.js` | Campus management |
| `fileupload-prisma.js` | File uploads |
| `role-query-prisma.js` | Director/VP/Office-head queries |

### Configuration Files
| File | Purpose |
|------|---------|
| `config/prisma.js` | Prisma client singleton |
| `prisma/schema.prisma` | Database schema |
| `.env` | Environment variables (DATABASE_URL) |

## Running the Application

### Prerequisites
1. MySQL server running on localhost:3306
2. Database `idm` created
3. Node.js 18+ installed

### Setup Steps
```bash
# Navigate to API directory
cd api

# Install dependencies
npm install

# Run database migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Start the server
node app.js
```

### Environment Variables (.env)
```
DATABASE_URL="mysql://root:root@localhost:3306/idm"
NODE_ENV=development
SECRET=your_jwt_secret
```

## API Endpoints

### Authentication (Public)
- `POST /authentication/register` - Register new user
- `POST /authentication/login` - Login
- `GET /authentication/checkEmail/:email` - Check email availability
- `GET /authentication/checkUsername/:username` - Check username availability

### Protected Endpoints (require JWT token)
All other endpoints require `Authorization: Bearer <token>` header.

### Users
- `GET /users/getAllUsersForDashboard` - Dashboard user counts
- `GET /users/getAllUsersExceptLoggedIn` - Paginated user list
- `POST /users/addUser` - Create user
- `PUT /users/updateUser` - Update user
- `DELETE /users/deleteUser` - Soft delete user

### Goals
- `GET /goals/getObjectivesViewTable` - Goals with objectives (paginated)
- `POST /goals/addGoal` - Create goal
- `PUT /goals/updateGoal` - Update goal
- `DELETE /goals/deleteGoal` - Soft delete goal

### Objectives
- `GET /objectives/getObjectives` - All objectives
- `POST /objectives/addObjective` - Create objective
- `PUT /objectives/updateObjective` - Update objective
- `DELETE /objectives/deleteObjective` - Soft delete objective

### Campus
- `GET /campus/getAllCampus` - Campus dropdown data
- `GET /campus/campuses` - Full campus list
- `POST /campus/campus` - Create campus
- `PUT /campus/campus/:id` - Update campus
- `DELETE /campus/campus/:id` - Soft delete campus

### Department
- `GET /department/getAllDepartments` - All departments
- `POST /department/addDepartment` - Create department
- `PUT /department/updateDepartment` - Update department
- `DELETE /department/deleteDepartment` - Soft delete department

## Migration Notes

### Key Changes
1. **Embedded Arrays → Normalized Tables**: MongoDB embedded arrays (like objectives in goallists) are now separate tables with foreign keys.
2. **ObjectId → UUID**: MongoDB ObjectIds replaced with UUID strings.
3. **Role Mapping**: String roles mapped to enums (e.g., 'vice-president' ↔ 'VICE_PRESIDENT').
4. **Aggregation Pipelines → Prisma Queries**: MongoDB aggregations converted to Prisma includes and client-side calculations.

### Prisma Version
Using Prisma 5.22.0 (not 7.x) for native MySQL support without requiring driver adapters.

## Testing

Run the test to verify Prisma connection:
```bash
cd api
node -e "const prisma = require('./config/prisma'); prisma.\$queryRaw\`SELECT 1\`.then(r => console.log('OK')).catch(e => console.log(e))"
```

## Production Checklist
- [ ] Update DATABASE_URL credentials
- [ ] Set NODE_ENV=production
- [ ] Configure connection pooling
- [ ] Set up database backups
- [ ] Review and apply indexes
- [ ] Update JWT SECRET
