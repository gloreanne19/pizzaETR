<?php

include 'config.php';


session_start();

if (isset($_SESSION['message'])) {
    echo "<script>alert('" . $_SESSION['message'] . "');</script>";
    unset($_SESSION['message']);
}
include 'customer_header.php';
if (isset($_SESSION['user_id'])) {
   $user_id = $_SESSION['user_id'];
} else {
   $user_id = '';
};




if (isset($_POST['register'])) {

   $name = $_POST['name'];
   $name = filter_var($name, FILTER_SANITIZE_STRING);
   $email = $_POST['email'];
   $email = filter_var($email, FILTER_SANITIZE_STRING);
   $pass = sha1($_POST['pass']);
   $pass = filter_var($pass, FILTER_SANITIZE_STRING);
   $cpass = sha1($_POST['cpass']);
   $cpass = filter_var($cpass, FILTER_SANITIZE_STRING);

   $select_user = mysqli_prepare($conn, "SELECT * FROM `user` WHERE name = ? AND email = ?");
   mysqli_stmt_bind_param($select_user, "ss", $name, $email);
   mysqli_stmt_execute($select_user);
   $result = mysqli_stmt_get_result($select_user);

   if (mysqli_num_rows($result) > 0) {
      $message[] = 'username or email already exists!';
   } else {
      if ($pass != $cpass) {
         $message[] = 'confirm password not matched!';
      } else {
         $insert_user = mysqli_prepare($conn, "INSERT INTO `user`(name, email, password) VALUES(?,?,?)");
         mysqli_stmt_bind_param($insert_user, "sss", $name, $email, $cpass);
         mysqli_stmt_execute($insert_user);
         $message[] = 'registered successfully, login now please!';
      }
   }
}



if (isset($_GET['logout'])) {
   session_unset();
   session_destroy();
   header('location:index.php');
}

if (isset($_POST['add_to_cart'])) {

   if ($user_id == '') {
      $message[] = 'please login first!';
   } else {

      $pid = $_POST['pid'];
      $name = $_POST['name'];
      $price = $_POST['price'];
      $image = $_POST['image'];
      $qty = $_POST['qty'];
      $qty = filter_var($qty, FILTER_SANITIZE_STRING);

      // Check if item already added to cart using mysqli_query
      $select_cart = mysqli_prepare($conn, "SELECT * FROM `cart` WHERE user_id = ? AND name = ?");
      mysqli_stmt_bind_param($select_cart, "is", $user_id, $name);
      mysqli_stmt_execute($select_cart);
      $result_cart = mysqli_stmt_get_result($select_cart);

      if (mysqli_num_rows($result_cart) > 0) {
         $message[] = 'already added to cart';
      } else {
         $insert_cart = mysqli_prepare($conn, "INSERT INTO `cart`(user_id, pid, name, price, quantity, image) VALUES(?,?,?,?,?,?)");
         mysqli_stmt_bind_param($insert_cart, "iisdss", $user_id, $pid, $name, $price, $qty, $image);
         mysqli_stmt_execute($insert_cart);
         $message[] = 'added to cart!';
      }
   }
}

