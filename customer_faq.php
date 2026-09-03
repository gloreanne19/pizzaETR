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
<section class="faq" id="faq">
      <br><br>
      <h1 class="heading">FAQ</h1>

      <div class="accordion-container">

         <div class="accordion active">
            <div class="accordion-heading">
               <span>What sets Paquito's Pizza apart from other pizza places?</span>
               <i class="fas fa-angle-down"></i>
            </div>
            <p class="accrodion-content">
               At Paquito's Pizza, we pride ourselves on our "Order to Bake" service. This means that once you place your order, we start crafting your pizza immediately, ensuring it's made to perfection with fresh ingredients and expert techniques. No waiting required!
            </p>
         </div>

         <div class="accordion">
            <div class="accordion-heading">
               <span>Can I enjoy Paquito's Pizza in the comfort of my own home?</span>
               <i class="fas fa-angle-down"></i>
            </div>
            <p class="accrodion-content">
               Absolutely! We offer convenient delivery options straight to your doorstep. So whether you're craving our delicious pizzas but prefer to dine in or want to enjoy them from the comfort of your own home, we've got you covered.
            </p>
         </div>

         <div class="accordion">
            <div class="accordion-heading">
               <span>Are there options for dining in at Paquito's Pizza?</span>
               <i class="fas fa-angle-down"></i>
            </div>
            <p class="accrodion-content">
               Yes, indeed! If you prefer to dine in, we invite you to visit our cozy restaurant ambiance. You can savor your pizza hot out of the oven while enjoying the friendly atmosphere of our establishment.
            </p>
         </div>

         <div class="accordion">
            <div class="accordion-heading">
               <span> Does Paquito's Pizza offer a variety of flavors to choose from?</span>
               <i class="fas fa-angle-down"></i>
            </div>
            <p class="accrodion-content">
               Definitely! We understand that pizza preferences vary, which is why we offer a wide variety of flavors on our menu. Whether you're a fan of classic pepperoni or prefer something more adventurous like our specialty gourmet pizzas, we have something to satisfy every craving.
            </p>
         </div>


         <div class="accordion">
            <div class="accordion-heading">
               <span>Can I customize my pizza with specific toppings or ingredients?</span>
               <i class="fas fa-angle-down"></i>
            </div>
            <p class="accrodion-content">
               Absolutely! We want you to enjoy your pizza just the way you like it. You can customize your pizza with a variety of toppings, sauces, and crust options from our menu. Whether you prefer classic combinations or want to get creative with your toppings, our customizable options ensure your pizza is tailored to your preferences. Just contact us for your preferred customization, and we'll be happy to accommodate your requests!
            </p>
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
   <script>

document.addEventListener("DOMContentLoaded", function () {
    const accordions = document.querySelectorAll('.accordion');

    accordions.forEach(accordion => {
        const heading = accordion.querySelector('.accordion-heading');

        heading.addEventListener('click', function () {
            accordion.classList.toggle('active');

            const content = accordion.querySelector('.accrodion-content');
            if (accordion.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px"; 
            } else {
                content.style.maxHeight = "0";
            }
        });
    });
});

</script>
<script src="js/script.js"></script>
   

</body>
</html>