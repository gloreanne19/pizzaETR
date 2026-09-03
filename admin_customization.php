<?php
ob_start();
include 'config.php';
session_start();

$successMsg = '';
$errorMsg = '';
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update Product</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
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

        .row-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            padding: 20px;
        }

        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f9;
        }



        .form-container {
            margin-top: 0px;
            width: 38%;
        }

        .table-container {
            width: 100%;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding: 0 10px;
        }

        .table-title {
            font-size: 24px;
            color: #333;
            margin: 0;
        }

        .custom-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
        }

        .custom-table th {
            background-color: #f8f9fa;
            color: #495057;
            font-weight: 600;
            padding: 15px;
            text-align: left;
            border-bottom: 2px solid #dee2e6;
            text-transform: uppercase;
            font-size: 14px;
        }

        .custom-table td {
            padding: 15px;
            vertical-align: middle;
            border-bottom: 1px solid #dee2e6;
            color: #495057;
        }

        .custom-table tr:hover {
            background-color: #f8f9fa;
        }

        .custom-table tr:last-child td {
            border-bottom: none;
        }

        .product-image-cell {
            width: 120px;
        }

        .product-image {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .price-cell {
            font-weight: 600;
            color: #2c3e50;
        }

        .actions-cell {
            width: 100px;
            text-align: center;
        }

        .action-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            border: none;
            background: transparent;
            margin: 0 5px;
            transition: all 0.3s ease;
        }

        .edit-btn {
            color: #3498db;
        }

        .delete-btn {
            color: #e74c3c;
        }

        .action-btn:hover {
            background-color: #f0f0f0;
            transform: scale(1.1);
        }

        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .active {
            background-color: #e8f5e9;
            color: #2e7d32;
        }

        .inactive {
            background-color: #ffebee;
            color: #c62828;
        }

        @media (max-width: 768px) {
            .custom-table {
                display: block;
                overflow-x: auto;
                white-space: nowrap;
            }
        }

        .action-icons {
            font-size: 18px;
        }

        .action-icons a {
            color: #007BFF;
            padding: 5px;
            margin-right: 10px;
        }

        .action-icons a:hover {
            color: #333;
        }

        .form-container {
            width: 100%;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

        .details-column input[type="text"] {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
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

        .modal-form-row {
            display: flex;
            gap: 20px;
        }

        .modal-image-column {
            flex: 1;
        }

        .modal-details-column {
            flex: 2;
        }
        .form-container {
    min-height: 50vh;
   
}
    </style>




</head>

<body>
    <?php include 'admin_header.php'; ?>
    <main>
        <?php

        if (!empty($successMsg)) {
            echo "<div class='alert alert-success alert-dismissible fade show' role='alert'>
            $successMsg
            <button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>
          </div>";
        }
        if (!empty($errorMsg)) {
            echo "<div class='alert alert-danger alert-dismissible fade show' role='alert'>
            $errorMsg
            <button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>
          </div>";
        }
        error_reporting(E_ALL);
        ini_set('display_errors', 1);

        $sql = "SELECT * FROM customization ORDER BY cusID DESC";
        $result = mysqli_query($conn, $sql);

        if (!$result) {
            die("Query failed: " . mysqli_error($conn));
        }

        if (isset($_POST['submit'])) {
            $cusName = mysqli_real_escape_string($conn, $_POST['cusName']);
            $cusPrice = mysqli_real_escape_string($conn, $_POST['cusPrice']);

            $target_dir = "uploads/customization/";
            if (!file_exists($target_dir)) {
                mkdir($target_dir, 0777, true);
            }

            $cusImage = "";
            if (isset($_FILES["cusImage"]) && $_FILES["cusImage"]["error"] == 0) {
                $target_file = $target_dir . basename($_FILES["cusImage"]["name"]);
                $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

                $cusImage = $target_dir . uniqid() . '.' . $imageFileType;

                if (move_uploaded_file($_FILES["cusImage"]["tmp_name"], $cusImage)) {
                    $successMsg = "File uploaded successfully";
                } else {
                    $errorMsg = "Sorry, there was an error uploading your file.";
                }
            }

            $sql = "INSERT INTO customization (cusName, cusPrice, cusImage) VALUES (?, ?, ?)";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "sss", $cusName, $cusPrice, $cusImage);

            if (mysqli_stmt_execute($stmt)) {
                $successMsg = "New customization inserted successfully";
                header("Location: admin_customization.php");
                exit();
            } else {
                $errorMsg = "Error: " . mysqli_error($conn);
            }
            mysqli_stmt_close($stmt);
        }


        if (isset($_GET['delete'])) {
            $cusID = intval($_GET['delete']);

            $sql = "SELECT cusImage FROM customization WHERE cusID = ?";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "i", $cusID);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);

            if ($row = mysqli_fetch_assoc($result)) {
                if (!empty($row['cusImage']) && file_exists($row['cusImage'])) {
                    unlink($row['cusImage']);
                }
            }

            $sql = "DELETE FROM customization WHERE cusID = ?";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "i", $cusID);

            if (mysqli_stmt_execute($stmt)) {
                $successMsg = "Customization deleted successfully";
                header("Location: admin_customization.php");
                exit();
            } else {
                $errorMsg = "Error deleting record: " . mysqli_error($conn);
            }
            mysqli_stmt_close($stmt);
        }

        if (isset($_POST['update'])) { 
            $cusID = mysqli_real_escape_string($conn, $_POST['cusID']);
            $cusName = mysqli_real_escape_string($conn, $_POST['cusName']);
            $cusPrice = mysqli_real_escape_string($conn, $_POST['cusPrice']);

            $image_update = "";
            if (isset($_FILES["modal_cusImage"]) && $_FILES["modal_cusImage"]["error"] == 0) {
                $target_dir = "uploads/customization/";
                $target_file = $target_dir . uniqid() . '.' . strtolower(pathinfo($_FILES["modal_cusImage"]["name"], PATHINFO_EXTENSION));

                if (move_uploaded_file($_FILES["modal_cusImage"]["tmp_name"], $target_file)) {
                    $image_update = ", cusImage='$target_file'";
                }
            }

            $sql = "UPDATE customization SET cusName=?, cusPrice=? WHERE cusID=?";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "ssi", $cusName, $cusPrice, $cusID);

            if (mysqli_stmt_execute($stmt)) {
                $successMsg = "Customization updated successfully";
                header("Location: admin_customization.php");
                exit();
            } else {
                $errorMsg = "Error updating record: " . mysqli_error($conn);
            }
            mysqli_stmt_close($stmt);
        }
        ?>
        <div class="row-container">
            <div class="form-container">
                <form method="POST" enctype="multipart/form-data">
                    <div class="form-row">
                        <div class="image-column">
                            <div class="image-preview" id="imagePreview">
                                <span>Preview Image</span>
                            </div>
                            <div class="file-input-container">
                                <input type="file" name="cusImage" accept="image/*" class="form-control" required>
                            </div>
                        </div>
                        <div class="details-column">
                            <input type="text" name="cusName" placeholder="Enter Customization Name" required>
                            <input type="text" name="cusPrice" placeholder="Enter Customization Price" required>
                            <button type="submit" name="submit" class="submit-btn">Insert Customization</button>
                        </div>
                    </div>
                </form>
            </div>

            <div class="table-container">
                <div class="table-header">
                    <h2 class="table-title">Available size</h2>
                    <span class="total-items">Total: <?php echo mysqli_num_rows($result); ?></span>
                </div>

                <?php
                echo "<!-- Number of rows: " . mysqli_num_rows($result) . " -->";

                if ($result && mysqli_num_rows($result) > 0) {
                    echo "<table class='custom-table'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>";

                    while ($row = mysqli_fetch_assoc($result)) {
                      
                        echo "<tr>
                    <td>#{$row['cusID']}</td>
                    <td class='product-image-cell'>";

                        if (!empty($row['cusImage']) && file_exists($row['cusImage'])) {
                            echo "<img src='{$row['cusImage']}' class='product-image' alt='Customization Image'>";
                        } else {
                            echo "<img src='placeholder.jpg' class='product-image' alt='Placeholder Image'>";
                        }

                        echo "</td>
                    <td>" . htmlspecialchars($row['cusName']) . "</td>
                    <td class='price-cell'>₱ " . number_format($row['cusPrice'], 2) . "</td>
                
                    <td class='actions-cell'>
                        <button class='action-btn edit-btn' 
                                data-bs-toggle='modal' 
                                data-bs-target='#editSizeModal' 
                                onclick='editSize(" . json_encode($row['cusID']) . ", " .
                            json_encode($row['cusName']) . ", " .
                            json_encode($row['cusPrice']) . ", " .
                            json_encode($row['cusImage']) . ")'>
                            <i class='fas fa-edit'></i>
                        </button>
                        <button class='action-btn delete-btn' 
                                onclick='deleteCustomization({$row['cusID']})'>
                            <i class='fas fa-trash-alt'></i>
                        </button>
                    </td>
                </tr>";
                    }
                    echo "</tbody></table>";
                } else {
                    echo "<div class='alert alert-info'>No size available.</div>";
                }
                ?>
            </div>


            <div class="modal fade" id="editSizeModal" tabindex="-1" aria-labelledby="editSizeModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content shadow-lg rounded-3">
                        <div class="modal-header border-bottom-0">
                            <h5 class="modal-title text-primary" id="editSizeModalLabel">Edit Customization</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form method="POST" enctype="multipart/form-data">
                                <input type="hidden" id="modal_sizeID" name="cusID">
                                <div class="modal-form-row">
                                    <div class="modal-image-column">
                                        <div id="currentImage" class="image-preview mb-3"></div>
                                        <input type="file" class="form-control" id="modal_cusImage" name="modal_cusImage" accept="image/*">
                                    </div>
                                    <div class="modal-details-column">
                                        <div class="mb-3">
                                            <label for="modal_sizename" class="form-label">Customization Name</label>
                                            <input type="text" class="form-control" id="modal_sizename" name="cusName" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="modal_sizeprice" class="form-label">Customization Price</label>
                                            <input type="text" class="form-control" id="modal_sizeprice" name="cusPrice" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer border-top-0">
                                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-primary" name="update">Update Customization</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                function deleteCustomization(id) {
                    if (confirm('Are you sure you want to delete this customization?')) {
                        window.location.href = `?delete=${id}`;
                    }
                }

                document.querySelectorAll('th').forEach(headerCell => {
                    headerCell.addEventListener('click', () => {
                        const tableElement = headerCell.closest('table');
                        const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);
                        const currentIsAscending = headerCell.classList.contains('th-sort-asc');

                        sortTableByColumn(tableElement, headerIndex, !currentIsAscending);
                    });
                });

                function sortTableByColumn(table, column, asc = true) {
                    const dirModifier = asc ? 1 : -1;
                    const tBody = table.tBodies[0];
                    const rows = Array.from(tBody.querySelectorAll('tr'));

                    const sortedRows = rows.sort((a, b) => {
                        const aColText = a.querySelector(`td:nth-child(${column + 1})`).textContent.trim();
                        const bColText = b.querySelector(`td:nth-child(${column + 1})`).textContent.trim();

                        return aColText > bColText ? (1 * dirModifier) : (-1 * dirModifier);
                    });

                    while (tBody.firstChild) {
                        tBody.removeChild(tBody.firstChild);
                    }

                    tBody.append(...sortedRows);

                    table.querySelectorAll('th').forEach(th => th.classList.remove('th-sort-asc', 'th-sort-desc'));
                    table.querySelector(`th:nth-child(${column + 1})`).classList.toggle('th-sort-asc', asc);
                    table.querySelector(`th:nth-child(${column + 1})`).classList.toggle('th-sort-desc', !asc);
                }

                function editSize(cusID, cusName, cusPrice, cusImage) {
                    document.getElementById('modal_sizeID').value = cusID;
                    document.getElementById('modal_sizename').value = cusName;
                    document.getElementById('modal_sizeprice').value = cusPrice;
                    document.getElementById('currentImage').innerHTML = cusImage ?
                        `<img src="${cusImage}" alt="Current Image">` :
                        '<span>No image currently set</span>';
                }

                document.querySelector('input[name="cusImage"]').addEventListener('change', function(e) {
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

                document.getElementById('modal_cusImage').addEventListener('change', function(e) {
                    const preview = document.getElementById('currentImage');
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
    </main>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>