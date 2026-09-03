# Pizza ETR - Security Implementation Guide

## Overview
This document outlines the security vulnerabilities found and fixed in the Pizza ETR application, along with best practices for future development.

---

## Security Fixes Applied

### 1. **SQL Injection Prevention**
- **Issue**: Direct string interpolation in SQL queries allowed attackers to inject malicious SQL
- **Fix**: Implemented prepared statements with bound parameters throughout the application
- **Helper File**: `db_helper.php`

**Before (Vulnerable):**
```php
$query = "SELECT * FROM admin WHERE name = '$name'";
$result = mysqli_query($conn, $query);
```

**After (Secure):**
```php
$query = "SELECT * FROM admin WHERE name = ?";
$result = executeQuery($query, "s", [$name]);
```

### 2. **Cross-Site Scripting (XSS) Prevention**
- **Issue**: User input was output directly to HTML/JavaScript without escaping
- **Fix**: Implemented `SecurityHelper::escape()` for all dynamic output
- **Helper File**: `security_helper.php`

**Before (Vulnerable):**
```php
echo "<script>alert('" . $_SESSION['message'] . "');</script>";
echo "<div>" . $product['name'] . "</div>";
```

**After (Secure):**
```php
$msg = json_encode($_SESSION['message'], JSON_HEX_QUOT | JSON_HEX_TAG);
echo "<script>alert(" . $msg . ");</script>";
echo "<div>" . SecurityHelper::escape($product['name']) . "</div>";
```

### 3. **Credential Exposure Prevention**
- **Issue**: Database and email credentials were hardcoded in PHP files
- **Fix**: Moved to `.env` file with example `.env.example` provided
- **Action Required**: Copy `.env.example` to `.env` and fill in credentials

**Before (Vulnerable):**
```php
$mail->Username = 'paquitospizza0@gmail.com';
$mail->Password = 'lphs lbzs vhhj ndvo';
```

**After (Secure):**
```php
// In .env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. **Input Validation**
- **Issue**: User input was not validated or type-checked
- **Fix**: Implemented comprehensive validation functions in `security_helper.php`
- **Helper File**: `security_helper.php`

**Examples:**
```php
// Validate integer
$product_id = SecurityHelper::validateInteger($_POST['pid']);

// Validate email
if (!SecurityHelper::validateEmail($email)) {
    $error = 'Invalid email format';
}

// Validate required fields
$missing = SecurityHelper::validateRequired($_POST, ['name', 'email']);
if (!empty($missing)) {
    $error = 'Missing: ' . implode(', ', $missing);
}
```

### 5. **File Upload Security**
- **Issue**: No validation on file type, size, or path
- **Fix**: Created `FileUploadHandler` class with comprehensive validation
- **Helper File**: `file_upload_handler.php`

**Features:**
- MIME type validation
- File size limits (5MB default)
- Directory traversal prevention
- Unique filename generation

**Usage:**
```php
require 'file_upload_handler.php';
$uploader = new FileUploadHandler();
$result = $uploader->upload($_FILES['image']);

if ($result['success']) {
    echo "File uploaded: " . $result['filename'];
} else {
    echo "Error: " . $result['error'];
}
```

### 6. **Password Hashing** (Recommended for future)
- **Current**: Using SHA1 for backward compatibility
- **Recommended**: Migrate to `password_hash()` for new installations
- **Usage**:
```php
// Hash password
$hash = SecurityHelper::hashPassword($password);

