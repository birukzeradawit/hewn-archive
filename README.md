# HEWN Tech Archive - Backend API

Complete backend system for the HEWN Tech Digital Archive website with user authentication, content management, file uploads, and PostgreSQL database.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Content Management**: Full CRUD operations for archival content
- **File Upload**: Support for images and documents with secure upload handling
- **Archive Management**: Specialized system for managing Gigar Tesfaye archive items
- **REST API**: Clean RESTful API endpoints for all operations
- **PostgreSQL Database**: Robust relational database with comprehensive schema

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/birukzeradawit/hewn-archive.git
   cd hewn-archive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb hewn_archive
   
   # Run schema setup
   psql -d hewn_archive -f backend/config/schema.sql
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=hewn_archive
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key
   ```

## Database Schema

The database includes the following tables:

- **users**: User accounts with role-based access
- **categories**: Content categorization system
- **content**: General archival content management
- **archive_items**: Specialized archive items (Gigar Tesfaye collection)
- **partners**: Network and partner organizations
- **knowledge_resources**: Educational and research resources

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Content Management

- `GET /api/content` - Get all content (with filtering)
- `GET /api/content/:id` - Get content by ID
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content (admin only)
- `GET /api/content/categories/list` - Get all categories

### Archive Items

- `GET /api/archive` - Get all archive items (with filtering)
- `GET /api/archive/:id` - Get archive item by ID
- `POST /api/archive` - Create new archive item
- `PUT /api/archive/:id` - Update archive item
- `DELETE /api/archive/:id` - Delete archive item (admin only)

### File Upload

- `POST /api/uploads/single` - Upload single file
- `POST /api/uploads/multiple` - Upload multiple files
- `DELETE /api/uploads/:filename` - Delete file (admin only)

## Usage

### Start the server

```bash
npm start
```

The server will start on port 5000 (or the port specified in `.env`).

### Example API Usage

#### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Create content (with authentication)
```bash
curl -X POST http://localhost:5000/api/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Test Content","description":"Test description","category_id":1,"published":true}'
```

#### Upload file
```bash
curl -X POST http://localhost:5000/api/uploads/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.jpg"
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control (admin/user)
- File type validation for uploads
- File size limits (10MB max)
- SQL injection prevention with parameterized queries

## Project Structure

```
backend/
├── config/
│   ├── database.js       # PostgreSQL connection
│   └── schema.sql        # Database schema
├── middleware/
│   └── auth.js          # Authentication middleware
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management routes
│   ├── content.js       # Content management routes
│   ├── archive.js       # Archive items routes
│   └── uploads.js       # File upload routes
├── uploads/             # Uploaded files directory
└── server.js            # Main server file
```

## Development

For development, you can use:
```bash
npm run dev
```

## Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment variables
2. Use a production PostgreSQL database
3. Use strong JWT secrets
4. Configure proper CORS settings
5. Set up proper file storage (cloud storage recommended for production)

## Environment Variables

- `PORT`: Server port (default: 5000)
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT token generation
- `FRONTEND_URL`: Frontend URL for CORS configuration

## License

ISC

## Support

For issues and questions, please contact the development team.