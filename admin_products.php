<?php
include 'config.php';
session_start();

$admin_id = $_SESSION['admin_id'];

if (!isset($admin_id)) {
   header('location:admin_login.php');
   exit();
}


if (isset($_GET['delete'])) {
   $delete_id = $_GET['delete'];

   // Get the image of the product to be deleted
   $delete_product_image_query = "SELECT image FROM `products` WHERE id = $delete_id";
   $result = mysqli_query($conn, $delete_product_image_query);
   $fetch_delete_image = mysqli_fetch_assoc($result);

   if ($fetch_delete_image) {
      $check_image_usage_query = "SELECT COUNT(*) as image_count FROM `products` WHERE image = '" . $fetch_delete_image['image'] . "'";
      $usage_result = mysqli_query($conn, $check_image_usage_query);
      $usage_count = mysqli_fetch_assoc($usage_result)['image_count'];

      if ($usage_count == 1 && file_exists('uploaded_img/' . $fetch_delete_image['image'])) {
         unlink('uploaded_img/' . $fetch_delete_image['image']);
      }
   }

   $delete_product_query = "DELETE FROM `products` WHERE id = $delete_id";
   mysqli_query($conn, $delete_product_query);


   $delete_cart_query = "DELETE FROM `cart` WHERE pid = $delete_id";
   mysqli_query($conn, $delete_cart_query);
   $message[] = 'Product Deleted Successfully.';
   header('location:admin_products.php');
   exit();
}