// Verify password
if (SecurityHelper::verifyPassword($password, $hash)) {
    // Password correct
}
```

---

## Security Helper Classes

### `db_helper.php`
Provides safe database query execution with prepared statements.

**Functions:**
- `executeQuery($query, $types, $params)` - SELECT queries
- `executeUpdate($query, $types, $params)` - INSERT/UPDATE/DELETE
- `fetchOne($query, $types, $params)` - Fetch single row
- `fetchAll($query, $types, $params)` - Fetch multiple rows
- `getError()` - Get last error message

**Type String:**
- `s` = string
- `i` = integer
- `d` = double/float
- `b` = blob

### `security_helper.php`
Provides validation, sanitization, and output escaping.

**Functions:**
- `escape($value)` - Safely escape HTML
- `validateEmail($email)` - Validate email format
- `validateInteger($value)` - Validate and convert to integer
- `validateString($value, $min, $max)` - Validate string length
- `sanitizeString($value)` - Sanitize input
- `validatePhone($phone)` - Validate phone number
- `hashPassword($password)` - Hash password with bcrypt
- `verifyPassword($password, $hash)` - Verify password
- `generateCSRFToken()` - Generate CSRF token
- `verifyCSRFToken($token)` - Verify CSRF token

### `file_upload_handler.php`
Provides secure file upload handling.

**Methods:**
- `upload($file, $custom_dir)` - Upload and validate file
- `delete($filename, $custom_dir)` - Delete file safely
- `setMaxSize($bytes)` - Set maximum file size
- `setAllowedTypes($types)` - Set allowed MIME types

---

## Fixed Files

| File | Issues Fixed | Severity |
|------|-------------|----------|
| `admin_login.php` | SQL Injection, XSS | CRITICAL |
| `user_login.php` | SQL Injection, Input Validation | CRITICAL |
| `index.php` | XSS in Session Message | HIGH |
| `product_details.php` | SQL Injection, Missing Null Checks, XSS | CRITICAL |
| `customer_menu.php` | SQL Injection, XSS, Deprecated Functions | CRITICAL |

---

## Files Requiring Additional Fixes

The following files still need to be updated with prepared statements and input validation:

1. **admin_products.php**
   - Multiple SQL injection points
   - File upload vulnerability
   - Priority: CRITICAL

2. **process_order.php**
   - SQL injection in order processing
   - Missing input validation
   - Priority: CRITICAL

3. **cart.php**
   - Multiple SQL injection points
   - Missing error handling
   - Priority: HIGH

4. **admin_orders.php**
   - LIKE clause SQL injection in search
   - Priority: HIGH

5. **admin_add_product.php**
   - File upload vulnerability
   - SQL injection
   - Priority: HIGH

---

## Best Practices for Future Development

### 1. Always Use Prepared Statements
```php
// WRONG
$query = "SELECT * FROM users WHERE id = $id";

// RIGHT
$query = "SELECT * FROM users WHERE id = ?";
$result = executeQuery($query, "i", [$id]);
```

### 2. Always Escape Output
```php
// WRONG
echo $user['name'];

// RIGHT
echo SecurityHelper::escape($user['name']);
```

### 3. Validate All User Input
```php
// Check type
$id = SecurityHelper::validateInteger($_POST['id']);
if ($id === false) {
    die('Invalid ID');
}

// Check email
if (!SecurityHelper::validateEmail($_POST['email'])) {
    die('Invalid email');
}

// Check required fields
$missing = SecurityHelper::validateRequired($_POST, ['name', 'email']);
if (!empty($missing)) {
    die('Missing fields: ' . implode(', ', $missing));
}
```

### 4. Handle Errors Gracefully
```php
$result = executeQuery($query, "s", [$value]);

if (!$result) {
    error_log("Database error: " . getError());
    die('An error occurred. Please try again.');
}
```

### 5. Use Environment Variables for Secrets
```php
// Store in .env file
DB_HOST=localhost
DB_NAME=pizza_pizza
DB_USER=root
DB_PASS=

// Access in code
$db_host = $_ENV['DB_HOST'] ?? 'localhost';
```

### 6. Implement CSRF Protection
```php
// Generate token for form
<input type="hidden" name="csrf_token" value="<?php echo SecurityHelper::generateCSRFToken(); ?>">

// Verify on form submission
if (!SecurityHelper::verifyCSRFToken($_POST['csrf_token'] ?? '')) {
    die('CSRF token invalid');
}
```

---

## Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your credentials:**
   ```
   DB_HOST=127.0.0.1
   DB_NAME=pizza_pizza
   DB_USER=root
   DB_PASS=
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

3. **Never commit `.env` to version control!**
   - Add to `.gitignore`

---

## Testing Security

### Test SQL Injection Prevention
Try entering `' OR '1'='1` in login form - should be treated as literal string.

### Test XSS Prevention
Try entering `<script>alert('XSS')</script>` - should be displayed as text, not executed.

### Test File Upload Validation
Try uploading a `.php` file - should be rejected.

---

## Future Improvements

1. **Implement CSRF tokens** on all forms
2. **Rate limiting** on login attempts
3. **Two-factor authentication** for admin panel
4. **HTTPS enforcement** in production
5. **Security headers** (CSP, X-Frame-Options, etc.)
6. **Input/Output logging** for audit trail
7. **Regular security audits** and penetration testing
8. **Migrate to password_hash()** for all new passwords

---

## Support

For questions about security implementation, refer to:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PHP Security](https://www.php.net/manual/en/security.php)
- [CWE - Common Weakness Enumeration](https://cwe.mitre.org/)

---

**Last Updated:** 2026-08-29  
**Security Level:** Medium (Further hardening recommended)
