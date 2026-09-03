<?php
include 'config.php';

session_start();
include 'customer_header.php';
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
<section class="about" id="about">
   <br><br>
   <h1 class="heading">About Us</h1>

   <div class="box-container">
      <div class="box">
         <img src="images/order to bake.png" alt="">
         <h3>Order to Bake</h3>
         <p style="margin-bottom: 15px;">"Order to Make" service, simply select your favorite pizza from our tempting menu, and we'll start crafting it immediately. No waiting required! Preparing your pizza right away, ensuring it's made to perfection with fresh ingredients</p>
         <a href="customer_menu.php" class="btn">Our menu</a>
      </div>

      <div class="box">
         <img src="images/dine-delivery.png" alt="">
         <h3>Serve Dine-In or for Delivery</h3>
         <p>Prefer to dine in? Visit our cozy restaurant ambiance, where you can savor your pizza hot out of the oven. If you're staying in, no worries! We offer convenient delivery options straight to your doorstep. </p>
         <a href="customer_menu.php" class="btn">Our menu</a>
      </div>

      <div class="box">
         <img src="images/Share with friends.png" alt="">
         <h3>Share with Friends</h3>
         <p>Pizza is best enjoyed with good company! Invite your friends over for a pizza party and share the joy of Paquito's delicious creations. With a variety of flavors to choose from. Let the good times and great pizza roll!</p>
         <a href="customer_menu.php" class="btn">Our menu</a>
      </div>
   </div>
</section>

<section class="footer">

      <div class="box-container">

         <div class="box">
            <i class="fas fa-phone"></i>
            <h3>Phone number</h3>
            <p style="margin-bottom: 32px;color: #008C3B;">+63-961-783-2752</p>

         </div>

         <div class="box">
            <i class="fas fa-map-marker-alt"></i>
            <h3>Our Address</h3>
            <p><a href="https://maps.app.goo.gl/8KxHL53jjt171Ds69" style="color: #008C3B;">Poblacion West, Santa Maria, Pangasinan</a></p>
         </div>

         <div class="box">
            <i class="fas fa-clock"></i>
            <h3>Opening hours</h3>
            <p style="color: #008C3B;">08:00am to 05:30pm</p>
            <p style="color: #008C3B;">Mon - Sat</p>
         </div>

         <div class="box">
            <i class="fas fa-envelope"></i>
            <h3>Social Medias</h3>
            <div class="socials">
               <p><i class="social fab fa-facebook"></i><a href="https://www.facebook.com/paquitospizza?mibextid=ZbWKwL" style="color: #008C3B;">Paquitos Pizza</a></p>
               <p><i class="social fas fa-envelope"></i><a href="paquitos.pizza@gmail.com" style="color: #008C3B;">paquitos.pizza@gmail.com</a> </p>
            </div>

         </div>


      </div>

      <div class="credit">
         &copy; copyright @ <?= date('Y'); ?> <span> Paquito's Pizza. </span> | All rights reserved!
      </div>

   </section>
<script src="js/script.js"></script>

</body>
</html>
