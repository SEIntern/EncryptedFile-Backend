<!-- # MongoDB Setup Instructions

## Prerequisites
- MongoDB 4.4+ installed and running
- MongoDB Compass (optional, for GUI management)
- Node.js 14+ (if implementing with Node.js)

## Step-by-Step Setup

### 1. Create Database
```bash
# Connect to MongoDB
mongo

# Create and switch to database
use user_management_portal
```

### 2. Run Schema Creation Scripts
Execute the scripts in this order:

```bash
# 1. Create collections with validation
mongo user_management_portal mongodb-collections.js

# 2. Create indexes for performance
mongo user_management_portal mongodb-indexes.js

# 3. Insert sample data (optional)
mongo user_management_portal sample-data.js
```

### 3. Verify Setup
```javascript
// Check collections
db.runCommand("listCollections")

// Verify indexes
db.admins.getIndexes()
db.users.getIndexes()

// Check sample data
db.subscription_plans.find().pretty()
db.super_admins.findOne()
```

## Environment Variables
Create a `.env` file for your application:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/user_management_portal
MONGODB_DB_NAME=user_management_portal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Password Hashing
BCRYPT_ROUNDS=10

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif
```

## Security Considerations

### 1. Password Security
- All passwords must be hashed using bcrypt with at least 10 rounds
- Implement password complexity requirements
- Add password reset functionality

### 2. Authentication
- Use JWT tokens for session management
- Implement token refresh mechanism
- Add rate limiting for login attempts

### 3. Authorization
- Validate user permissions before each action
- Check subscription status before allowing access
- Implement role-based access control (RBAC)

### 4. Data Validation
- Validate all input data on both client and server
- Use MongoDB schema validation (already implemented)
- Sanitize file uploads

## API Endpoints Structure

### Authentication Endpoints
```
POST /auth/login
POST /auth/logout
POST /auth/refresh-token
POST /auth/forgot-password
POST /auth/reset-password
```

### Super Admin Endpoints
```
POST /super-admin/admins        # Create admin
GET  /super-admin/admins        # List all admins
PUT  /super-admin/admins/:id    # Update admin
DELETE /super-admin/admins/:id  # Deactivate admin
```

### Admin Endpoints
```
GET  /admin/dashboard           # Admin dashboard
POST /admin/managers            # Create manager
GET  /admin/managers            # List managers
PUT  /admin/managers/:id        # Update manager
DELETE /admin/managers/:id      # Deactivate manager
GET  /admin/subscription        # View subscription
PUT  /admin/subscription        # Update subscription
```

### Manager Endpoints
```
GET  /manager/dashboard         # Manager dashboard
POST /manager/users             # Create user
GET  /manager/users             # List users
PUT  /manager/users/:id         # Update user
DELETE /manager/users/:id       # Deactivate user
```

### User Endpoints
```
GET  /user/dashboard            # User dashboard
POST /user/files                # Upload file
GET  /user/files                # List files
GET  /user/files/:id            # Download file
PUT  /user/files/:id            # Update file metadata
DELETE /user/files/:id          # Delete file
```

## Scheduled Tasks

### 1. Subscription Expiration Check
```javascript
// Run daily to check for expired subscriptions
const checkExpiredSubscriptions = async () => {
  const expiredAdmins = await db.admins.find({
    "subscription.end_date": { $lt: new Date() },
    "subscription.is_active": true
  });
  
  for (const admin of expiredAdmins) {
    // Mark subscription as expired
    await markExpiredSubscriptions();
    
    // Deactivate all hierarchy under this admin
    await deactivateExpiredAdminHierarchy(admin._id);
    
    // Send notification email
    await sendExpirationNotification(admin.email);
  }
};
```

### 2. Session Cleanup
```javascript
// Run hourly to cleanup expired sessions
const cleanupSessions = async () => {
  await db.login_sessions.deleteMany({
    expires_at: { $lt: new Date() }
  });
};
```

### 3. Usage Analytics
```javascript
// Run weekly to generate usage reports
const generateUsageReports = async () => {
  const analytics = await db.admins.aggregate([
    {
      $lookup: {
        from: "managers",
        localField: "_id",
        foreignField: "admin_id",
        as: "managers"
      }
    },
    {
      $lookup: {
        from: "users", 
        localField: "_id",
        foreignField: "admin_id",
        as: "users"
      }
    },
    {
      $lookup: {
        from: "user_files",
        localField: "_id", 
        foreignField: "admin_id",
        as: "files"
      }
    }
  ]);
  
  // Process and store analytics
};
```

## Performance Optimization

### 1. Database Optimization
- Use appropriate indexes (already created)
- Implement connection pooling
- Use aggregation pipelines for complex queries
- Consider read replicas for heavy read operations

### 2. Caching Strategy
```javascript
// Cache frequently accessed data
const redis = require('redis');
const client = redis.createClient();

