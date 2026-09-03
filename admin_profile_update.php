<?php
include 'config.php';

session_start();

$admin_id = $_SESSION['admin_id'];

if (!isset($admin_id)) {
   header('location:admin_login.php');
   exit(); // Stop the script after redirection
}


if (isset($_POST['update'])) {
   // Sanitize name input
   $name = $_POST['name'];
   $name = filter_var($name, FILTER_SANITIZE_STRING);

   // Update admin name
   $update_profile_name_query = "UPDATE `admin` SET name = '$name' WHERE id = $admin_id";
   mysqli_query($conn, $update_profile_name_query);

   // Password update logic
   $prev_pass = $_POST['prev_pass'];
   $old_pass = sha1($_POST['old_pass']);
   $old_pass = filter_var($old_pass, FILTER_SANITIZE_STRING);
   $new_pass = sha1($_POST['new_pass']);
   $new_pass = filter_var($new_pass, FILTER_SANITIZE_STRING);
   $confirm_pass = sha1($_POST['confirm_pass']);
   $confirm_pass = filter_var($confirm_pass, FILTER_SANITIZE_STRING);
   $empty_pass = 'da39a3ee5e6b4b0d3255bfef95601890afd80709';

   // Checking and updating the password
   if ($old_pass != $empty_pass) {
      // Check if old password matches the previous one
      if ($old_pass != $prev_pass) {
         $message[] = 'Old password not matched!';
      } elseif ($new_pass != $confirm_pass) {
         // Check if new and confirm passwords match
         $message[] = 'Confirm password not matched!';
      } else {
         // If a new password is provided, update it
         if ($new_pass != $empty_pass) {
            $update_admin_pass_query = "UPDATE `admin` SET password = '$confirm_pass' WHERE id = $admin_id";
            mysqli_query($conn, $update_admin_pass_query);
            $message[] = 'Password updated successfully!';
         } else {
            $message[] = 'Please enter a new password!';
         }
      }
   } else {
      $message[] = 'Please enter old password!';
   }
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>admin profile update</title>

   <!-- font awesome cdn link  -->
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">

   <!-- custom admin style link  -->
   <link rel="stylesheet" href="css/admin_style.css">
   <style>
      html,
      body {
         margin: 0;
         padding: 0;
         height: 100%;
         overflow: hidden;
      }

      body {
         font-family: 'Roboto', sans-serif;
         background-color: #f9fafc;
         color: #333;
         padding: 20px;
         display: flex;
         flex-direction: column;
      }

      main {
         flex: 1 1 auto;
         overflow-y: auto;
         margin-top: 80px;
         margin-left: 250px;
         padding: 20px;
         width: calc(100% - 250px);
         background-color: #fff;
         box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
         border-radius: 8px;
      }
      .form-container {
         width: 100%;
         max-width: 800px;
         margin: 20px auto;
         padding: 20px;
         background-color: #fff;
         border-radius: 8px;
        
      }
        .form-container h2 {
            text-align: center;
            margin-bottom: 20px;
            font-size: 24px;
            color: #333;
        }

        .form-container .form-group {
            margin-bottom: 15px;
        }

        .form-container label {
            display: block;
            font-size: 14px;
            color: #555;
            margin-bottom: 5px;
        }

        .form-container input {
            width: 100%;
            padding: 12px;
            font-size: 14px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }

        .form-container button {
            width: 100%;
            padding: 12px;
            background-color: #4CAF50;
            color: #ffffff;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }

        .form-container button:hover {
            background-color: #0056b3;
        }

        .message {
            text-align: center;
            margin-bottom: 20px;
        }

        .message p {
            margin: 0;
            padding: 10px;
            font-size: 14px;
            color: #fff;
            border-radius: 5px;
        }

        .message p.success {
            background-color: #4caf50;
        }

        .message p.error {
            background-color: #f44336;
        }
        .form-container {
            min-height: 50vh;
        }
        label{
         text-align: start;
        }

   </style>
</head>

<body>
   <main>
      <?php include 'admin_header.php' ?>
     
      <div class="form-container">
      

        <?php if (!empty($message)) : ?>
            <div class="message">
                <?php foreach ($message as $msg) : ?>
                    <p class="<?= strpos($msg, 'successfully') !== false ? 'success' : 'error' ?>"><?= $msg; ?></p>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <form method="POST">
        <h2>Update Profile</h2>
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" value="<?= htmlspecialchars($fetch_profile['name'] ?? '') ?>" required>
            </div>
            <input type="hidden" name="prev_pass" value="<?= $fetch_profile['password'] ?? '' ?>">
            <div class="form-group">
                <label for="old_pass">Old Password</label>
                <input type="password" id="old_pass" name="old_pass" required>
            </div>
            <div class="form-group">
                <label for="new_pass">New Password</label>
                <input type="password" id="new_pass" name="new_pass" required>
            </div>
            <div class="form-group">
                <label for="confirm_pass">Confirm New Password</label>
                <input type="password" id="confirm_pass" name="confirm_pass" required>
            </div>
            <button type="submit" name="update">Update Now</button>
        </form>
    </div>

      <script src="js/admin_script.js"></script>
   </main>
</body>

</html>