# Pizza ETR - Developer Reference Guide

Quick reference for common secure coding patterns in this project.

---

## 🔐 Most Common Patterns

### Pattern 1: Include Security Headers

**Every PHP file should include these headers at the top:**

```php
<?php
include 'config.php';
include 'db_helper.php';
include 'security_helper.php';

session_start();

// Validate session if needed
if (!isset($_SESSION['user_id'])) {
    header('location:user_login.php');
    exit();
}
?>
```

---

### Pattern 2: Validate Input

**Before using any $_POST or $_GET data:**

```php
// Single field validation
$id = SecurityHelper::validateInteger($_POST['id']);
if ($id === false) {
    die('Invalid ID');
}

// Multiple required fields
$required = ['email', 'name', 'phone'];
$missing = SecurityHelper::validateRequired($_POST, $required);
if (!empty($missing)) {
    die('Missing fields: ' . implode(', ', $missing));
}

// Sanitize text input
$name = SecurityHelper::sanitizeString($_POST['name']);

// Validate email
if (!SecurityHelper::validateEmail($_POST['email'])) {
    die('Invalid email format');
}

// Validate phone
if (!SecurityHelper::validatePhone($_POST['phone'])) {
    die('Invalid phone number');
}
```

---

### Pattern 3: Database Queries

**Always use prepared statements:**

```php
// SELECT query
$query = "SELECT * FROM users WHERE id = ? AND status = ?";
$result = executeQuery($query, "is", [$user_id, 'active']);
if ($result) {
    while ($row = $result->fetch_assoc()) {
        // Process row
    }
}

// Single row
$query = "SELECT * FROM users WHERE email = ?";
$user = fetchOne($query, "s", [$email]);
if ($user) {
    // Process user
}

// All rows
$query = "SELECT * FROM products WHERE category = ?";
$products = fetchAll($query, "s", [$category]);

// INSERT/UPDATE/DELETE
$query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
if (executeUpdate($query, "sss", [$name, $email, $hash])) {
    $new_id = lastInsertId();
}

// UPDATE with multiple fields
$query = "UPDATE products SET name = ?, price = ? WHERE id = ?";
executeUpdate($query, "sdi", [$name, $price, $product_id]);

// DELETE
$query = "DELETE FROM cart WHERE id = ? AND user_id = ?";
executeUpdate($query, "ii", [$cart_id, $user_id]);
```

**Type Codes:**
- `s` = string
- `i` = integer
- `d` = double/float
- `b` = blob

---

### Pattern 4: Output Data Safely

**Always escape when displaying data:**

```php
// HTML context
<div><?php echo SecurityHelper::escape($product['name']); ?></div>

// HTML attribute
<img src="uploads/<?php echo SecurityHelper::escape($filename); ?>">

// JavaScript context (use JSON encoding)
<script>
  const data = <?php echo json_encode($data, JSON_HEX_QUOT | JSON_HEX_TAG); ?>;
  alert(<?php echo json_encode($message, JSON_HEX_QUOT); ?>);
</script>

// For database: store as-is, escape on output
echo SecurityHelper::escape($row['value']);
```

---

### Pattern 5: Handle Errors Gracefully

**Always check query results:**

```php
$query = "SELECT * FROM products WHERE id = ?";
$result = executeQuery($query, "i", [$product_id]);

// Check if query executed successfully
if (!$result) {
    error_log("Database error: " . getError());
    die('An error occurred. Please try again.');
}

// Check if records found
if ($result->num_rows === 0) {
    die('Product not found');
}

// Fetch and use data
$product = $result->fetch_assoc();
```

---

### Pattern 6: File Uploads

**Never use raw file upload:**

```php
// ❌ WRONG
move_uploaded_file($_FILES['image']['tmp_name'], 'uploads/' . $_FILES['image']['name']);

// ✅ RIGHT
require 'file_upload_handler.php';

$uploader = new FileUploadHandler();
$result = $uploader->upload($_FILES['image']);

if ($result['success']) {
    $filename = $result['filename'];
    // Save filename to database
} else {
    die('Upload failed: ' . $result['error']);
}

// To delete file later
$uploader->delete($filename);
```

---

### Pattern 7: User Registration

```php
<?php
include 'config.php';
include 'db_helper.php';
include 'security_helper.php';

session_start();

if (isset($_POST['register'])) {
    // Validate required fields
    $required = ['name', 'email', 'password', 'confirm_pass'];
    $missing = SecurityHelper::validateRequired($_POST, $required);
    
    if (!empty($missing)) {
        $error = 'Missing fields: ' . implode(', ', $missing);
    } else {
        // Sanitize input
        $name = SecurityHelper::sanitizeString($_POST['name']);
        $email = SecurityHelper::sanitizeString($_POST['email']);
        $pass = SecurityHelper::sanitizeString($_POST['password']);
        $confirm = SecurityHelper::sanitizeString($_POST['confirm_pass']);
        
        // Validate input
        if (!SecurityHelper::validateString($name, 1, 50)) {
            $error = 'Name must be 1-50 characters';
        } else if (!SecurityHelper::validateEmail($email)) {
            $error = 'Invalid email format';
        } else if ($pass !== $confirm) {
            $error = 'Passwords do not match';
        } else if (strlen($pass) < 6) {
            $error = 'Password must be at least 6 characters';
        } else {
            // Check if email exists
            $check = fetchOne("SELECT id FROM users WHERE email = ?", "s", [$email]);
            
            if ($check) {
                $error = 'Email already registered';
            } else {
                // Hash password and insert
                $hash = SecurityHelper::hashPassword($pass); // or sha1() for compatibility
                $success = executeUpdate(
                    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                    "sss",
                    [$name, $email, $hash]
                );
                
                if ($success) {
                    $_SESSION['message'] = 'Registration successful! Please log in.';
                    header('location:user_login.php');
                    exit();
                } else {
                    $error = 'Registration failed. Please try again.';
                }
            }
        }
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Register</title>
</head>
<body>
    <?php if (isset($error)): ?>
        <p style="color: red;"><?php echo SecurityHelper::escape($error); ?></p>
    <?php endif; ?>
    
    <form method="POST">
        <input type="text" name="name" required placeholder="Full Name">
        <input type="email" name="email" required placeholder="Email">
        <input type="password" name="password" required placeholder="Password">
        <input type="password" name="confirm_pass" required placeholder="Confirm Password">
        <button type="submit" name="register">Register</button>
    </form>
</body>
</html>
```

