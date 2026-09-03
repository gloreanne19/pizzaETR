<?php

if (isset($_GET['logout'])) {
   session_unset();
   session_destroy();
   header("Location: index.php"); 
   exit();
}
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if (isset($message)) {
   foreach ($message as $message) {
      echo '
      <div class="message">
         <span>' . $message . '</span>
         <i class="fas fa-times" onclick="this.parentElement.remove();"></i>
      </div>
      ';
   }
}
$current_page = basename($_SERVER['PHP_SELF']);
$header_class = ($current_page == 'index.php') ? 'home-active' : 'non-home-active';
?>
<!DOCTYPE html>
<html lang="en">

<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Home</title>
   <link rel="stylesheet" href="css/style.css">
</head>

<body>
   <header class="header <?= $header_class ?>">
      <section class="flex">
         <a class="navbar-brand" href="index.php"><img src="images/paquitologo.png" alt="logo" class="img-responsive"></a>
         <nav class="navbar">
            <a href="index.php" class="<?= basename($_SERVER['PHP_SELF']) == 'index.php' ? 'active' : ''; ?>">Home</a>
            <a href="customer_menu.php" class="<?= basename($_SERVER['PHP_SELF']) == 'customer_menu.php' ? 'active' : ''; ?>">Menu</a>
            <a href="customer_about_us.php" class="<?= basename($_SERVER['PHP_SELF']) == 'customer_about_us.php' ? 'active' : ''; ?>">About</a>
            <a href="customer_faq.php" class="<?= basename($_SERVER['PHP_SELF']) == 'customer_faq.php' ? 'active' : ''; ?>">FAQ</a>



         </nav>
         <div class="icons">
            <div id="menu-btn" class="fas fa-bars"></div>
            <div id="user-btn" class="fas fa-user"></div>
            <div id="order-btn" class="fas fa-box"></div>

            <?php
            $total_cart_items = 0;
            $total_favorites = 0;

            if (!empty($user_id)) {
               $count_cart_query = "SELECT * FROM `cart` WHERE user_id = $user_id";
               $result_count_cart = mysqli_query($conn, $count_cart_query);
               $total_cart_items = mysqli_num_rows($result_count_cart);

               $count_favorites_query = "SELECT * FROM `favorites` WHERE user_id = $user_id";
               $result_count_favorites = mysqli_query($conn, $count_favorites_query);
               $total_favorites = mysqli_num_rows($result_count_favorites);
            }
            ?>

            <div id="favorites-btn" class="fas fa-heart"><span>(<?= $total_favorites; ?>)</span></div>
            <a href="cart.php">
               <div id="cart-btn" class="fas fa-shopping-cart"><span>(<?= $total_cart_items; ?>)</span></div>
            </a>
         </div>
      </section>
   </header>


   <div class="user-account">
      <section>
         <div id="close-account"><span>Close</span></div>
         <div class="user">
            <?php
            $select_user = mysqli_prepare($conn, "SELECT * FROM `user` WHERE id = ?");
            mysqli_stmt_bind_param($select_user, "i", $user_id);
            mysqli_stmt_execute($select_user);
            $result_user = mysqli_stmt_get_result($select_user);
            if (mysqli_num_rows($result_user) > 0) {
               while ($fetch_user = mysqli_fetch_assoc($result_user)) {
                  echo '<p>Welcome ! <span>' . $fetch_user['name'] . '</span></p>';
                  echo '<a href="index.php?logout" class="btn">logout</a>';
               }
            } else {
               echo '<p><span>You are not logged in now!</span></p>';
            }
            ?>
         </div>
         <div class="display-orders">
            <?php
            if ($user_id) {
               $select_cart_query = "SELECT * FROM `cart` WHERE user_id = ?";
               $stmt_cart = mysqli_prepare($conn, $select_cart_query);
               mysqli_stmt_bind_param($stmt_cart, "i", $user_id);
               mysqli_stmt_execute($stmt_cart);
               $result_cart = mysqli_stmt_get_result($stmt_cart);

               if (mysqli_num_rows($result_cart) > 0) {
                  while ($fetch_cart = mysqli_fetch_assoc($result_cart)) {
                     echo '<p>' . htmlspecialchars($fetch_cart['name']) . ' <span>(' . htmlspecialchars($fetch_cart['price']) . ' x ' . htmlspecialchars($fetch_cart['quantity']) . ')</span></p>';
                  }
               } else {
                  echo '<p><span>Your cart is empty!</span></p>';
               }
            }
            ?>
         </div>
         <div class="form-container">

            <div class="tab-buttons">
               <button class="tab-button primary" onclick="switchForm('login')">Login</button>
               <button class="tab-button secondary" onclick="switchForm('register')">Register</button>
            </div>
            <form action="user_login.php" method="post" id="login" class="form active">
               <h3>Login now</h3>
               <input type="email" name="email" required class="box" placeholder="Enter your email" maxlength="50">
               <input type="password" name="pass" required class="box" placeholder="Enter your password" maxlength="20">
               <input type="submit" value="Login" name="login" class="btn">
            </form>


            <form action="" method="post" id="register" class="form">
               <h3>Register now</h3>
               <input type="text" name="name" required class="box" placeholder="Enter your name" maxlength="50">
               <input type="email" name="email" required class="box" placeholder="Enter your email" maxlength="50">
               <input type="password" name="pass" required class="box" placeholder="Enter your password" maxlength="20">
               <input type="password" name="cpass" required class="box" placeholder="Confirm password" maxlength="20">
               <input type="submit" value="Register" name="register" class="btn">
            </form>
         </div>
      </section>
   </div>

   <div class="my-orders">
      <section>
         <div id="close-orders"><span>Close</span></div>
         <h3 class="title"> My Orders </h3>
         <?php
         $select_orders_query = "SELECT * FROM `orders` WHERE user_id = '$user_id'";
         $result_orders = mysqli_query($conn, $select_orders_query);

         if (mysqli_num_rows($result_orders) > 0) {
            while ($fetch_orders = mysqli_fetch_assoc($result_orders)) {
               $order_items_query = "SELECT * FROM `order_items` WHERE order_id = '{$fetch_orders['id']}'";
               $order_items_result = mysqli_query($conn, $order_items_query);

               $total_products = 0;
               $total_price = 0;
               $order_items_details = ''; 

               if ($order_items_result && mysqli_num_rows($order_items_result) > 0) {
                  while ($item = mysqli_fetch_assoc($order_items_result)) {
                     $total_products += $item['quantity'];
                     $total_price += $item['price'] * $item['quantity']; 

                     $size = $item['size'];
                     $customization_ids = explode(',', $item['customizations']);
                     $customization_names = [];

                     foreach ($customization_ids as $cusID) {
                        $cusID = trim($cusID);
                        $customization_query = "SELECT cusName FROM `customization` WHERE cusID = '$cusID'";
                        $customization_result = mysqli_query($conn, $customization_query);

                        if ($customization_result && mysqli_num_rows($customization_result) > 0) {
                           $customization_row = mysqli_fetch_assoc($customization_result);
                           $customization_names[] = $customization_row['cusName'];
                        }
                     }

                     $customizations_display = !empty($customization_names) ? "Customizations: " . implode(', ', $customization_names) : "No customizations";
                     $order_items_details .= "<p><strong>{$item['quantity']}x</strong> {$item['name']} ({$size}) - {$customizations_display}</p>";
                  }
               }

               echo "<div class='box'>
                        <p>Placed on : <span>{$fetch_orders['placed_on']}</span></p>
                        <p>Name : <span>{$fetch_orders['name']}</span></p>
                        <p>Number : <span>{$fetch_orders['number']}</span></p>
                        <p>Address : <span>{$fetch_orders['address']}</span></p>
                        <p>Payment method : <span>{$fetch_orders['method']}</span></p>
                        <p>Total Products : <span>{$total_products}</span></p>
                        <p>Total Price : <span>₱" . number_format($total_price, 2) . "</span></p>
                        <p>Payment Status : <span style='color:" . ($fetch_orders['payment_status'] == 'pending' ? 'red' : 'green') . "'>{$fetch_orders['payment_status']}</span></p>
                        <div>{$order_items_details}</div>";

               if ($fetch_orders['payment_status'] == 'pending') {
                  echo "<form action='cancel_order.php' method='POST' onsubmit='return confirm(\"Are you sure you want to cancel this order?\");'>
                            <input type='hidden' name='order_id' value='{$fetch_orders['id']}'>
                            <button type='submit' class='cancel-order-btn'>Cancel Order</button>
                          </form>";
               }

               echo "</div>";
            }
         } else {
            echo '<p class="empty">No orders found!</p>';
         }
         ?>
      </section>
   </div>


