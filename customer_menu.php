<?php
include 'config.php';
session_start();
include 'customer_header.php';

function isProductInFavorites($conn, $user_id, $product_id) {
    $query = "SELECT * FROM `favorites` WHERE `user_id` = '$user_id' AND `product_id` = '$product_id'";
    $result = mysqli_query($conn, $query);
    return mysqli_num_rows($result) > 0;
}

if (isset($_POST['add_to_favorites'])) {
    $pid = mysqli_real_escape_string($conn, $_POST['pid']);
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $price = mysqli_real_escape_string($conn, $_POST['price']);
    $image = mysqli_real_escape_string($conn, $_POST['image']);

    if (isset($_SESSION['user_id'])) {
        $user_id = mysqli_real_escape_string($conn, $_SESSION['user_id']);

        if (!isProductInFavorites($conn, $user_id, $pid)) {
            $insert_query = "INSERT INTO `favorites` (`user_id`, `product_id`, `name`, `price`, `image`) 
                             VALUES ('$user_id', '$pid', '$name', '$price', '$image')";
            
            if (mysqli_query($conn, $insert_query)) {
                // echo "<script>alert('Product added to favorites'); window.location.reload();</script>";
                echo "<script>
                alert('Product added to favorites');
                window.location.href = 'customer_menu.php';
            </script>";

            } else {
                echo "<script>alert('Failed to add to favorites');</script>";
            }
        } else {
            echo "<script>alert('Product already in favorites');</script>";
        }
    } else {
        echo "<script>alert('Please log in first');</script>";
    }
}
?>


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



<section id="menu" class="menu">
    <br><br>
    <h1 class="heading">Our Menu</h1>
    <div class="search-filter-container">
  <div class="search-filter-wrapper">
    <div class="search-box">
      <input type="text" class="search-input" placeholder="Search our menu..." id="menuSearch">
      <i class="fas fa-search search-icon"></i>
    </div>
    <div class="price-filters">
      <button class="price-btn active" data-price="all">All Prices</button>
      <button class="price-btn" data-price="200">Under ₱200</button>
      <button class="price-btn" data-price="400">₱200 - ₱400</button>
      <button class="price-btn" data-price="600">₱400 - ₱600</button>
      <button class="price-btn" data-price="601">Over ₱600</button>
    </div>
  </div>
</div>
    <?php
    $select_products_query = "SELECT * FROM `products`";
    $result_products = mysqli_query($conn, $select_products_query);

    if (mysqli_num_rows($result_products) > 0) {
        echo '<div class="box-container">';
        while ($fetch_products = mysqli_fetch_assoc($result_products)) {
    ?>

            <div class="box">
                <div class="price">₱<?= $fetch_products['price'] ?></div>
                <img src="uploaded_img/<?= $fetch_products['image'] ?>" alt="">
                <div class="name"><?= $fetch_products['name'] ?></div>

                <div class="product-actions" style="display: flex; align-items: center; gap: 10px;">
                    <form action="" method="post" style="margin: 0;">
                        <input type="hidden" name="pid" value="<?= $fetch_products['id'] ?>">
                        <input type="hidden" name="name" value="<?= $fetch_products['name'] ?>">
                        <input type="hidden" name="price" value="<?= $fetch_products['price'] ?>">
                        <input type="hidden" name="image" value="<?= $fetch_products['image'] ?>">

                        <button type="submit" class="favorite-btn" name="add_to_favorites" title="Add to Favorites">
                            <?php 
                            if (isset($_SESSION['user_id']) && isProductInFavorites($conn, $_SESSION['user_id'], $fetch_products['id'])) {
                                echo '<i class="fas fa-heart"></i>'; 
                            } else {
                                echo '<i class="far fa-heart"></i>';
                            }
                            ?>
                        </button>
                    </form>

                    <form action="product_details.php" method="post" style="margin: 0;">
                        <input type="hidden" name="pid" value="<?= $fetch_products['id'] ?>">
                        <input type="hidden" name="name" value="<?= $fetch_products['name'] ?>">
                        <input type="hidden" name="price" value="<?= $fetch_products['price'] ?>">
                        <input type="hidden" name="image" value="<?= $fetch_products['image'] ?>">
                        <input type="submit" class="cart-btn" name="add_to_cart" value="Add to Cart">
                    </form>
                </div>
            </div>
    <?php
        }
        echo '</div>';
    } else {
        echo '<p class="empty">No products available at the moment!</p>';
    }
    ?>
</section>

<script src="js/script.js"></script>

</body>
</html>
 <script>
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('menuSearch');
    const priceButtons = document.querySelectorAll('.price-btn');
    const menuItems = document.querySelectorAll('.box');

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function filterMenu() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const activePrice = document.querySelector('.price-btn.active').dataset.price;

        menuItems.forEach(item => {
            const nameElement = item.querySelector('.name');
            const name = nameElement ? nameElement.textContent.toLowerCase() : '';
            
            const priceElement = item.querySelector('.price');
            const priceText = priceElement ? priceElement.textContent.replace('₱', '').trim() : '0';
            const price = parseFloat(priceText);

            const matchesSearch = name.includes(searchTerm);

            const matchesPrice = getPriceRangeMatch(price, activePrice);

            if (matchesSearch && matchesPrice) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 10);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 200);
            }
        });

        updateNoResultsMessage();
    }

    function getPriceRangeMatch(price, activePrice) {
        switch (activePrice) {
            case 'all':
                return true;
            case '200':
                return price < 200;
            case '400':
                return price >= 200 && price < 400;
            case '600':
                return price >= 400 && price < 600;
            case '601':
                return price >= 600;
            default:
                return true;
        }
    }

    function updateNoResultsMessage() {
        const hasVisibleItems = Array.from(menuItems).some(
            item => item.style.display !== 'none'
        );
        
        let noResultsMsg = document.querySelector('.no-results-message');
        if (!hasVisibleItems) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('p');
                noResultsMsg.className = 'no-results-message';
                noResultsMsg.textContent = 'No products match your search criteria';
                const container = document.querySelector('.box-container');
                if (container) {
                    container.appendChild(noResultsMsg);
                }
            }
            noResultsMsg.style.display = 'block';
        } else if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }

    searchInput.addEventListener('input', debounce(() => {
        console.log('Search term:', searchInput.value);
        filterMenu();
    }, 300));
    
    priceButtons.forEach(button => {
        button.addEventListener('click', () => {
            priceButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterMenu();
        });
    });

    menuItems.forEach(item => {
        item.style.transition = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
    });

    filterMenu();
});
    </script>


<style>
    .menu{
        margin-top: 100px;
    }
    .box {
    transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.no-results-message {
    text-align: center;
    padding: 20px;
    color: #666;
    width: 100%;
}
.search-filter-container {

  max-width: 1200px;
 
  padding: 0 15px;
  margin-bottom: 20px;
}

.search-filter-wrapper {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: lightgreen;
  box-shadow: 0 0 0 2px rgba(255, 77, 77, 0.1);
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.price-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.price-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.price-btn:hover {
  background:#333333;
  color: #fff;
  border-color: #333333;
}

.price-btn.active {
  background: green;
  color: #fff;
  border-color: darkgreen;
}

@media (max-width: 768px) {
  .search-filter-wrapper {
    padding: 15px;
  }
  
  .price-filters {
    justify-content: center;
  }
  
  .price-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>