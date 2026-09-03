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
<section class="order" id="order">
      <br><br>
      <h1 class="heading">order now</h1>

      <form action="" method="post">

         <div class="display-orders">

            <?php
            $grand_total = 0;
            $cart_item = [];


            $select_cart_query = "SELECT * FROM `cart` WHERE user_id = ?";
            $stmt_cart = mysqli_prepare($conn, $select_cart_query);
            mysqli_stmt_bind_param($stmt_cart, 'i', $user_id);
            mysqli_stmt_execute($stmt_cart);
            $result_cart = mysqli_stmt_get_result($stmt_cart);

            if (mysqli_num_rows($result_cart) > 0) {
               while ($fetch_cart = mysqli_fetch_assoc($result_cart)) {

                  $sub_total = ($fetch_cart['price'] * $fetch_cart['quantity']);
                  $grand_total += $sub_total;


                  $cart_item[] = $fetch_cart['name'] . ' ( ' . $fetch_cart['price'] . ' x ' . $fetch_cart['quantity'] . ' ) - ';
               }

               $total_products = implode('', $cart_item);


               mysqli_data_seek($result_cart, 0);
               while ($fetch_cart = mysqli_fetch_assoc($result_cart)) {
                  echo '<p>' . $fetch_cart['name'] . ' <span>(' . $fetch_cart['price'] . ' x ' . $fetch_cart['quantity'] . ')</span></p>';
               }
            } else {
               echo '<p class="empty"><span>your cart is empty!</span></p>';
            }
            ?>


         </div>

         <div class="grand-total"> Grand Total : <span>₱<?= $grand_total; ?></span></div>

         <input type="hidden" name="total_products" value="<?= $total_products; ?>">
         <input type="hidden" name="total_price" value="<?= $grand_total; ?>">

         <div class="flex">
            <div class="inputBox">
               <span>Name :</span>
               <input type="text" name="name" class="box" required placeholder="Enter your name" maxlength="20">
            </div>
            <div class="inputBox">
               <span>Phone number :</span>
               <input type="number" name="number" class="box" required placeholder="Enter your number" min="0" max="9999999999" onkeypress="if(this.value.length == 10) return false;">
            </div>
            <div class="inputBox">
               <span>Payment Method</span>
               <select name="method" class="box">
                  <option value="Cash on delivery">Cash on delivery</option>
                  <option value="Credit card">Credit card</option>
                  <option value="gcash">Gcash</option>
                  <option value="Paypal">Paypal</option>
               </select>
            </div>
            <div class="inputBox">
               <span>Address line 01 :</span>
               <input type="text" name="flat" class="box" required placeholder="E.g. flat no." maxlength="50">
            </div>
            <div class="inputBox">
               <span>Address line 02 :</span>
               <input type="text" name="street" class="box" required placeholder="E.g. street name." maxlength="50">
            </div>
            <div class="inputBox">
               <span>Pin Code :</span>
               <input type="number" name="pin_code" class="box" required placeholder="E.g. 123456" min="0" max="999999" onkeypress="if(this.value.length == 6) return false;">
            </div>
         </div>

         <input type="submit" value="order now" class="btn" name="order">

      </form>

   </section>
</body>
</html>