---

### Pattern 8: Admin Verification

```php
<?php
include 'config.php';
include 'db_helper.php';

session_start();

// Always check admin session
if (!isset($_SESSION['admin_id'])) {
    header('location:admin_login.php');
    exit();
}

$admin_id = (int)$_SESSION['admin_id'];

// Optional: Verify admin still exists in database
$admin = fetchOne("SELECT id FROM admin WHERE id = ?", "i", [$admin_id]);
if (!$admin) {
    session_destroy();
    header('location:admin_login.php');
    exit();
}

// Now safe to proceed
?>
```

---

### Pattern 9: Form with CSRF Token (Recommended)

```php
// Generate token
<?php
session_start();
$token = SecurityHelper::generateCSRFToken();
?>

<!-- In form -->
<form method="POST">
    <input type="hidden" name="csrf_token" value="<?php echo $token; ?>">
    <!-- other fields -->
</form>

// Verify on submission
<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!SecurityHelper::verifyCSRFToken($_POST['csrf_token'] ?? '')) {
        die('CSRF token invalid');
    }
    // Process form
}
?>
```

---

### Pattern 10: Message Handling

```php
// Set message (safe to use user input)
$_SESSION['message'] = 'Product added successfully';

// Display message (safely escaped)
<?php
if (isset($_SESSION['message'])) {
    $msg = $_SESSION['message'];
    echo "<script>alert(" . json_encode($msg, JSON_HEX_QUOT | JSON_HEX_TAG) . ");</script>";
    unset($_SESSION['message']);
}
?>
```

---

## 🚫 Common Mistakes to Avoid

| ❌ WRONG | ✅ RIGHT |
|---------|----------|
| `"SELECT * FROM t WHERE id = '$id'"` | Use prepared statements |
| `echo $data;` | `echo SecurityHelper::escape($data);` |
| `$id = $_POST['id'];` | `$id = SecurityHelper::validateInteger($_POST['id']);` |
| `move_uploaded_file($tmp, 'upload/' . $_FILES['name'])` | Use FileUploadHandler |
| Store `password = "secret"` in PHP | Use .env file or environment variables |
| `mysqli_real_escape_string()` | Use prepared statements |
| Direct `require $_GET['page']` | Whitelist allowed pages |
| `session_id` from GET/POST | Only use $_SESSION |
| No null checks after queries | Always check result and num_rows |
| Log sensitive data | Only log errors, never credentials |

---

## 🔍 Security Checklist

Before committing code:

- [ ] All database queries use prepared statements
- [ ] All output is escaped with SecurityHelper::escape()
- [ ] All input is validated with SecurityHelper methods
- [ ] All files use proper includes (db_helper, security_helper)
- [ ] Session checks are in place where needed
- [ ] Error messages don't expose system information
- [ ] File uploads use FileUploadHandler
- [ ] No hardcoded credentials in code
- [ ] No deprecated mysqli functions (real_escape_string)
- [ ] No direct $_GET/$_POST in SQL or output
- [ ] No error details shown to users
- [ ] All messages are properly escaped

---

## 🆘 Getting Help

**For database functions:**
See `db_helper.php` documentation

**For validation/escaping:**
See `security_helper.php` documentation

**For file uploads:**
See `file_upload_handler.php` documentation

**For general security:**
See `SECURITY.md` comprehensive guide

---

## 📞 Quick Function Reference

### Database Functions
```php
executeQuery($query, $types, $params)      // SELECT
executeUpdate($query, $types, $params)     // INSERT/UPDATE/DELETE
fetchOne($query, $types, $params)          // Get 1 row
fetchAll($query, $types, $params)          // Get all rows
lastInsertId()                              // Get inserted ID
affectedRows()                              // Rows affected
getError()                                  // Last error
```

### Security Functions
```php
escape($value)                   // Safe HTML output
sanitizeString($value)           // Sanitize input
validateInteger($value)          // Validate int
validateEmail($email)            // Validate email
validatePhone($phone)            // Validate phone
validateString($val, $min, $max) // Validate string length
validateRequired($data, $fields) // Check required fields
hashPassword($pass)              // Hash password (bcrypt)
verifyPassword($pass, $hash)     // Verify password
generateCSRFToken()              // Create CSRF token
verifyCSRFToken($token)          // Verify CSRF token
```

### File Upload Functions
```php
$uploader = new FileUploadHandler();
$uploader->upload($_FILES['file'])   // Upload and validate
$uploader->delete($filename)         // Delete file
$uploader->setMaxSize($bytes)        // Set max size
$uploader->setAllowedTypes($types)   // Set MIME types
```

---

**Happy Secure Coding! 🔒**
