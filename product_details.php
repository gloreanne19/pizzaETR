<?php
include 'config.php';

$productId = $_POST['pid'] ?? null;

session_start();
$is_logged_in = isset($_SESSION['user_id']) ? true : false; 

if (!$productId) {
    header('Location: menu.php');
    exit();
}



$product_query = "SELECT * FROM products WHERE id = $productId";
$product_result = mysqli_query($conn, $product_query);
$product = mysqli_fetch_assoc($product_result);

$size_query = "SELECT * FROM size";
$size_result = mysqli_query($conn, $size_query);

$customization_query = "SELECT * FROM customization";
$customization_result = mysqli_query($conn, $customization_query);
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pizza Order</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: white;
            min-height: 100vh;
            padding-bottom: 100px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding-left: 20px;
            border-radius: 5px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;

        }

        .left-section {
            top: 20px;
            height: fit-content;
        }

        .product-image {
            width: 100%;
            height: 400px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .product-title {
            font-size: 2.5em;
            margin: 0 0 10px;
        }

        .product-description {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.6;
        }

        .price {
            font-size: 1.8em;
            color: #000;
            font-weight: bold;
        }

        .right-section {
            background: white;
            padding: 30px;
            max-width: 500px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .section-title {
            font-size: 1.2em;
            margin-bottom: 15px;
            color: #333;
        }

        .required-mark {
            color: red;
        }

        .size-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
        }

        .size-option {
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .size-option:hover {
            background-color: #f8f8f8;
            border-color: #999;
        }

        .size-option:has(input:focus) {
            border-color: red;
        }


        .toppings-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
            margin-bottom: 30px;
        }

        .topping-item {
            display: flex;
            align-items: center;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            gap: 15px;
        }



        .topping-image {
            width: 40px;
            height: 40px;
            object-fit: cover;
            border-radius: 4px;
        }

        .topping-info {
            flex-grow: 1;
        }

        .fixed-bottom {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            padding: 20px;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }

        .bottom-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .quantity-controls {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .quantity-btn {
            padding: 8px 15px;
            font-size: 1.2em;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
        }


        .quantity-input {
            width: 60px;
            text-align: center;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .total-section {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .order-btn {
            background: #008C3B;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 1.1em;
            cursor: pointer;
            transition: background 0.3s ease;
        }

        .order-btn:hover {
            background: #ff3333;
        }

        .starts {
            font-size: 20;
            display: grid;
        }

        .topping-item.selected {
            border: 2px solid red;
        }

        .starts,
        .price {
            display: inline-block;
            margin: 0;
            vertical-align: middle;
        }

        .price {
            font-weight: bold;
            color: #000;
            margin-left: 5px;
        }

        .left-section {
            padding: 20px;
            margin-top: 50px;
        }

        .product-image {
            width: 100%;
            height: 400px;
            object-fit: contain;
        }


.back-button-container {
    position: fixed;
    top: 20px; 
    left: 20px; 
    z-index: 1000; 
}


.back-button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #008C3B;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

.back-button:hover {
    background-color:#333333;
}
.disabled-btn {
        background-color: #ccc;
        cursor: not-allowed;
        opacity: 0.6;
    }

    .enabled-btn {
        background-color: #008C3B;
        cursor: pointer;
    }

    </style>
</head>
<body>
    <div class="back-button-container">
        <a href="customer_menu.php" class="back-button">Back to Menu</a>
    </div>
    <div class="container">
        <div class="left-section">
            <img src="uploaded_img/<?php echo $product['image']; ?>" alt="<?php echo $product['name']; ?>" class="product-image">

            <h1 class="product-title"><?php echo $product['name']; ?></h1>
            <p class="starts">starts at </p>
            <div class="price"> ₱<?php echo number_format($product['price'], 2); ?></div>
            <p class="product-description"><?php echo $product['description']; ?></p>

        </div>

        <div class="right-section">
            <form action="process_order.php" method="POST">
                <input type="hidden" name="product_id" value="<?php echo $product['id']; ?>">
                <input type="hidden" name="base_price" value="<?php echo $product['price']; ?>">
                <input type="hidden" name="selected_size_price" id="selected_size_price" value="0">
                <h2 class="section-title"><span class="required-mark">*</span>Sizes</h2>
                <div class="size-options">
                    <?php while ($size = mysqli_fetch_assoc($size_result)): ?>
                        <label class="size-option">
                            <input type="radio"
                                name="size"
                                value="<?php echo htmlspecialchars($size['sizeID']); ?>"
                                data-price="<?php echo htmlspecialchars($size['sizeprice']); ?>"
                                required>
                            <?php echo htmlspecialchars($size['sizename']); ?>
                        </label>
                    <?php endwhile; ?>
                </div>

                <h2 class="section-title">Additional Toppings (optional)</h2>
                <div class="toppings-grid">
                    <?php while ($topping = mysqli_fetch_assoc($customization_result)): ?>
                        <div class="topping-item">
                            <input type="checkbox" name="toppings[]" value="<?php echo $topping['cusID']; ?>" tabindex="0">
                            <img src="<?php echo $topping['cusImage']; ?>" alt="<?php echo $topping['cusName']; ?>" class="topping-image">
                            <div class="topping-info">
                                <div class="topping-name"><?php echo $topping['cusName']; ?></div>
                                <div class="topping-price">+₱<?php echo number_format($topping['cusPrice'], 2); ?></div>
                            </div>
                        </div>
                    <?php endwhile; ?>
                </div>

                <div class="fixed-bottom">
                    <div class="bottom-container">
                        <div class="quantity-controls">
                            <button type="button" class="quantity-btn" onclick="updateQuantity(-1)">-</button>
                            <input type="number" name="quantity" value="1" min="1" id="quantity-input" class="quantity-input" readonly>
                            <button type="button" class="quantity-btn" onclick="updateQuantity(1)">+</button>
                        </div>
                        <div class="total-section">
                            <span>Total: </span>
                            <div class="price">₱<span id="total-price"><?php echo number_format($product['price'], 2); ?></span></div>
                            <button type="submit" class="order-btn <?php echo (!$is_logged_in ? 'disabled-btn' : 'enabled-btn'); ?>" id="order-btn">
                                Add to Cart
                            </button>
                            <script>
                                document.getElementById('order-btn').addEventListener('click', function(event) {
                                    if (!<?php echo json_encode($is_logged_in); ?>) {
                                        event.preventDefault();
                                        alert('You must be logged in to add items to the cart.');
                                    }
                                });
                            </script>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</body>

    <script>
        function updateQuantity(change) {
            const input = document.getElementById('quantity-input');
            const newValue = parseInt(input.value) + change;
            if (newValue >= 1) {
                input.value = newValue;
                updateTotal();
            }
        }

        function updateTotal() {
            // Get base price of the product
            const basePrice = <?php echo $product['price']; ?>;
            const quantity = parseInt(document.getElementById('quantity-input').value);

            // Get selected size price
            let sizePrice = 0;
            const selectedSize = document.querySelector('input[name="size"]:checked');
            if (selectedSize) {
                sizePrice = parseFloat(selectedSize.dataset.price) || 0;
            }

            // Get selected toppings total
            let toppingsTotal = 0;
            document.querySelectorAll('.topping-item input[type="checkbox"]:checked').forEach(checkbox => {
                const priceElement = checkbox.closest('.topping-item').querySelector('.topping-price');
                if (priceElement) {
                    const priceText = priceElement.textContent;
                    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                    if (!isNaN(price)) {
                        toppingsTotal += price;
                    }
                }
            });

            // Calculate total
            const total = (basePrice + sizePrice + toppingsTotal) * quantity;
            document.getElementById('total-price').textContent = total.toFixed(2);
        }

        // Add event listeners for size selection
        document.querySelectorAll('input[name="size"]').forEach(radio => {
            radio.addEventListener('change', updateTotal);
        });

        // Add event listeners for toppings
        document.querySelectorAll('.topping-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const parentDiv = checkbox.closest('.topping-item');
                if (checkbox.checked) {
                    parentDiv.classList.add('selected');
                } else {
                    parentDiv.classList.remove('selected');
                }
                updateTotal();
            });
        });

        // Initial total calculation
        updateTotal();
    </script>


</body>

</html>