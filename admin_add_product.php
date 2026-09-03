<?php
include 'config.php';
session_start();

$admin_id = $_SESSION['admin_id'];

if (!isset($admin_id)) {
   header('location:admin_login.php');
}


if (isset($_POST['add_product'])) {
   $name = $_POST['name'];
   $name = filter_var($name, FILTER_SANITIZE_STRING);

   $price = $_POST['price'];
   $price = filter_var($price, FILTER_SANITIZE_STRING);

   $quantity = $_POST['quantity'];
   $quantity = filter_var($quantity, FILTER_SANITIZE_NUMBER_INT);

   $description = $_POST['description'];
   $description = filter_var($description, FILTER_SANITIZE_STRING);

   $image = $_FILES['image']['name'];
   $image = filter_var($image, FILTER_SANITIZE_STRING);
   $image_size = $_FILES['image']['size'];
   $image_tmp_name = $_FILES['image']['tmp_name'];
   $image_folder = 'uploaded_img/' . $image;

   $created_at = date('Y-m-d H:i:s');

   $select_product_query = "SELECT * FROM `products` WHERE name = '$name'";
   $select_product_result = mysqli_query($conn, $select_product_query);

   if (mysqli_num_rows($select_product_result) > 0) {
      $message[] = 'Product name already exists!';
   } else {
      if ($image_size > 2000000) {
         $message[]  = 'Image size is too large!';
      } else {
         $insert_product_query = "INSERT INTO `products`(name, price, quantity, description, image, date) 
                                  VALUES('$name', '$price', '$quantity', '$description', '$image', '$created_at')";
         $insert_product_result = mysqli_query($conn, $insert_product_query);

         if ($insert_product_result) {
            move_uploaded_file($image_tmp_name, $image_folder);
            $message[]  = 'New product added!';
         } else {
            $message[] = 'Failed to add product!';
         }
      }
   }
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Add Product</title>

   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
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

      .heading {
         text-align: center;
         font-size: 2.5rem;
         margin-bottom: 20px;
         color: #2c3e50;
      }

      .add-products {
         margin-top: 50px;
         width: 100%;
         padding: 30px;
         background-color: #fff;
         border-radius: 10px;
         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
         display: flex;
         flex-direction: column;
         align-items: center;
         box-sizing: border-box;
      }

      .add-products input,
      .add-products textarea {
         width: 100%;
         padding: 12px;
         margin: 10px 0;
         border-radius: 5px;
         border: 1px solid #ddd;
         font-size: 1rem;
         transition: 0.3s ease;
         box-sizing: border-box;
      }

      .box {
         background-color: #f9f9f9;
         border: 1px solid #ddd;
         border-radius: 8px;
         box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
      }

      @media (max-width: 768px) {
         .heading {
            font-size: 2rem;
         }

         .add-products {
            padding: 20px;
         }
      }


      .form-container {
         width: 80%;
         max-width: 800px;
         margin: 20px auto;
         padding: 20px;
         background-color: #fff;
         border-radius: 8px;

      }

      .form-row {
         display: flex;
         gap: 30px;
         align-items: flex-start;
      }

      .image-column {
         flex: 1;
         max-width: 300px;
      }

      .details-column {
         flex: 2;
      }

      .image-preview {
         width: 100%;
         min-height: 200px;
         border: 2px dashed #ddd;
         border-radius: 8px;
         display: flex;
         align-items: center;
         justify-content: center;
         margin-bottom: 10px;
         overflow: hidden;
      }

      .image-preview img {
         max-width: 100%;
         max-height: 200px;
         object-fit: contain;
      }

      .file-input-container {
         width: 100%;
         margin-top: 10px;
      }


      .submit-btn {
         width: 100%;
         padding: 12px;
         background-color: #4CAF50;
         color: white;
         border: none;
         border-radius: 4px;
         cursor: pointer;
         font-size: 16px;
         margin-top: 20px;
      }

      .submit-btn:hover {
         background-color: #45a049;
      }

      .add-products form .box {
         width: 100%;
         padding: 1.4rem;
         font-size: 1rem;
         padding: 12px;
         margin: 10px 0;
         border-radius: 5px;
         border: 1px solid #ddd;
         margin: 1rem 0;
         background-color: var(--white);
      }

      .alert-success {
         background-color: #dff0d8;
         color: #3c763d;
         padding: 10px;
         border-radius: 5px;
         margin-top: 15px;
         text-align: center;

      }

      section {
         max-height: 600px;
      }

      .form-container {
         min-height: 60%;
         display: flex;
         align-items: center;
         justify-content: center;
      }
   </style>
</head>

<body>

   <main>
      <?php include 'admin_header.php'; ?>

      <section class="add-products">
         <h1 class="heading">Add New Product</h1>


         <div class="form-container">
            <form method="POST" enctype="multipart/form-data">
               <div class="form-row">
                  <div class="image-column">
                     <div class="image-preview" id="imagePreview">
                        <span>Preview Image</span>
                     </div>
                     <div class="file-input-container">
                        <input type="file" name="image" accept="image/*" class="form-control" required>
                     </div>
                  </div>
                  <div class="details-column">
                     <input type="text" placeholder="Enter product name" name="name" required>
                     <input type="number" placeholder="Enter product price" name="price" required>
                     <input type="number" placeholder="Enter product quantity" name="quantity" required>
                     <textarea class="box" required maxlength="500" placeholder="Enter product description" name="description"></textarea>


                     <button type="submit" name="add_product" class="submit-btn">Add Product</button>
                  </div>
               </div>
            </form>
         </div>
      </section>
   </main>
   <script>

      document.querySelector('input[name="image"]').addEventListener('change', function(e) {
         const preview = document.getElementById('imagePreview');
         const file = e.target.files[0];
         if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
               preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            }
            reader.readAsDataURL(file);
         }
      });
   </script>
   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>