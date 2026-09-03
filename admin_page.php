<?php
include 'config.php';
session_start();

$admin_id = $_SESSION['admin_id'];

if (!isset($admin_id)) {
   header('location:admin_login.php');
   exit(); 
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Dashboard</title>

   <!-- Font Awesome CDN link -->
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">

   <!-- Custom admin style link -->
   <link rel="stylesheet" href="css/admin_style.css">

   <style>
      main {
         margin-left: 250px;
   
         margin-right: 0px;
         padding: 20px;
         width: calc(100% - 250px);
         background-color: #f9f9f9;
         min-height: 100vh;
      }
   </style>
</head>

<body>
   <main>
      <?php include 'admin_header.php'; ?>

      <section class="dashboard">
         <h1 class="heading">Dashboard</h1>

         <div class="box-container">

            <div class="box">
               <?php
               $total_pendings = 0;

               $select_pendings_query = "SELECT * FROM `orders` WHERE payment_status = ?";
               $stmt = mysqli_prepare($conn, $select_pendings_query);

               mysqli_stmt_bind_param($stmt, "s", $payment_status);

               $payment_status = 'pending';

               mysqli_stmt_execute($stmt);

               $result = mysqli_stmt_get_result($stmt);

               if (mysqli_num_rows($result) > 0) {

                  while ($fetch_pendings = mysqli_fetch_assoc($result)) {
                     $total_pendings += $fetch_pendings['total_price'];
                  }
               }
               ?>

               <h3>₱<?= number_format($total_pendings, 2); ?></h3>
               <p>Total Pending Orders</p>
               <a href="admin_orders.php" class="btn">See Orders</a>
            </div>

            <div class="box">
               <?php
               $total_completes = 0;

               $select_completes_query = "SELECT * FROM `orders` WHERE payment_status = 'completed'";

               $result = mysqli_query($conn, $select_completes_query);

               if (mysqli_num_rows($result) > 0) {

                  while ($fetch_completes = mysqli_fetch_assoc($result)) {
                     $total_completes += $fetch_completes['total_price'];
                  }
               }
               ?>

               <h3>₱<?= number_format($total_completes, 2); ?></h3>
               <p>Total Completed Orders</p>
               <a href="admin_orders.php" class="btn">See Orders</a>
            </div>

            <div class="box">
               <?php
        
               $select_orders_query = "SELECT * FROM `orders`";
               $result = mysqli_query($conn, $select_orders_query);
               $number_of_orders = mysqli_num_rows($result);
               ?>
               <h3><?= $number_of_orders; ?></h3>
               <p>Orders Placed</p>
               <a href="admin_orders.php" class="btn">See Orders</a>
            </div>

         
            <div class="box">
               <?php
               $select_products_query = "SELECT * FROM `products`";
               $result = mysqli_query($conn, $select_products_query);
               $number_of_products = mysqli_num_rows($result);
               ?>
               <h3><?= $number_of_products; ?></h3>
               <p>Products Added</p>
               <a href="admin_products.php" class="btn">See Products</a>
            </div>

            <div class="box">
               <?php
               $select_users_query = "SELECT * FROM `user`";
               $result = mysqli_query($conn, $select_users_query);
               $number_of_users = mysqli_num_rows($result);
               ?>
               <h3><?= $number_of_users; ?></h3>
               <p>Normal Users</p>
               <a href="users_accounts.php" class="btn">See Users</a>
            </div>

  
            <div class="box">
               <?php
               $select_admins_query = "SELECT * FROM `admin`";
               $result = mysqli_query($conn, $select_admins_query);
               $number_of_admins = mysqli_num_rows($result);
               ?>
               <h3><?= $number_of_admins; ?></h3>
               <p>Admin Users</p>
               <a href="admin_accounts.php" class="btn">See Admins</a>
            </div>
         </div>
      </section>
   </main>

   <script src="js/admin_script.js"></script>
</body>

</html>