// Cache subscription plans
const getSubscriptionPlans = async () => {
  const cached = await client.get('subscription_plans');
  if (cached) return JSON.parse(cached);
  
  const plans = await db.subscription_plans.find({ is_active: true });
  await client.setex('subscription_plans', 3600, JSON.stringify(plans));
  return plans;
};
```

### 3. File Storage
- Use cloud storage (AWS S3, Google Cloud Storage) for files
- Implement CDN for faster file delivery
- Generate signed URLs for secure file access

## Monitoring and Logging

### 1. Application Metrics
- Monitor API response times
- Track error rates
- Monitor database performance
- Set up alerts for critical issues

### 2. Audit Logging
- Log all user actions (already implemented)
- Monitor failed login attempts
- Track subscription changes
- Log file operations

### 3. Health Checks
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.admin().ping();
    
    // Check Redis connection
    await client.ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date(),
      database: 'connected',
      cache: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## Testing Strategy

### 1. Unit Tests
- Test business logic functions
- Test data validation
- Test authentication/authorization

### 2. Integration Tests  
- Test API endpoints
- Test database operations
- Test file upload/download

### 3. Load Tests
- Test concurrent user scenarios
- Test file upload limits
- Test subscription expiration handling

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] SSL certificates installed
- [ ] Backup strategy implemented
- [ ] Monitoring tools configured
- [ ] Log aggregation setup
- [ ] Performance testing completed
- [ ] Security audit performed
- [ ] Documentation updated

## Backup and Recovery

### 1. Database Backup
```bash
# Daily backup
mongodump --db user_management_portal --out /backup/$(date +%Y%m%d)

# Restore from backup
mongorestore --db user_management_portal /backup/20250917/user_management_portal
```

### 2. File Backup
- Implement automated file backup to cloud storage
- Test restore procedures regularly
- Maintain backup retention policy

## Support and Maintenance

### 1. Regular Tasks
- Monitor subscription expirations
- Review and clean audit logs
- Update security patches
- Performance optimization reviews

### 2. Emergency Procedures
- Database recovery steps
- Security incident response
- Service outage handling
- Data breach protocols

---

## Quick Start Commands

```bash
# 1. Start MongoDB
sudo systemctl start mongod

# 2. Create database and run setup
mongo user_management_portal mongodb-collections.js
mongo user_management_portal mongodb-indexes.js
mongo user_management_portal sample-data.js

# 3. Verify setup
mongo user_management_portal
> db.admins.findOne()
> db.subscription_plans.find()

