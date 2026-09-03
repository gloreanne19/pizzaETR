# Pizza ETR - Security Setup Guide

## ⚠️ IMPORTANT: Read This Before Running

This application has been secured against common vulnerabilities. Follow these steps to properly set it up.

---

## 📋 Pre-Deployment Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Fill in actual credentials in `.env`
- [ ] Delete `.env.example` (optional but recommended)
- [ ] Verify MySQL is running
- [ ] Test all features work correctly
- [ ] Review SECURITY.md for best practices
- [ ] Never commit `.env` to version control

---

## 🚀 Initial Setup (First Time)

### Step 1: Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual credentials
nano .env  # or use your preferred editor
```

### Step 2: Configure `.env`

```ini
# Database Configuration
DB_HOST=127.0.0.1
DB_NAME=pizza_pizza
DB_USER=root
DB_PASS=                        # Leave empty if no password

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password    # Use Gmail App Password, not your actual password!
EMAIL_PORT=587
EMAIL_FROM_NAME=Pizza ETR

# Application
APP_DEBUG=false                 # Set to false in production
APP_ENV=production              # or 'development' for debugging
```

### Step 3: Start MySQL

```bash
# For XAMPP on macOS
/Applications/XAMPP/xamppfiles/bin/mysql.server start

# For Homebrew MySQL on macOS
brew services start mysql

# On Linux
sudo systemctl start mysql
```

### Step 4: Create Database

```bash
# Using MySQL command line
mysql -u root -p

# Or using XAMPP's CLI
/Applications/XAMPP/xamppfiles/bin/mysql -u root
```

Then run:

```sql
CREATE DATABASE IF NOT EXISTS pizza_pizza;
USE pizza_pizza;

-- Create all tables (copy schema from pizza_db_crev.sql)
-- See below for importing...
```

### Step 5: Import Database Schema

```bash
# Using XAMPP
/Applications/XAMPP/xamppfiles/bin/mysql -u root pizza_pizza < pizza_db_crev.sql

# Using system MySQL
mysql -u root -p pizza_pizza < pizza_db_crev.sql
```

### Step 6: Verify Installation

1. Start PHP server:
```bash
php -S localhost:8000
```

2. Test access:
   - Open http://localhost:8000 in browser
   - You should see the Pizza ETR home page
   - No database errors should appear

3. Try logging in:
   - Username: `admin`
   - Password: `111`
   - Should redirect to admin panel

---

## 🔐 Security Best Practices

### 1. Never Commit `.env` to Git

Add to `.gitignore`:
```
.env
.env.local
*.log
```

### 2. Protect Credentials

**In .env:**
```ini
# ✅ GOOD - Keep credentials here
DB_PASS=my_secure_password
EMAIL_PASS=app_specific_password
```

**In PHP code:**
```php
// ❌ NEVER - Don't hardcode credentials
$password = 'my_secure_password';

// ✅ GOOD - Use .env file
$password = $_ENV['DB_PASS'];
```

### 3. Use Secure Passwords

- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, symbols
- Unique for each environment (dev, staging, production)

### 4. Gmail App Password

For email functionality:
1. Enable 2-Factor Authentication on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use this 16-character password in `.env`

**Never use your actual Gmail password!**

---

## ✅ Verification Tests

### Test 1: SQL Injection Prevention

Try logging in with:
- Username: `admin' OR '1'='1`
- Password: anything

**Result:** Should show "Incorrect username or password" (not logged in)

### Test 2: XSS Prevention

Try creating a product with:
- Name: `<script>alert('XSS')</script>`

**Result:** Should display the text, not execute JavaScript

### Test 3: File Upload Validation

Try uploading:
- A `.php` file
- A file larger than 5MB
- A `.exe` file

**Result:** Should all be rejected with appropriate error message

### Test 4: Input Validation

Try operations with:
- Negative quantities
- Non-numeric IDs
- Missing required fields

**Result:** Should show validation errors, not crash

---

## 🐛 Troubleshooting

### "Database Connection Failed"

```
✓ MySQL is running
✓ Database name in .env matches actual database
✓ Username and password are correct
✓ Using correct host (127.0.0.1 for local XAMPP)
```

### "Table doesn't exist"

```bash
# Reimport the database
mysql -u root pizza_pizza < pizza_db_crev.sql

