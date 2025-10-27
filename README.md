# NRC Management System - CSV File Storage

## 📁 CSV File-Based Data Storage

### Current Data Storage
All data is now stored in **CSV files** with Node.js backend, which provides:
- ✅ Persistent data storage in human-readable format
- ✅ Fast access and real-time updates
- ✅ Data survives page refresh and server restart
- ✅ Easy data export and backup capabilities
- ✅ No database installation required

## 📊 CSV File Structure

### Core CSV Files
- **users.csv** - Authentication and user management with admin panel
- **patients.csv** - Patient registration and basic info
- **anganwadi_centers.csv** - Anganwadi center information
- **workers.csv** - Worker profiles and assignments
- **beds.csv** - Hospital bed management
- **bed_requests.csv** - Bed allocation requests
- **visits.csv** - Visit scheduling and tracking
- **medical_records.csv** - Complete medical history
- **notifications.csv** - System notifications
- **hospitals.csv** - Hospital information

### CSV Features
- ✅ **Human-readable format** for easy data inspection
- ✅ **JSON field support** for complex data structures
- ✅ **Automatic backup** capabilities
- ✅ **Cross-platform compatibility**
- ✅ **Easy data migration** and export
- ✅ **Admin panel** for user management

## 🔧 Setup Instructions

### Step 1: Install Node.js
Download and install Node.js from: https://nodejs.org/

### Step 2: Install Dependencies & Start Server
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
npm run dev
```

### Step 3: Start Frontend
```bash
# In project root directory
npm install
npm run dev
```

## 🔄 Data Flow

```
Frontend Form → Node.js API → CSV Files → Persistent Storage
```

### API Endpoints
```bash
GET/POST /api/patients
GET/POST /api/beds
GET/POST /api/notifications
GET/POST /api/auth/users (Admin only)
POST /api/auth/login
```

## 👑 Admin Panel Features

### User Management
- ✅ **Create new users** with role assignment
- ✅ **Edit user details** and permissions
- ✅ **Deactivate users** (soft delete)
- ✅ **Password management** with bcrypt hashing
- ✅ **Role-based access control**
- ✅ **Credential distribution** system

### Default Admin Credentials
```
Employee ID: ADMIN001
Username: admin
Password: admin123
```

### Default User Credentials
```
Anganwadi Worker: EMP001 / priya.sharma / worker123
Supervisor: SUP001 / supervisor1 / super123
Hospital Staff: HOSP001 / hospital1 / hosp123
```

## 🎯 Key Features

- ✅ **No database required** - Pure CSV file storage
- ✅ **No data loss** - Everything persists in CSV files
- ✅ **Real-time updates** - Data syncs across sessions
- ✅ **Admin panel** - Complete user management
- ✅ **Sample data included** - Ready for immediate testing
- ✅ **Error handling** - Comprehensive error management
- ✅ **Responsive design** - Works on all devices

## 📁 File Structure

```
server/
├── data/                    # CSV data storage
│   ├── users.csv           # User credentials
│   ├── patients.csv        # Patient records
│   ├── beds.csv           # Bed management
│   ├── notifications.csv   # System notifications
│   └── ...                # Other CSV files
├── utils/
│   └── csvManager.js      # CSV operations manager
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── patients.js       # Patient management
│   └── ...              # Other API routes
└── server.js            # Main server file
```

## 🔍 Troubleshooting

### "Failed to fetch" Error
1. Ensure Node.js server is running: `npm run dev` in server directory
2. Check server is accessible at http://localhost:3001
3. Verify CSV files are created in server/data/ directory

### CSV File Issues
1. Check server/data/ directory exists
2. Verify CSV files have proper headers
3. Check file permissions for read/write access

### Admin Panel Access
1. Login with admin credentials: ADMIN001 / admin / admin123
2. Admin panel automatically loads for admin users
3. Create new users and distribute credentials
4. Manage user roles and permissions

Your data will now **permanently persist** in CSV files and never vanish on refresh or restart!