# 4. Start your application
npm start
```

Your hierarchical user management database is now ready for production use! -->



# Hierarchical User Management Database Schema

## Overview
This MongoDB schema supports a 4-tier user hierarchy with subscription-based access control:
- **Super Admin** → **Admin** → **Manager** → **User**
- Subscription-based portal access for Admins
- File management for Users

## Database: `user_management_portal`

---

## Collection: `super_admins`
**Purpose**: Root level administrators (manually inserted only)

```javascript
{
  _id: ObjectId,
  username: String, // unique
  email: String, // unique
  password: String, // hashed
  created_at: Date,
  updated_at: Date,
  is_active: Boolean,
  last_login: Date
}
```

**Indexes**:
- `{ username: 1 }` (unique)
- `{ email: 1 }` (unique)

---

## Collection: `subscription_plans`
**Purpose**: Define available subscription plans

```javascript
{
  _id: ObjectId,
  plan_name: String, // e.g., "Basic 15 Days", "Premium 30 Days"
  duration_days: Number, // 15, 30, 60, 90, etc.
  max_managers: Number, // limit on managers admin can create
  max_users_per_manager: Number, // limit on users per manager
  max_files_per_user: Number, // limit on files per user
  price: Number,
  features: Array, // list of features included
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
- `{ plan_name: 1 }` (unique)
- `{ is_active: 1 }`

---

## Collection: `admins`
**Purpose**: Admin users with subscription management

```javascript
{
  _id: ObjectId,
  username: String, // unique
  email: String, // unique
  password: String, // hashed
  created_by: ObjectId, // reference to super_admins._id
  
  // Subscription details
  subscription: {
    plan_id: ObjectId, // reference to subscription_plans._id
    start_date: Date,
    end_date: Date, // calculated: start_date + plan.duration_days
    is_active: Boolean,
    auto_renew: Boolean
  },
  
  // Account status
  is_active: Boolean,
  is_subscription_expired: Boolean, // computed field
  
  // Audit fields
  created_at: Date,
  updated_at: Date,
  last_login: Date,
  login_attempts: Number
}
```

**Indexes**:
- `{ username: 1 }` (unique)
- `{ email: 1 }` (unique)
- `{ created_by: 1 }`
- `{ "subscription.end_date": 1 }`
- `{ "subscription.is_active": 1 }`

---

## Collection: `managers`
**Purpose**: Manager users created by admins

```javascript
{
  _id: ObjectId,
  username: String, // unique
  email: String, // unique
  password: String, // hashed
  created_by: ObjectId, // reference to admins._id
  admin_id: ObjectId, // reference to admins._id (for subscription inheritance)
  
  // Limits inherited from admin's subscription
  max_users: Number, // from subscription_plans.max_users_per_manager
  current_user_count: Number, // computed field
  
  // Account status
  is_active: Boolean,
  
  // Audit fields
  created_at: Date,
  updated_at: Date,
  last_login: Date
}
```

**Indexes**:
- `{ username: 1 }` (unique)
- `{ email: 1 }` (unique)
- `{ created_by: 1 }`
- `{ admin_id: 1 }`

---

## Collection: `users`
**Purpose**: End users created by managers

```javascript
{
  _id: ObjectId,
  username: String, // unique
  email: String, // unique
  password: String, // hashed
  created_by: ObjectId, // reference to managers._id
  manager_id: ObjectId, // reference to managers._id
  admin_id: ObjectId, // reference to admins._id (for subscription tracking)
  
  // File management
  max_files: Number, // from subscription_plans.max_files_per_user
  current_file_count: Number, // computed field
  
  // Account status
  is_active: Boolean,
  
  // Audit fields
  created_at: Date,
  updated_at: Date,
  last_login: Date
}
```

**Indexes**:
- `{ username: 1 }` (unique)
- `{ email: 1 }` (unique)
- `{ created_by: 1 }`
- `{ manager_id: 1 }`
- `{ admin_id: 1 }`

---

## Collection: `user_files`
**Purpose**: Files created by users (dummy implementation)

```javascript
{
  _id: ObjectId,
  filename: String,
  file_path: String, // storage path
  file_size: Number, // in bytes
  file_type: String, // MIME type
  created_by: ObjectId, // reference to users._id
  user_id: ObjectId, // reference to users._id
  manager_id: ObjectId, // reference to managers._id
  admin_id: ObjectId, // reference to admins._id
  
  // File metadata
  description: String,
  tags: Array, // for categorization
  
  // Status
  is_active: Boolean,
  is_deleted: Boolean,
  
  // Audit fields
  created_at: Date,
  updated_at: Date,
  deleted_at: Date
}
```

**Indexes**:
- `{ created_by: 1 }`
- `{ user_id: 1 }`
- `{ manager_id: 1 }`
- `{ admin_id: 1 }`
- `{ is_active: 1, is_deleted: 1 }`

---

## Collection: `login_sessions`
**Purpose**: Track active user sessions

```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // reference to user in any collection
  user_type: String, // "super_admin", "admin", "manager", "user"
  session_token: String, // JWT or session identifier
  ip_address: String,
  user_agent: String,
  is_active: Boolean,
  created_at: Date,
  expires_at: Date,
  last_activity: Date
}
```

**Indexes**:
- `{ user_id: 1, user_type: 1 }`
- `{ session_token: 1 }` (unique)
- `{ expires_at: 1 }`

---

## Collection: `audit_logs`
**Purpose**: Track all system activities

```javascript
{
  _id: ObjectId,
  action: String, // "login", "create_user", "delete_file", etc.
  user_id: ObjectId, // who performed the action
  user_type: String, // "super_admin", "admin", "manager", "user"
  target_id: ObjectId, // what was affected
  target_type: String, // "admin", "manager", "user", "file"
  details: Object, // additional action details
  ip_address: String,
  user_agent: String,
  timestamp: Date
}
```

**Indexes**:
- `{ user_id: 1, timestamp: -1 }`
- `{ action: 1, timestamp: -1 }`
- `{ target_id: 1, target_type: 1 }`

---

## Key Business Rules

### 1. User Creation Hierarchy
- Super Admin → creates Admin
- Admin → creates Manager  
- Manager → creates User
- User → creates Files

### 2. Subscription Controls
- Only Admins have subscriptions
- Admin access expires based on subscription end_date
- Managers and Users inherit access from their Admin's subscription
- Expired Admin = All their Managers and Users lose access

### 3. Limits and Quotas
- Admins are limited by their subscription plan
- Managers limited by subscription.max_users_per_manager
- Users limited by subscription.max_files_per_user

### 4. Access Control
- Super Admin: Full system access (manually created)
- Admin: Access only during active subscription
- Manager: Access depends on parent Admin's subscription
- User: Access depends on parent Admin's subscription
