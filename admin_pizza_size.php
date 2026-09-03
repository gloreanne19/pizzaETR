<?php
ob_start();
include 'config.php';
session_start();

// Initialize messages
$message = array();
if(isset($_SESSION['success'])) {
    $successMsg = $_SESSION['success'];
    unset($_SESSION['success']);
}
if(isset($_SESSION['error'])) {
    $errorMsg = $_SESSION['error'];
    unset($_SESSION['error']);
}
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

        /* Responsive table */
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

        .details-column {
            flex: 2;
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

        /* Modal specific styles */
        .modal-form-row {
            display: flex;
            gap: 20px;
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
        // Display success message if exists
        if (!empty($successMsg)) {
            echo "<div class='alert alert-success alert-dismissible fade show' role='alert'>
                    $successMsg
                    <button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>
                  </div>";
        }
        // Display error message if exists
        if (!empty($errorMsg)) {
            echo "<div class='alert alert-danger alert-dismissible fade show' role='alert'>
                    $errorMsg
                    <button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>
                  </div>";
        }
        ?>
        <?php
  
      // Select all sizes
        $sql = "SELECT * FROM size ORDER BY sizeID DESC";
        $result = mysqli_query($conn, $sql);
// Insert new size
if (isset($_POST['submit'])) {
    $sizename = mysqli_real_escape_string($conn, $_POST['sizename']);
    $sizeprice = mysqli_real_escape_string($conn, $_POST['sizeprice']);

    $sql = "INSERT INTO size (sizename, sizeprice) VALUES ('$sizename', '$sizeprice')";
    
    if (mysqli_query($conn, $sql)) {
        $_SESSION['success'] = "New size inserted successfully";
        header("Location: admin_pizza_size.php");
        exit();
    } else {
        $_SESSION['error'] = "Error: " . mysqli_error($conn);
        header("Location: admin_pizza_size.php");
        exit();
    }
}

// Delete size
if (isset($_GET['delete'])) {
    $sizeID = intval($_GET['delete']);
    $sql = "DELETE FROM size WHERE sizeID = $sizeID";

    if (mysqli_query($conn, $sql)) {
        $_SESSION['success'] = "Customization deleted successfully";
        header("Location: admin_pizza_size.php");
        exit();
    } else {
        $_SESSION['error'] = "Error deleting record: " . mysqli_error($conn);
        header("Location: admin_pizza_size.php");
        exit();
    }
}

// Update size
if (isset($_POST['update'])) {
    $sizeID = mysqli_real_escape_string($conn, $_POST['sizeID']);
    $sizename = mysqli_real_escape_string($conn, $_POST['sizename']);
    $sizeprice = mysqli_real_escape_string($conn, $_POST['sizeprice']);

    $sql = "UPDATE size SET sizename='$sizename', sizeprice='$sizeprice' WHERE sizeID=$sizeID";

    if (mysqli_query($conn, $sql)) {
        $_SESSION['success'] = "Customization updated successfully";
        header("Location: admin_pizza_size.php");
        exit();
    } else {
        $_SESSION['error'] = "Error updating record: " . mysqli_error($conn);
        header("Location: admin_pizza_size.php");
        exit();
    }
}
        ?>
        <div class="row-container">
            <div class="form-container">
                <!-- <h2 class="text-center mb-4">Insert Customization</h2> -->
                <form method="POST" enctype="multipart/form-data">
                    <div class="form-row">

                        <div class="details-column">
                            <input type="text" name="sizename" placeholder="Enter Size Name" required>
                            <input type="text" name="sizeprice" placeholder="Enter Size Price" required>
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
                // Debug information
                echo "<!-- Number of rows: " . mysqli_num_rows($result) . " -->";

                if ($result && mysqli_num_rows($result) > 0) {
                    echo "<table class='custom-table'>
                <thead>
                    <tr>
                        <th>ID</th>
                  
                        <th>Name</th>
                        <th>Price</th>
                        
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>";

                    while ($row = mysqli_fetch_assoc($result)) {

                        echo "<tr>
                    <td>#{$row['sizeID']}</td>
                  
                    <td>" . htmlspecialchars($row['sizename']) . "</td>
                    <td class='price-cell'>₱ " . number_format($row['sizeprice'], 2) . "</td>
                
                    <td class='actions-cell'>
                        <button class='action-btn edit-btn' 
                                data-bs-toggle='modal' 
                                data-bs-target='#editSizeModal' 
                                onclick='editSize(" . json_encode($row['sizeID']) . ", " .
                            json_encode($row['sizename']) . ", " .
                            json_encode($row['sizeprice']) . ", " .
                            ")'>
                            <i class='fas fa-edit'></i>
                        </button>
                        <button class='action-btn delete-btn' 
                                onclick='deleteCustomization({$row['sizeID']})'>
                            <i class='fas fa-trash-alt'></i>
                        </button>
                    </td>
                </tr>";
                    }
                    echo "</tbody></table>";
                } else {
                    echo "<div class='alert alert-info'>No sizes available.</div>";
                }
                ?>
            </div>


            <!-- Edit Modal -->
            <div class="modal fade" id="editSizeModal" tabindex="-1" aria-labelledby="editSizeModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content shadow-lg rounded-3">
                        <div class="modal-header border-bottom-0">
                            <h5 class="modal-title text-primary" id="editSizeModalLabel">Edit Customization</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form method="POST" enctype="multipart/form-data">
                                <input type="hidden" id="modal_sizeID" name="sizeID">
                                <div class="modal-form-row">

                                    <div class="modal-details-column">
                                        <div class="mb-3">
                                            <label for="modal_sizename" class="form-label">Customization Name</label>
                                            <input type="text" class="form-control" id="modal_sizename" name="sizename" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="modal_sizeprice" class="form-label">Customization Price</label>
                                            <input type="text" class="form-control" id="modal_sizeprice" name="sizeprice" required>
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
                    if (confirm('Are you sure you want to delete this size?')) {
                        window.location.href = `?delete=${id}`;
                    }
                }

                // Add sorting functionality
                document.querySelectorAll('th').forEach(headerCell => {
                    headerCell.addEventListener('click', () => {
                        const tableElement = headerCell.closest('table');
                        const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);
                        const currentIsAscending = headerCell.classList.contains('th-sort-asc');

                        sortTableByColumn(tableElement, headerIndex, !currentIsAscending);
                    });
                });

                // Function to sort table
                function sortTableByColumn(table, column, asc = true) {
                    const dirModifier = asc ? 1 : -1;
                    const tBody = table.tBodies[0];
                    const rows = Array.from(tBody.querySelectorAll('tr'));

                    // Sort each row
                    const sortedRows = rows.sort((a, b) => {
                        const aColText = a.querySelector(`td:nth-child(${column + 1})`).textContent.trim();
                        const bColText = b.querySelector(`td:nth-child(${column + 1})`).textContent.trim();

                        return aColText > bColText ? (1 * dirModifier) : (-1 * dirModifier);
                    });

                    // Remove existing rows
                    while (tBody.firstChild) {
                        tBody.removeChild(tBody.firstChild);
                    }

                    // Re-add sorted rows
                    tBody.append(...sortedRows);

                    // Remember how the column is currently sorted
                    table.querySelectorAll('th').forEach(th => th.classList.remove('th-sort-asc', 'th-sort-desc'));
                    table.querySelector(`th:nth-child(${column + 1})`).classList.toggle('th-sort-asc', asc);
                    table.querySelector(`th:nth-child(${column + 1})`).classList.toggle('th-sort-desc', !asc);
                }

                function editSize(sizeID, sizename, sizeprice) {
                    document.getElementById('modal_sizeID').value = sizeID;
                    document.getElementById('modal_sizename').value = sizename;
                    document.getElementById('modal_sizeprice').value = sizeprice;

                }
            </script>
    </main>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>