# Or manually run schema
# See FIXES_SUMMARY.md for table creation commands
```

### "Call to undefined function"

```
✓ All includes are at top of file:
  - include 'config.php';
  - include 'db_helper.php';
  - include 'security_helper.php';
✓ Files are in project root directory
```

### File Upload Not Working

```
✓ Directory 'uploaded_img/' exists and is writable
✓ File is under 5MB
✓ File type is image (JPG, PNG, GIF, WEBP)
✓ PHP has write permissions on the directory
```

### "XAMPP MySQL socket error"

Update `config.php` to use IP instead:
```php
$db_host = "127.0.0.1";  // Instead of localhost
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `SECURITY.md` | Comprehensive security guide |
| `FIXES_SUMMARY.md` | All vulnerabilities fixed |
| `DEVELOPER_REFERENCE.md` | Quick coding patterns |
| `SECURITY_SETUP.md` | This file - Setup guide |

---

## 🔄 Development vs Production

### Development Settings (.env)

```ini
APP_DEBUG=true          # Show detailed errors
APP_ENV=development     # More lenient checks
```

### Production Settings (.env)

```ini
APP_DEBUG=false         # Hide errors from users
APP_ENV=production      # Strict validation
```

**Important:** Always set `APP_DEBUG=false` in production!

---

## 🔐 Production Deployment Checklist

Before going live:

- [ ] `.env` configured with production credentials
- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] HTTPS/SSL configured
- [ ] Database backups set up
- [ ] Error logging enabled
- [ ] File permissions set correctly (644 files, 755 dirs)
- [ ] `.env` file not readable by web server
- [ ] All security tests pass
- [ ] Regular security updates scheduled

---

## 🆘 Support

### If Database Won't Connect

1. Check MySQL status:
```bash
ps aux | grep mysql
```

2. Manually test connection:
```bash
mysql -h 127.0.0.1 -u root -p
```

3. Verify .env settings match actual database

### If Features Don't Work

1. Check PHP error logs
2. Review console for JavaScript errors
3. Check `db_helper.php` error messages
4. Review DEVELOPER_REFERENCE.md for proper patterns

### If Security Issue Suspected

1. Review SECURITY.md immediately
2. Check all includes are present
3. Verify prepared statements used
4. Ensure output is escaped
5. Validate all inputs

---

## 📞 Quick Commands

```bash
# Start MySQL (XAMPP on macOS)
/Applications/XAMPP/xamppfiles/bin/mysql.server start

# Start PHP server
php -S localhost:8000

# Import database
mysql -u root pizza_pizza < pizza_db_crev.sql

# Test MySQL connection
mysql -h 127.0.0.1 -u root -e "SELECT 1"

# View PHP errors
tail -f /var/log/php.log

# List running processes with 'mysql'
ps aux | grep mysql
```

---

## 🎯 Next Steps

After setup is complete:

1. **Test thoroughly** - Try all features
2. **Read DEVELOPER_REFERENCE.md** - Learn secure patterns
3. **Review SECURITY.md** - Understand implementation
4. **Set up backups** - Regular database backups
5. **Enable monitoring** - Track errors and usage
6. **Plan upgrades** - Schedule security updates

---

## ⚠️ Critical Security Notes

1. **Keep .env private** - Never commit to git
2. **Use strong passwords** - For DB and email accounts
3. **Update PHP regularly** - Keep framework current
4. **Monitor logs** - Watch for suspicious activity
5. **Backup often** - Have disaster recovery plan
6. **Never disable features** - Security is built-in
7. **Test changes** - Before deploying to production
8. **Keep documentation** - For future maintenance

---

## 🚀 Ready to Go!

Once all steps completed and tests pass, your Pizza ETR application is:

✅ Protected against SQL Injection  
✅ Protected against XSS attacks  
✅ Protected against Directory Traversal  
✅ Properly validating all inputs  
✅ Safely handling files  
✅ Using secured database queries  
✅ Ready for production use  

**Congratulations! Your application is now secure.** 🔒

---

For detailed security information, see: [SECURITY.md](SECURITY.md)  
For coding patterns, see: [DEVELOPER_REFERENCE.md](DEVELOPER_REFERENCE.md)  
For all fixes applied, see: [FIXES_SUMMARY.md](FIXES_SUMMARY.md)