<div class="favorites-drawer">
   <section>
      <div id="close-favorites"><span>Close</span></div>
      <h3 class="title">My Favorites</h3>

      <?php
      if (isset($_POST['remove_from_favorites'])) {
         $product_id = mysqli_real_escape_string($conn, $_POST['pid']);
         $query_remove = "DELETE FROM `favorites` WHERE user_id = $user_id AND product_id = $product_id";
         $result_remove = mysqli_query($conn, $query_remove);

         if ($result_remove) {
            echo '<script>alert("Item removed from favorites!"); </script>';
            echo '<script>window.location.href = "customer_menu.php";</script>';
         } else {
            echo '<script>alert("Failed to remove item from favorites. Please try again.");</script>';
         }
      }

      if ($user_id) {
         $user_id = mysqli_real_escape_string($conn, $user_id);
         $query_favorites = "SELECT * FROM `favorites` WHERE user_id = $user_id";
         $result_favorites = mysqli_query($conn, $query_favorites);

         if (mysqli_num_rows($result_favorites) > 0) {
            while ($fetch_favorites = mysqli_fetch_assoc($result_favorites)) {
      ?>
               <div class="box">
                  <img src="uploaded_img/<?= htmlspecialchars($fetch_favorites['image']); ?>" alt="">
                  <div class="content">
                     <p><?= htmlspecialchars($fetch_favorites['name']); ?> <span>(₱<?= number_format($fetch_favorites['price'], 2); ?>)</span></p>

                     <form action="" method="post" class="remove-favorite-form">
                        <input type="hidden" name="pid" value="<?= $fetch_favorites['product_id']; ?>">
                        <button type="submit" class="favorite-btn-remove" name="remove_from_favorites">
                           <i class="fas fa-heart" style="color: red;"></i> Remove
                        </button>
                     </form>

                     <form action="" method="post">
                        <input type="hidden" name="pid" value="<?= $fetch_favorites['product_id']; ?>">
                        <input type="hidden" name="name" value="<?= htmlspecialchars($fetch_favorites['name']); ?>">
                        <input type="hidden" name="price" value="<?= $fetch_favorites['price']; ?>">
                        <input type="hidden" name="image" value="<?= htmlspecialchars($fetch_favorites['image']); ?>">
                        <input type="hidden" name="qty" value="1">
                        <button type="submit" class="btn" name="add_to_cart">Add to Cart</button>
                     </form>
                  </div>
               </div>
      <?php
            }
         } else {
            echo '<p class="empty"><span>No favorites added yet!</span></p>';
         }
      } else {
         echo '<p class="empty"><span>Please login to see your favorites!</span></p>';
      }
      ?>
   </section>
</div>



</body>

</html>