<?php
include 'config.php';

session_start();

$admin_id = $_SESSION['admin_id'];

if (!isset($admin_id)) {
    header('location:admin_login.php');
    exit();
}

if (isset($_POST['update_product'])) {
    $pid = $_POST['pid'];
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $price = mysqli_real_escape_string($conn, $_POST['price']);
    $description = mysqli_real_escape_string($conn, $_POST['description']);
    $quantity = (int)$_POST['quantity'];

    $old_image = $_POST['old_image'];
    $image = $_FILES['image']['name'];
    $image_tmp_name = $_FILES['image']['tmp_name'];
    $image_folder = 'uploaded_img/' . $image;

    $update_query = "UPDATE `products` SET name = '$name', price = '$price', description = '$description', quantity = $quantity WHERE id = $pid";
    mysqli_query($conn, $update_query);

    if (!empty($image)) {
        if ($_FILES['image']['size'] > 2000000) {
            $message[] = 'Image size is too large!';
        } else {
            move_uploaded_file($image_tmp_name, $image_folder);
            unlink('uploaded_img/' . $old_image);

            $update_image_query = "UPDATE `products` SET image = '$image' WHERE id = $pid";
            mysqli_query($conn, $update_image_query);

            $message[] = 'Image updated successfully!';
        }
    }

    $message[] = 'Product updated successfully!';
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update Product</title>

    <link rel="stylesheet" href="css/admin_style.css">

    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        main {
            margin-left: 250px;
            padding: 20px;
            background-color: #fff;
            min-height: 100vh;
        }

        .container {
            margin-top: 2rem;
        }

        .card {
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            background-color: #fff;
            padding: 20px;
            margin-bottom: 1.5rem;
        }

        .card-header {
            background-color: #007bff;
            color: white;
            font-weight: bold;
            text-align: center;
            padding: 10px;
            border-radius: 8px 8px 0 0;
        }

        .form-container {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
        }   

        .form-container {
            margin-top: 100px;
    min-height: 80vh; 
    display: flex
;
    align-items: center;
    justify-content: center;
}

        .image-preview-container {
            flex: 1;
            text-align: center;
        }

        .image-preview-container img {
            max-width: 100%;
            border-radius: 8px;
        }

        .form {
            flex: 2;
            width: 100%;
        }

        .form label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }

        .form input,
        .form textarea {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #ccc;
            margin-bottom: 15px;
        }

        .form textarea {
            resize: vertical;
        }

        .btn {
            padding: 10px 20px;
            border-radius: 8px;
            text-align: center;
            color: white;
            text-decoration: none;
            cursor: pointer;
        }

        .btn-primary {
            background-color: #007bff;
        }

        .btn-secondary {
            background-color: #6c757d;
        }

        .btn:hover {
            opacity: 0.9;
        }

        .d-flex {
            display: flex;
            gap: 1rem;
        }
    </style>
</head>

<body>
    <main>
        <?php include 'admin_header.php'; ?>

       
                <div class="card-body">
                    <?php
                    $update_id = $_GET['update'];
                    $select_products_query = "SELECT * FROM `products` WHERE id = $update_id";
                    $result = mysqli_query($conn, $select_products_query);

                    if (mysqli_num_rows($result) > 0) {
                        $fetch_products = mysqli_fetch_assoc($result);
                    ?>

                        <div class="form-container">
                            <div class="image-preview-container">
                                <img src="uploaded_img/<?= $fetch_products['image']; ?>" alt="Product Image">
                                <label for="image" class="btn btn-secondary mt-2">Change Image</label>
                                <input type="file" id="image" name="image" accept="image/*" class="d-none">
                            </div>

                            <form action="" method="post" enctype="multipart/form-data" class="form">
                                <input type="hidden" name="pid" value="<?= $fetch_products['id']; ?>">
                                <input type="hidden" name="old_image" value="<?= $fetch_products['image']; ?>">

                                <div class="mb-3">
                                    <label for="name">Product Name</label>
                                    <input type="text" id="name" name="name" value="<?= $fetch_products['name']; ?>" required>
                                </div>

                                <div class="mb-3">
                                    <label for="quantity">Quantity</label>
                                    <input type="number" id="quantity" name="quantity" value="<?= $fetch_products['quantity']; ?>" required>
                                </div>

                                <div class="mb-3">
                                    <label for="price">Product Price</label>
                                    <input type="number" id="price" name="price" value="<?= $fetch_products['price']; ?>" required>
                                </div>

                                <div class="mb-3">
                                    <label for="description">Product Description</label>
                                    <textarea id="description" name="description" rows="5" required><?= $fetch_products['description']; ?></textarea>
                                </div>

                                <div class="d-flex">
                                    <button type="submit" name="update_product" class="btn btn-primary">Update Product</button>
                                    <a href="admin_products.php" class="btn btn-secondary">Go Back</a>
                                </div>
                            </form>
                        </div>
                    <?php
                    } else {
                        echo '<p class="text-danger">No product found!</p>';
                    }
                    ?>
                </div>
           
        
    </main>
</body>

</html>
