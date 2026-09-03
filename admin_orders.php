<?php
include 'config.php';
session_start();

$admin_id = $_SESSION['admin_id'];

if (!isset($admin_id)) {
    header('location:admin_login.php');
}


$searchQuery = '';
$paymentStatusFilter = '';

if (isset($_POST['search_query'])) {
    $searchQuery = $_POST['search_query'];
}
if (isset($_POST['payment_status_filter'])) {
    $paymentStatusFilter = $_POST['payment_status_filter'];
}

$sql = "SELECT * FROM `orders` WHERE 1";

if ($searchQuery) {
    $sql .= " AND (name LIKE '%$searchQuery%' OR address LIKE '%$searchQuery%')";
}
if ($paymentStatusFilter) {
    $sql .= " AND payment_status = '$paymentStatusFilter'";
}

$ordersResult = mysqli_query($conn, $sql);

if (isset($_POST['update_payment']) && isset($_POST['ajax'])) {
    header('Content-Type: application/json');
    $response = array('status' => 'error', 'message' => '');

    try {
        $order_id = mysqli_real_escape_string($conn, $_POST['order_id']);

        error_log("Processing order ID: " . $order_id);

        mysqli_begin_transaction($conn);

        $update_payment_query = "UPDATE `orders` SET payment_status = 'completed' WHERE id = '$order_id'";
        if (!mysqli_query($conn, $update_payment_query)) {
            throw new Exception("Failed to update payment status: " . mysqli_error($conn));
        }

        error_log("Payment status updated successfully");

        $order_items_query = "SELECT oi.*, p.name as product_name 
                            FROM `order_items` oi 
                            JOIN `products` p ON oi.product_id = p.id 
                            WHERE oi.order_id = '$order_id'";
        $order_items_result = mysqli_query($conn, $order_items_query);

        if (!$order_items_result) {
            throw new Exception("Failed to fetch order items: " . mysqli_error($conn));
        }

        error_log("Order items fetched successfully");

        // while ($item = mysqli_fetch_assoc($order_items_result)) {
        //     $product_id = mysqli_real_escape_string($conn, $item['product_id']);
        //     $quantity = mysqli_real_escape_string($conn, $item['quantity']);
        //     $price = mysqli_real_escape_string($conn, $item['price']);

        //     error_log("Processing product ID: " . $product_id);

        //     $check_product_query = "SELECT * FROM `sales` 
        //                     WHERE product_id = '$product_id' 
        //                     AND DATE(date) = CURDATE()";
        //     $check_product_result = mysqli_query($conn, $check_product_query);

        //     if (!$check_product_result) {
        //         throw new Exception("Failed to check product in sales: " . mysqli_error($conn));
        //     }

        //     if (mysqli_num_rows($check_product_result) > 0) {
        //         $update_sales_query = "UPDATE `sales` 
        //                        SET qty = qty + '$quantity' 
        //                        WHERE product_id = '$product_id' 
        //                        AND DATE(date) = CURDATE()";
        //         if (!mysqli_query($conn, $update_sales_query)) {
        //             throw new Exception("Failed to update sales quantity: " . mysqli_error($conn));
        //         }
        //     } else {
        //         $insert_sales_query = "INSERT INTO `sales` (product_id, qty, price, date) 
        //                        VALUES ('$product_id', '$quantity', '$price', NOW())";
        //         if (!mysqli_query($conn, $insert_sales_query)) {
        //             throw new Exception("Failed to insert sales record: " . mysqli_error($conn));
        //         }
        //     }

        //     $update_product_query = "UPDATE `products` 
        //                      SET quantity = quantity - '$quantity' 
        //                      WHERE id = '$product_id'";
        //     if (!mysqli_query($conn, $update_product_query)) {
        //         throw new Exception("Failed to update product quantity: " . mysqli_error($conn));
        //     }

        //     error_log("Sales record processed and product quantity updated successfully for product ID: " . $product_id);
        // }
        while ($item = mysqli_fetch_assoc($order_items_result)) {
            $product_id = mysqli_real_escape_string($conn, $item['product_id']);
            $quantity = mysqli_real_escape_string($conn, $item['quantity']);
            $price = mysqli_real_escape_string($conn, $item['price']);
            $size = mysqli_real_escape_string($conn, $item['size']);
            
            // Handle customizations
            $customizations = NULL;
            if (!empty($item['customizations'])) {
                $customization_ids = explode(',', $item['customizations']);
                // Clean and escape each customization ID
                $cleaned_ids = array_map(function($cusID) use ($conn) {
                    return mysqli_real_escape_string($conn, trim($cusID));
                }, $customization_ids);
                // Join the cleaned IDs back together
                $customizations = implode(',', $cleaned_ids);
            }
        
            error_log("Processing product ID: " . $product_id);
        
            // Always insert a new row
            $insert_sales_query = "INSERT INTO `sales` (product_id, sizeID, cusIDs, qty, price, date) 
                           VALUES ('$product_id', 
                                   '$size', 
                                   " . ($customizations ? "'$customizations'" : "NULL") . ", 
                                   '$quantity', 
                                   '$price', 
                                   NOW())";
                                   
            if (!mysqli_query($conn, $insert_sales_query)) {
                throw new Exception("Failed to insert sales record: " . mysqli_error($conn));
            }
        
            // Update product quantity
            $update_product_query = "UPDATE `products` 
                             SET quantity = quantity - '$quantity' 
                             WHERE id = '$product_id'";
            if (!mysqli_query($conn, $update_product_query)) {
                throw new Exception("Failed to update product quantity: " . mysqli_error($conn));
            }
        
            error_log("Sales record processed and product quantity updated successfully for product ID: " . $product_id);
        }

        mysqli_commit($conn);

        $response['status'] = 'success';
        $response['message'] = 'Payment status updated and sales data inserted successfully!';
        error_log("Transaction committed successfully");
    } catch (Exception $e) {
        mysqli_rollback($conn);
        $response['message'] = $e->getMessage();
        error_log("Error in updatePaymentStatus: " . $e->getMessage());
    }

    echo json_encode($response);
    exit;
}

