<?php
session_start();
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log("POST Data: " . print_r($_POST, true));

    $user_id = $_SESSION['user_id'];
    $product_id = $_POST['product_id'];
    $quantity = $_POST['quantity'];
    $size_id = isset($_POST['size']) ? $_POST['size'] : '';
    $base_price = $_POST['base_price'];
    
    error_log("Size ID: " . $size_id);

    $customIDS = '';
    if (isset($_POST['toppings']) && is_array($_POST['toppings'])) {
        $customIDS = implode(',', array_map('intval', $_POST['toppings']));
        error_log("Custom IDs: " . $customIDS);
    }

    $product_query = "SELECT name, image FROM products WHERE id = '$product_id'";
    $product_result = mysqli_query($conn, $product_query);
    $product = mysqli_fetch_assoc($product_result);

    $total_price = $base_price;

    if (!empty($size_id)) {
        $size_query = "SELECT sizeprice FROM size WHERE sizeID = '$size_id'";
        $size_result = mysqli_query($conn, $size_query);
        if ($size_row = mysqli_fetch_assoc($size_result)) {
            $total_price += $size_row['sizeprice'];
        }
    }

    if (!empty($customIDS)) {
        $customization_query = "SELECT cusPrice FROM customization WHERE cusID IN ($customIDS)";
        $customization_result = mysqli_query($conn, $customization_query);
        while ($row = mysqli_fetch_assoc($customization_result)) {
            $total_price += $row['cusPrice'];
        }
    }

    $total_price *= $quantity;

    $insert_query = "INSERT INTO cart (user_id, pid, name, price, quantity, image, sizeID, customIDS) 
                    VALUES ('$user_id', '$product_id', '{$product['name']}', '$total_price', 
                            '$quantity', '{$product['image']}', '$size_id', '$customIDS')";

    error_log("Insert Query: " . $insert_query);

    $result = mysqli_query($conn, $insert_query);

    if ($result) {
        echo "<script>
                alert('Product added to cart successfully!');
                window.location.href = 'customer_menu.php'; 
              </script>";
        error_log("Insert successful");
    } else {
        echo "<script>
                alert('Failed to add product to cart. Please try again.');
                window.location.href = 'customer_menu.php'; 
              </script>";
        error_log("Insert failed: " . mysqli_error($conn));
    }
}
?>
