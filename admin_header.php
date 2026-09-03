<?php
   if(isset($message)){
      foreach($message as $message){
         echo '
         <div class="message">
            <span>'.$message.'</span>
            <i class="fas fa-times" onclick="this.parentElement.remove();"></i>
         </div>
         ';
      }
   }
?>

<header class="header">
   <section class="flex">
      <a href="admin_page.php" class="logo">Admin<span>Panel</span></a>

      <div class="icons">
         <div id="menu-btn" class="fas fa-bars"></div>
         <div id="user-btn" class="fas fa-user"></div>
      </div>

      <div class="profile">
      <?php
$select_profile_query = "SELECT * FROM `admin` WHERE id = '$admin_id'";

$result = mysqli_query($conn, $select_profile_query);

if ($result) {
    $fetch_profile = mysqli_fetch_assoc($result);
}
?>

         <p><?= $fetch_profile['name']; ?></p>
         <a href="admin_profile_update.php" class="btn">Update Profile</a>
         <a href="logout.php" class="delete-btn">Logout</a>
         <div class="flex-btn">
            <a href="admin_login.php" class="option-btn">Login</a>
            <a href="admin_register.php" class="option-btn">Register</a>
         </div>
      </div>
   </section>
</header>

<div class="sidebar">
   <ul>
      <li><a href="admin_page.php"><i class="glyphicon glyphicon-home"></i><span>Dashboard</span></a></li>
      <li><a href="#" class="submenu-toggle"><i class="glyphicon glyphicon-th-large"></i><span>Products</span></a>
         <ul class="nav submenu">
            <li><a href="admin_products.php">Manage Product</a></li>
            <li><a href="admin_add_product.php">Add Product</a></li>
         </ul>
      </li>
      <li><a href="admin_pizza_size.php"><i class="glyphicon glyphicon-indent-left"></i><span>Size</span></a></li>
      <li><a href="admin_customization.php"><i class="glyphicon glyphicon-indent-left"></i><span>Customization</span></a></li>
      <li><a href="admin_orders.php"><i class="glyphicon glyphicon-indent-left"></i><span>Orders</span></a></li>
      <li><a href="sales.php"><i class="glyphicon glyphicon-indent-left"></i><span>Sales</span></a></li>
      <li><a href="users_accounts.php"><i class="glyphicon glyphicon-indent-left"></i><span>Users</span></a></li>
   </ul>
</div>

<style>
   .header .flex .logo {
    font-size: 2.5rem;
    color: white;
}
   body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
   }

   .header {
      background-color: #333;
      color: white;
      padding: 10px 20px;
      position: fixed;
      width: 100%;
      top: 0;
      left: 0;
      z-index: 1000;
   }

   .header .logo {
      font-size: 24px;
      color: white;
      text-decoration: none;
   }

   .header .icons {
      float: right;
      display: flex;
      align-items: center;
   }

   .header .icons div {
      font-size: 20px;
      margin-left: 20px;
      cursor: pointer;
   }

   .header .profile {
      display: none;
   }

   .sidebar {
      width: 250px;
      position: fixed;
      left: 0;
      top: 80px;
      bottom: 0;
      background-color: #333;
      color: white;
      padding-top: 20px;
      transition: all 0.3s;
   }

   .sidebar ul {
      list-style-type: none;
      padding: 0;
   }

   .sidebar ul li {
      padding: 10px;
      border-bottom: 1px solid #444;
   }

   .sidebar ul li a {
      color: white;
      text-decoration: none;
      font-size: 18px;
      display: flex;
      align-items: center;
   }

   .sidebar ul li a i {
      margin-right: 10px;
   }

   .sidebar ul li a:hover {
      background-color: #555;
   }

   .message {
      background-color: #f1f1f1;
      padding: 10px;
      margin: 20px 0;
      border-radius: 5px;
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
   }

   .message span {
      font-size: 16px;
   }

   .message i {
      cursor: pointer;
      font-size: 20px;
   }

   .btn, .delete-btn {
      padding: 8px 20px;
      margin-top: 10px;
      background-color: #333;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-size: 16px;
   }

   .btn:hover, .delete-btn:hover {
      background-color: #555;
   }

   .option-btn {
      padding: 8px 20px;
      background-color: #008CBA;
      color: white;
      text-decoration: none;
      border-radius: 5px;
   }

   .option-btn:hover {
      background-color: #005f73;
   }
</style>