if (isset($_GET['delete'])) {
    $delete_id = $_GET['delete'];
    $delete_order_query = "DELETE FROM `orders` WHERE id = '$delete_id'";
    mysqli_query($conn, $delete_order_query);
    header('location:admin_orders.php');
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orders</title>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">

    <link rel="stylesheet" href="css/admin_style.css">
    <style>
        main {
            margin-left: 250px;

            margin-right: 0px;
            padding: 20px;
            width: calc(100% - 250px);
            background-color: #f9f9f9;
            min-height: 100vh;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
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

        .orders .heading {
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
            color: #333;
        }

        .table-container {
            background-color: #fff;
            padding: 15px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow-x: auto;
            margin-bottom: 60px;
        }

        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .table-title {
            font-size: 18px;
            color: #333;
            font-weight: bold;
        }

        .total-items {
            font-size: 14px;
            color: #666;
        }

        table.custom-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;

        }

        table.custom-table th,
        table.custom-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        table.custom-table th {
            background-color: #4CAF50;
            color: white;
        }

        table.custom-table tr:nth-child(even) {
            background-color: #f2f2f2;
        }

        table.custom-table tr:hover {
            background-color: #ddd;
        }

        table.custom-table td.price-cell {
            color: #4CAF50;
            font-weight: bold;
        }

        .select {
            padding: 5px;
            border-radius: 5px;
            border: 1px solid #ccc;
        }

        .actions-cell {
            display: flex;
            justify-content: space-between;
        }

        .option-btn {
            padding: 6px 12px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        .option-btn:hover {
            background-color: #45a049;
        }

        .delete-btn {
            padding: 6px 20px;
            background-color: #f44336;
            color: white;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            margin-top: 25px;
            margin-bottom: 25px;
            align-content: center;
        }

        .updatebtn {
            margin-top: 5px;
            padding: 6px 15px;
            background-color: forestgreen;
            color: white;
            border: none;
            border-radius: 5px;
            text-decoration: none;

        }

        .delete-btn:hover {
            background-color: #e53935;
        }

        .alert-info {
            background-color: #d9edf7;
            color: #31708f;
            padding: 10px;
            border-radius: 5px;
            margin-top: 15px;
            text-align: center;
        }

        .search-filter {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            padding: 1rem;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .search-filter form {
            display: flex;
            gap: 1rem;
            width: 100%;
        }

        .search-filter input[type="text"] {
            flex: 1;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%236b7280"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>');
            background-repeat: no-repeat;
            background-position: 0.75rem center;
            background-size: 1.2rem;
        }

        .search-filter select {
            padding: 0.75rem 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            background-color: white;
        }

        .search-filter button {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 6px;
            background-color: #3b82f6;
            color: white;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .search-filter button:hover {
            background-color: #2563eb;
        }



        .delete-btn {
            background-color: #ef4444;
            color: white;
            margin-right: 0.5rem;
        }

        .delete-btn:hover {
            background-color: #dc2626;
        }

        .deliver-btn {
            margin-top: 10px;
            display: inline-block;
            padding: 8px;
            background-color: #28a745;
            color: white;
            font-size: 14px;
            font-weight: bold;
            border-radius: 5px;
            text-decoration: none;
            text-align: center;
            cursor: pointer;
            transition: background-color 0.3s ease;
            height: 35px;
        }

        .deliver-btn:hover {
            background-color: #218838;
        }

        .deliver-btn:active {
            background-color: #1e7e34;
        }

        .search-filter {
            margin-bottom: 2rem;
            display: flex;
            gap: 1rem;
        }

        .search-filter form {
            display: flex;
            gap: 1rem;
            width: 100%;
        }

        .search-filter input[type="text"] {
            flex: 1;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%236b7280"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>');
            background-repeat: no-repeat;
            background-position: 0.75rem center;
            background-size: 1.2rem;
        }

        .search-filter select {
            min-width: 200px;
            padding: 0.75rem 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
        }


        .search-filter button {
            display: none;
        }

        .completed-btn {
            background-color: #4CAF50;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: not-allowed;
            opacity: 0.8;
        }

        .mark-completed-btn {
            background-color: #2196F3;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .mark-completed-btn:hover {
            background-color: #1976D2;
        }

        .error-message {
            color: #ff0000;
            margin-top: 5px;
            font-size: 0.9em;
        }
    </style>
</head>

<body>

    <?php include 'admin_header.php'; ?>
    <main>
        <section class="orders">

            <h1 class="heading">Placed Orders</h1>

            <div class="search-filter">
                <form action="" method="post">
                    <input type="text" name="search_query" placeholder="Search by name or address" value="<?php echo htmlspecialchars($searchQuery); ?>">
                    <select name="payment_status_filter">
                        <option value="">Select Payment Status</option>
                        <option value="pending" <?php echo ($paymentStatusFilter == 'pending') ? 'selected' : ''; ?>>Pending</option>
                        <option value="completed" <?php echo ($paymentStatusFilter == 'completed') ? 'selected' : ''; ?>>Completed</option>
                    </select>
                </form>


            </div>

            <div class="table-container">
                <div class="table-header">
                    <h2 class="table-title">Orders</h2>
                    <span class="total-items">Total: <?php echo mysqli_num_rows($ordersResult); ?></span>
                </div>

                <?php
                if ($ordersResult && mysqli_num_rows($ordersResult) > 0) {
                    echo "<table class='custom-table'>
    <thead>
        <tr>
            <th>Order ID</th>
            <th>Placed on</th>
            <th>Name</th>
            <th>Number</th>
            <th>Address</th>
            <th>Total Products</th>
            <th>Total Price</th>
            <th>Payment Method</th>
            <th>Payment Status</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>";

                    while ($order = mysqli_fetch_assoc($ordersResult)) {
                        $user_id = mysqli_real_escape_string($conn, $order['user_id']);

                        // Fetch user email
                        $user_email_query = "SELECT email FROM `user` WHERE id = '$user_id'";
                        $user_email_result = mysqli_query($conn, $user_email_query);
                        $user_email = '';
                        if ($user_email_result && $email_row = mysqli_fetch_assoc($user_email_result)) {
                            $user_email = $email_row['email'];
                        }

                        // Fetch order items
                        $order_id = mysqli_real_escape_string($conn, $order['id']);
                        $order_items_query = "SELECT * FROM `order_items` WHERE order_id = '$order_id'";
                        $order_items_result = mysqli_query($conn, $order_items_query);

                        $total_products_details = '';
                        while ($item = mysqli_fetch_assoc($order_items_result)) {
                            $size = htmlspecialchars($item['size']);
                            $customizations_display = "No customizations";

                            if (!empty($item['customizations'])) {
                                $customization_ids = explode(',', $item['customizations']);
                                $customization_names = [];

                                foreach ($customization_ids as $cusID) {
                                    $cusID = mysqli_real_escape_string($conn, trim($cusID));
                                    $customization_query = "SELECT cusName FROM `customization` WHERE cusID = '$cusID'";
                                    $customization_result = mysqli_query($conn, $customization_query);

                                    if ($customization_result && $cus_row = mysqli_fetch_assoc($customization_result)) {
                                        $customization_names[] = htmlspecialchars($cus_row['cusName']);
                                    }
                                }

                                $customizations_display = "Customizations: " . implode(', ', $customization_names);
                            }

                            $total_products_details .= "<p><strong>" . htmlspecialchars($item['quantity']) . "x</strong> " . htmlspecialchars($item['name']) . " ($size) - $customizations_display</p>";
                        }

                        echo "<tr>
        <td>#{$order['id']}</td>
        <td>" . htmlspecialchars($order['placed_on']) . "</td>
        <td>" . htmlspecialchars($order['name']) . "</td>
        <td>" . htmlspecialchars($order['number']) . "</td>
        <td>" . htmlspecialchars($order['address']) . "</td>
        <td>{$total_products_details}</td>
        <td class='price-cell'>₱ " . number_format($order['total_price'], 2) . "</td>
        <td>" . htmlspecialchars($order['method']) . "</td>
        <td>";

                        if ($order['payment_status'] == 'completed') {
                            echo "<button class='completed-btn' disabled>Completed</button>";
                        } else {
                            echo "<form class='payment-form' onsubmit='return false;'>
            <input type='hidden' name='order_id' value='{$order['id']}'>
            <button type='button' class='mark-completed-btn' onclick='updatePaymentStatus(this)'>Mark as Completed</button>
            </form>";
                        }

                        echo "</td>
        <td class='actions-cell'>
            <a href='admin_orders.php?delete=" . htmlspecialchars($order['id']) . "' class='delete-btn' onclick='return confirm(\"Delete this order?\");'>
                <i class='fa fa-trash'></i>
            </a>
            <a href='send_order_email.php?order_id=" . htmlspecialchars($order['id']) . "&email=" . htmlspecialchars($user_email) . "' class='send-email-btn'><button type='submit' name='send' class='deliver-btn'>Notify</button></a>
        </td>
        </tr>";
                    }

                    echo "</tbody></table>";
                } else {
                    echo "<div class='alert-info'>No orders placed yet!</div>";
                }
                ?>

            </div>

            <script type="text/javascript">
                function alertUserEmail(email) {
                    alert("The email that will be sent is to: " + email);
                }
            </script>
            <script>
                async function updatePaymentStatus(button) {
                    try {
                        const confirmComplete = confirm('Are you sure? Once marked as completed, this cannot be changed.');
                        if (!confirmComplete) return;

                        const form = button.closest('form');
                        const orderID = form.querySelector('input[name="order_id"]').value;
                        const cell = button.closest('td');
                        const errorDiv = cell.querySelector('.error-message');

                        button.disabled = true;
                        button.textContent = 'Processing...';

                        const formData = new FormData();
                        formData.append('order_id', orderID);
                        formData.append('update_payment', '1');
                        formData.append('ajax', '1');

                        const response = await fetch(window.location.href, {
                            method: 'POST',
                            body: formData
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const data = await response.json();
                        console.log('Server response:', data);

                        if (data.status === 'success') {
                            const completedBtn = document.createElement('button');
                            completedBtn.className = 'completed-btn';
                            completedBtn.disabled = true;
                            completedBtn.textContent = 'Completed';

                            cell.innerHTML = '';
                            cell.appendChild(completedBtn);

                            alert(data.message || 'Payment status updated and sales data inserted!');
                        } else {
                            throw new Error(data.message || 'Failed to update payment status');
                        }

                    } catch (error) {
                        console.error('Error in updatePaymentStatus:', error);

                        const errorDiv = button.closest('td').querySelector('.error-message');
                        if (errorDiv) {
                            errorDiv.textContent = error.message;
                        }

                        button.disabled = false;
                        button.textContent = 'Mark as Completed';

                        alert('Error updating payment status: ' + error.message);
                    }
                }

                let debounceTimeout;

                const searchInput = document.querySelector('input[name="search_query"]');
                const statusFilter = document.querySelector('select[name="payment_status_filter"]');

                function performSearch() {
                    const searchTerm = searchInput.value.toLowerCase();
                    const filterValue = statusFilter.value.toLowerCase();

                    document.querySelectorAll('table tbody tr').forEach(row => {
                        const name = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                        const address = row.querySelector('td:nth-child(5)').textContent.toLowerCase();

                        const statusCell = row.querySelector('td:nth-child(9)');
                        const completedButton = statusCell.querySelector('.completed-btn');
                        const pendingButton = statusCell.querySelector('.mark-completed-btn');

                        let currentStatus = '';
                        if (completedButton) {
                            currentStatus = 'completed';
                        } else if (pendingButton) {
                            currentStatus = 'pending';
                        }

                        const matchesSearch = name.includes(searchTerm) || address.includes(searchTerm);
                        const matchesFilter = !filterValue || currentStatus === filterValue;

                        row.style.display = matchesSearch && matchesFilter ? '' : 'none';
                    });

                    updateTotalCount();
                }

                document.addEventListener('DOMContentLoaded', function() {
                    performSearch();
                });

                function updateTotalCount() {
                    const visibleRows = document.querySelectorAll('table tbody tr[style=""]').length;
                    document.querySelector('.total-items').textContent = `Total: ${visibleRows}`;
                }

                searchInput.addEventListener('input', function() {
                    clearTimeout(debounceTimeout);

                    debounceTimeout = setTimeout(performSearch, 300);
                });

                statusFilter.addEventListener('change', performSearch);

                function updateTotalCount() {

                    const allRows = document.querySelectorAll('table tbody tr');

                    const visibleRows = Array.from(allRows).filter(row => row.style.display !== 'none');

                    document.querySelector('.total-items').textContent = `Total: ${visibleRows.length}`;
                }

                document.addEventListener('DOMContentLoaded', function() {
                    updateTotalCount();
                });

                searchInput.addEventListener('input', function() {
                    clearTimeout(debounceTimeout);
                    debounceTimeout = setTimeout(() => {
                        performSearch();
                        updateTotalCount();
                    }, 300);
                });

                statusFilter.addEventListener('change', function() {
                    performSearch();
                    updateTotalCount();
                });

                searchInput.addEventListener('input', performSearch);
                statusFilter.addEventListener('change', performSearch);

                document.querySelectorAll('form').forEach(form => {
                    form.addEventListener('submit', async function(e) {
                        e.preventDefault();
                        const formData = new FormData(this);
                        const paymentStatus = this.querySelector('select[name="payment_status"]').value;

                        try {
                            const response = await fetch('admin_orders.php', {
                                method: 'POST',
                                body: formData
                            });

                            if (response.ok) {
                                if (paymentStatus === 'completed') {
                                    this.innerHTML = '<span class="completed-status">Completed</span>';
                                    alert('Payment status updated and sales data inserted!');
                                    location.reload();
                                }
                            }
                        } catch (error) {
                            alert('Error updating payment status');
                        }
                    });
                });
            </script>
            <script src="js/admin_script.js"></script>
    </main>
</body>

</html>