if (isset($_POST['order'])) {

   if ($user_id == '') {
      $message[] = 'please login first!';
   } else {
      $name = $_POST['name'];
      $name = filter_var($name, FILTER_SANITIZE_STRING);
      $number = $_POST['number'];
      $number = filter_var($number, FILTER_SANITIZE_STRING);
      $address = 'flat no.' . $_POST['flat'] . ', ' . $_POST['street'] . ' - ' . $_POST['pin_code'];
      $address = filter_var($address, FILTER_SANITIZE_STRING);
      $method = $_POST['method'];
      $method = filter_var($method, FILTER_SANITIZE_STRING);
      $total_price = $_POST['total_price'];
      $total_products = $_POST['total_products'];

      $select_cart = mysqli_prepare($conn, "SELECT * FROM `cart` WHERE user_id = ?");
      mysqli_stmt_bind_param($select_cart, "i", $user_id);
      mysqli_stmt_execute($select_cart);
      $result_cart = mysqli_stmt_get_result($select_cart);

      if (mysqli_num_rows($result_cart) > 0) {
         $insert_order = mysqli_prepare($conn, "INSERT INTO `orders`(user_id, name, number, method, address, total_products, total_price) VALUES(?,?,?,?,?,?,?)");
         mysqli_stmt_bind_param($insert_order, "isssssd", $user_id, $name, $number, $method, $address, $total_products, $total_price);
         mysqli_stmt_execute($insert_order);

         $delete_cart = mysqli_prepare($conn, "DELETE FROM `cart` WHERE user_id = ?");
         mysqli_stmt_bind_param($delete_cart, "i", $user_id);
         mysqli_stmt_execute($delete_cart);

         $message[] = 'order placed successfully!';
      } else {
         $message[] = 'your cart empty!';
      }
   }
}

?>




<?php

if (isset($_POST['add_to_favorites'])) {
    if ($user_id == '') {
        $message[] = 'Please login first!';
    } else {
        $pid = $_POST['pid'];
        $name = $_POST['name'];
        $price = $_POST['price'];
        $image = $_POST['image'];

        $check_favorites_query = "SELECT * FROM `favorites` WHERE user_id = $user_id AND product_id = $pid";
        $result_favorites = mysqli_query($conn, $check_favorites_query);

        if (mysqli_num_rows($result_favorites) > 0) {
            $delete_favorite_query = "DELETE FROM `favorites` WHERE user_id = $user_id AND product_id = $pid";
            mysqli_query($conn, $delete_favorite_query);
            $message[] = 'Removed from favorites!';
        } else {
            $insert_favorite_query = "INSERT INTO `favorites` (user_id, product_id, name, price, image) 
                                      VALUES ($user_id, $pid, '$name', $price, '$image')";
            mysqli_query($conn, $insert_favorite_query);
            $message[] = 'Added to favorites!';
        }
    }
}


if (isset($_POST['remove_from_favorites'])) {
   if ($user_id == '') {
      $message[] = 'Please login first!';
   } else {
      $pid = $_POST['pid'];

      $delete_favorite_query = "DELETE FROM `favorites` WHERE user_id = $user_id AND product_id = $pid";
      mysqli_query($conn, $delete_favorite_query);
      $message[] = 'Removed from favorites!';
   }
}


function isProductInFavorites($conn, $user_id, $product_id) {
    $check_favorites_query = "SELECT * FROM `favorites` WHERE user_id = $user_id AND product_id = $product_id";
    $result = mysqli_query($conn, $check_favorites_query);
    return mysqli_num_rows($result) > 0;
}

?>


<!DOCTYPE html>
<html lang="en">

<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Paquito's Pizza</title>
   <link rel="icon" type="image/png" href="images/pizzalogo32x32.png">
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
   <link rel="stylesheet" href="css/style.css">
</head>

<body>




   <div class="home-bg">
      <section class="home" id="home">
         <br><br><br>
         <div class="slide-container">
            <div class="slide active">
               <div class="image">
                  <img src="images/home-img-1.png" alt="">
               </div>
               <div class="content">
                  <h5>YES WE HAVE THE </h5>
                  <h3>BEST HOMEMADE PIZZA</h3>
               </div>
            </div>

            <div class="slide">
               <div class="image">
                  <img src="images/Hawaiian1.png" alt="">
               </div>
               <div class="content">
                  <h3>Hawaiian</h3>
               </div>
            </div>

            <div class="slide">
               <div class="image">
                  <img src="images/Triple Cheese.png" alt="">
               </div>
               <div class="content">
                  <h3>Triple Cheese</h3>
               </div>
            </div>
         </div>
      </section>
   </div>

   <script src="js/script.js"></script>


</body>

</html>