if (isset($_POST['update_product'])) {
   $pid = mysqli_real_escape_string($conn, $_POST['pid']);
   $name = mysqli_real_escape_string($conn, $_POST['name']);
   $price = mysqli_real_escape_string($conn, $_POST['price']);
   $quantity = mysqli_real_escape_string($conn, $_POST['quantity']);
   $description = mysqli_real_escape_string($conn, $_POST['description']);

   $update_columns = "name = '$name', price = '$price', quantity = '$quantity', description = '$description'";

   // Handle image upload if new image is selected
   if (!empty($_FILES['image']['name'])) {
      $image = $_FILES['image']['name'];
      $image_size = $_FILES['image']['size'];
      $image_tmp_name = $_FILES['image']['tmp_name'];
      $image_folder = 'uploaded_img/';
      $image_extension = strtolower(pathinfo($image, PATHINFO_EXTENSION));

      // Generate unique image name
      $new_image_name = uniqid() . '.' . $image_extension;

      // Allowed image types
      $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];

      if (!in_array($image_extension, $allowed_extensions)) {
         $message[] = 'Invalid image format! Please upload jpg, jpeg, png, or gif.';
      } elseif ($image_size > 2000000) {
         $message[] = 'Image size is too large! Maximum size is 2MB.';
      } else {
         // Get old image name
         $select_old_image = mysqli_query($conn, "SELECT image FROM products WHERE id = '$pid'");
         $fetch_old_image = mysqli_fetch_assoc($select_old_image);

         // Delete old image if exists
         if ($fetch_old_image['image'] != '') {
            $old_image_path = $image_folder . $fetch_old_image['image'];
            if (file_exists($old_image_path)) {
               unlink($old_image_path);
            }
         }

         // Upload new image
         move_uploaded_file($image_tmp_name, $image_folder . $new_image_name);

         // Add image to update columns
         $update_columns .= ", image = '$new_image_name'";
      }
   }

   // Update query
   $update_query = "UPDATE products SET $update_columns WHERE id = '$pid'";

   if (mysqli_query($conn, $update_query)) {
      $message[] = 'Product updated successfully!';
      header('location: admin_products.php');
      exit();
   } else {
      $message[] = 'Error updating product: ' . mysqli_error($conn);
   }
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Products</title>

   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">

   <link rel="stylesheet" href="css/admin_style.css">
   <style>
      * {
         margin: 0;
         padding: 0;
         box-sizing: border-box;
      }

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


      .card {
         box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
         border: none;
         margin-bottom: 1rem;
      }

      .card-header {
         background-color: var(--primary-color);
         color: white;
         padding: 1rem;
      }

      .table-container {
         background: white;
         border-radius: 8px;
         padding: 1rem;
      }

      .table> :not(caption)>*>* {
         padding: 1rem;
      }

      .product-img {
         width: 80px;
         height: 80px;
         object-fit: cover;
         border-radius: 4px;
      }

      .btn-action {
         width: 35px;
         height: 35px;
         padding: 0;
         display: flex;
         align-items: center;
         justify-content: center;
         border-radius: 50%;
         margin: 0 5px;
      }

      .search-input {
         max-width: 300px;
         max-height: 100px;
         margin-bottom: 1rem;
      }

      .modal-header {
         background-color: var(--primary-color);
         color: white;
      }

      .modal-header .btn-close {
         color: white;
      }

      :root {
         --primary-color: #4CAF50;
         --primary-dark: #157347;
      }

      .search-input {
         width: 80%;
         padding: 12px;
         padding-left: 40px;
         /* Space for the search icon */
         border-radius: 5px;
         border: 1px solid #ddd;
         font-size: 1rem;
      }

      .search-input i {
         position: absolute;
         left: 10px;
         top: 50%;
         transform: translateY(-50%);
         color: #aaa;
      }

      .search-container {
         position: relative;
         width: 80%;
      }

      .btn btn-success {
         width: 50px;
      }

      .addprod {
         background-color: #4CAF50;
         padding: 10px;
         border-radius: 5px;
         width: 150px;
         font-size: 15px;
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
      .search-filter-container {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stats-container {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }

        .stat-card {
            flex: 1;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .total-products {
            background: #e3f2fd;
            border-left: 4px solid #1976d2;
        }

        .low-stock {
            background: #ffebee;
            border-left: 4px solid #d32f2f;
        }

        .legend {
            display: flex;
            gap: 20px;
            margin: 20px 0;
            padding: 10px;
            background: #fff;
            border-radius: 8px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 4px;
        }

        .low-stock-row {
            background-color: #ffebee !important;
        }

        .filter-badge {
            display: inline-block;
            padding: 5px 10px;
            margin: 0 5px;
            background: #e9ecef;
            border-radius: 15px;
            cursor: pointer;
        }

        .filter-badge.active {
            background: #007bff;
            color: white;
        }
   </style>

</head>

<body>

   <main>
      <?php include 'admin_header.php' ?>
      <div class="card">
         <div class="card-header">
            <h3 class="mb-0">Products Management</h3>
         </div>
         <div class="card-body">

         <div class="container-fluid">
        <div class="search-filter-container">
            <div class="row mb-4">
                <div class="col-md-6">
                    <input type="text" id="searchInput" class="form-control" placeholder="Search products by name, description...">
                </div>
                <div class="col-md-6 text-end">
                    <button class="btn btn-primary" id="addProductBtn">
                        <i class="fas fa-plus"></i> Add Product
                    </button>
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <div class="filter-badges">
                        <span class="filter-badge active" data-filter="all">All Products</span>
                        <span class="filter-badge" data-filter="low-stock">Low Stock</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="stats-container">
            <div class="stat-card total-products">
                <h3 class="m-0" id="totalProducts">0</h3>
                <p class="mb-0">Total Products</p>
            </div>
            <div class="stat-card low-stock">
                <h3 class="m-0" id="lowStockCount">0</h3>
                <p class="mb-0">Low Stock Items</p>
            </div>
        </div>

        <div class="legend">
            <div class="legend-item">
                <div class="legend-color" style="background: #ffebee;"></div>
                <span>Low Stock (< 10 items)</span>
            </div>
        </div>

            <div class="table-container">
               <table class="table table-hover">
                  <thead>
                     <tr>
                        <th>Image</th>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Description</th>
                        <th>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     <?php
                     $select_products = $conn->query("SELECT * FROM `products`");
                     if ($select_products->num_rows > 0) {
                        while ($fetch_products = $select_products->fetch_assoc()) {
                     ?>
                           <tr class="product-row">
                              <td>
                                 <img src="uploaded_img/<?= htmlspecialchars($fetch_products['image']); ?>"
                                    class="product-img" alt="Product Image">
                              </td>
                              <td><?= htmlspecialchars($fetch_products['name']); ?></td>
                              <td>₱<?= number_format($fetch_products['price'], 2); ?></td>
                              <td><?= $fetch_products['quantity']; ?></td>
                              <td><?= htmlspecialchars($fetch_products['description']); ?></td>
                              <td>
                                 <div class="d-flex">
                                    <button type="button" class="btn btn-success btn-action"
                                       data-bs-toggle="modal"
                                       data-bs-target="#editModal<?= $fetch_products['id']; ?>">
                                       <i class="fas fa-edit"></i>
                                    </button>
                                    <button type="button" class="btn btn-danger btn-action"
                                       data-bs-toggle="modal"
                                       data-bs-target="#deleteModal<?= $fetch_products['id']; ?>">
                                       <i class="fas fa-trash"></i>
                                    </button>
                                 </div>
                              </td>
                           </tr>

                           <!-- Edit Modal -->
                           <div class="modal fade" id="editModal<?= $fetch_products['id']; ?>" tabindex="-1">
                              <div class="modal-dialog modal-dialog-centered modal-lg">
                                 <div class="modal-content">
                                    <div class="modal-header">
                                       <h5 class="modal-title">Edit Product</h5>
                                       <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                    </div>
                                    <form action="" method="POST" enctype="multipart/form-data">
                                       <div class="modal-body">
                                          <input type="hidden" name="pid" value="<?= $fetch_products['id']; ?>">
                                          <div class="row">
                                             <!-- Image Column -->
                                             <div class="col-md-4">
                                                <div class="mb-3">
                                                   <label class="form-label">Current Image</label>
                                                   <div id="currentImage<?= $fetch_products['id']; ?>" class="image-preview mb-3">
                                                      <?php if (!empty($fetch_products['image'])) { ?>
                                                         <img src="uploaded_img/<?= htmlspecialchars($fetch_products['image']); ?>"
                                                            alt="Current Image"
                                                            id="existingImage<?= $fetch_products['id']; ?>"
                                                            class="img-thumbnail"
                                                            style="max-width: 150px;">
                                                      <?php } else { ?>
                                                         <div class="alert alert-info">No image available</div>
                                                      <?php } ?>
                                                   </div>
                                                   <input type="file"
                                                      class="form-control"
                                                      name="image"
                                                      accept="image/*"
                                                      onchange="previewImage(event, <?= $fetch_products['id']; ?>)">
                                                   <div class="form-text">Maximum file size: 2MB. Allowed formats: JPG, JPEG, PNG, GIF</div>
                                                </div>
                                             </div>

                                             <!-- Details Column -->
                                             <div class="col-md-8">
                                                <div class="mb-3">
                                                   <label class="form-label">Product Name</label>
                                                   <input type="text"
                                                      class="form-control"
                                                      name="name"
                                                      value="<?= htmlspecialchars($fetch_products['name']); ?>"
                                                      required>
                                                </div>
                                                <div class="mb-3">
                                                   <label class="form-label">Price</label>
                                                   <input type="number"
                                                      class="form-control"
                                                      name="price"
                                                      value="<?= $fetch_products['price']; ?>"
                                                      step="0.01"
                                                      required>
                                                </div>
                                                <div class="mb-3">
                                                   <label class="form-label">Quantity</label>
                                                   <input type="number"
                                                      class="form-control"
                                                      name="quantity"
                                                      value="<?= $fetch_products['quantity']; ?>"
                                                      required>
                                                </div>
                                                <div class="mb-3">
                                                   <label class="form-label">Description</label>
                                                   <textarea class="form-control"
                                                      name="description"
                                                      rows="3"
                                                      required><?= htmlspecialchars($fetch_products['description']); ?></textarea>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                       <div class="modal-footer">
                                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                          <button type="submit" name="update_product" class="btn btn-success">Update Product</button>
                                       </div>
                                    </form>
                                 </div>
                              </div>
                           </div>

                           <!-- Delete Modal -->
                           <div class="modal fade" id="deleteModal<?= $fetch_products['id']; ?>" tabindex="-1">
                              <div class="modal-dialog">
                                 <div class="modal-content">
                                    <div class="modal-header">
                                       <h5 class="modal-title">Delete Product</h5>
                                       <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                    </div>
                                    <div class="modal-body">
                                       <p>Are you sure you want to delete this product?</p>
                                       <p><strong>Product: </strong><?= $fetch_products['name']; ?></p>
                                    </div>
                                    <div class="modal-footer">
                                       <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                       <a href="admin_products.php?delete=<?= $fetch_products['id']; ?>"
                                          class="btn btn-danger">Delete</a>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        <?php
                        }
                     } else {
                        ?>
                        <tr>
                           <td colspan="6" class="text-center">No products found</td>
                        </tr>
                     <?php } ?>
                  </tbody>
               </table>
            </div>
         </div>
      </div>



      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
      <script>
         // Search functionality
         document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('searchInput');
            const filterBadges = document.querySelectorAll('.filter-badge');
            const productRows = document.querySelectorAll('.product-row');
            
            // Initialize counts
            updateProductCounts();

            // Search functionality
            searchInput.addEventListener('input', function() {
                filterProducts();
            });

            // Filter badge clicks
            filterBadges.forEach(badge => {
                badge.addEventListener('click', function() {
                    filterBadges.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    filterProducts();
                });
            });

            function filterProducts() {
                const searchTerm = searchInput.value.toLowerCase();
                const activeFilter = document.querySelector('.filter-badge.active').dataset.filter;
                let visibleCount = 0;
                let lowStockCount = 0;

                productRows.forEach(row => {
                    const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                    const description = row.querySelector('td:nth-child(5)').textContent.toLowerCase();
                    const quantity = parseInt(row.querySelector('td:nth-child(4)').textContent);
                    
                    // Mark low stock
                    if (quantity < 10) {
                        row.classList.add('low-stock-row');
                        lowStockCount++;
                    } else {
                        row.classList.remove('low-stock-row');
                    }

                    const matchesSearch = name.includes(searchTerm) || description.includes(searchTerm);
                    const matchesFilter = activeFilter === 'all' || 
                                       (activeFilter === 'low-stock' && quantity < 10);

                    if (matchesSearch && matchesFilter) {
                        row.style.display = '';
                        visibleCount++;
                    } else {
                        row.style.display = 'none';
                    }
                });

                updateProductCounts(visibleCount, lowStockCount);
            }

            function updateProductCounts(visibleCount = productRows.length, lowStockCount = 0) {
                document.getElementById('totalProducts').textContent = visibleCount;
                document.getElementById('lowStockCount').textContent = lowStockCount;
            }

            // Initial filter
            filterProducts();
        });

         function previewImage(event, productId) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function() {
               const preview = document.getElementById('currentImage' + productId);
               const existingImage = document.getElementById('existingImage' + productId);

               const previewImg = document.createElement('img');
               previewImg.src = reader.result;
               previewImg.alt = 'Image Preview';
               previewImg.id = 'existingImage' + productId;
               previewImg.className = 'img-thumbnail';
               previewImg.style.maxWidth = '150px';

               if (existingImage) {
                  existingImage.remove();
               }

               preview.innerHTML = '';
               preview.appendChild(previewImg);
            };

            if (file) {
               reader.readAsDataURL(file);
            }
         }
      </script>
      <script src="js/admin_script.js"></script>
   </main>

</body>

</html>