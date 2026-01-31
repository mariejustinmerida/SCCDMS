# SCC Document Management System

A comprehensive document management system for Saint Columban College.

## Directory Structure

```
/
├── actions/            # Form processing and action handlers
├── api/                # API endpoints and AJAX handlers
├── assets/             # Static assets
│   ├── css/            # CSS files
│   ├── images/         # Image files
│   └── js/             # JavaScript files
├── auth/               # Authentication-related files
├── database/           # Database files and migrations
├── includes/           # Reusable PHP components and configuration
├── pages/              # Main page files
├── storage/            # Storage for uploaded and generated content
│   ├── documents/      # Document files
│   ├── logs/           # Log files
│   ├── profiles/       # Profile images
│   └── uploads/        # Uploaded files
└── vendor/             # Composer dependencies
```

## Key Files

- `index.php` - Entry point that redirects to login
- `.htaccess` - Apache configuration for routing and security
- `includes/config.php` - Database configuration
- `auth/login.php` - Login page
- `pages/dashboard.php` - Main dashboard

## Setup Instructions

1. Clone the repository
2. Import the database schema from `database/scc_dms.sql`
3. Configure database connection in `includes/config.php`
4. Ensure proper permissions for storage directories
5. Access the application through your web server

## Dependencies

- PHP 7.4+
- MySQL 5.7+
- Composer packages (see composer.json) 