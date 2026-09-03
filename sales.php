<?php
include 'config.php';
session_start();

$admin_id = $_SESSION['admin_id'];

if (!isset($admin_id)) {
    header('location:admin_login.php');
}


$product_name = isset($_POST['product_name']) ? $_POST['product_name'] : '';
$start_date = isset($_POST['start_date']) ? $_POST['start_date'] : '';
$end_date = isset($_POST['end_date']) ? $_POST['end_date'] : '';

// Build where clause for filtering
$where_clause = "WHERE 1";
if (!empty($product_name)) {
    $product_name = mysqli_real_escape_string($conn, $product_name);
    $where_clause .= " AND p.name LIKE '%$product_name%'";
}

if (!empty($start_date) && !empty($end_date)) {
    $where_clause .= " AND s.date BETWEEN '$start_date' AND '$end_date'";
}

$salesQuery = "
    SELECT 
        p.name AS product_name,
        p.price AS product_price,
        s.price AS sale_price,
        s.qty,
        s.date,
        sz.sizename,
        sz.sizeprice,
        GROUP_CONCAT(DISTINCT c.cusName ORDER BY c.cusName SEPARATOR ', ') AS customization_names,
        GROUP_CONCAT(DISTINCT c.cusPrice ORDER BY c.cusName SEPARATOR ', ') AS customization_prices
    FROM sales s
    JOIN products p ON s.product_id = p.id
    LEFT JOIN size sz ON s.sizeID = sz.sizeID
    LEFT JOIN (
        SELECT cusID, cusName, cusPrice 
        FROM customization
        WHERE FIND_IN_SET(cusID, (SELECT GROUP_CONCAT(DISTINCT cusIDs) FROM sales))
    ) c ON FIND_IN_SET(c.cusID, s.cusIDs) > 0
    $where_clause
    GROUP BY s.id, p.name, p.price, s.price, s.qty, s.date, sz.sizename, sz.sizeprice
    ORDER BY s.date DESC
";

$salesResult = mysqli_query($conn, $salesQuery);


$summaryQuery = "
    SELECT 
        COUNT(DISTINCT s.id) as total_orders,
        SUM(s.qty) as total_quantity,
        SUM(s.price * s.qty) as total_revenue,
        AVG(s.price * s.qty) as average_order_value
    FROM sales s
    JOIN products p ON s.product_id = p.id
    $where_clause
";

$summaryResult = mysqli_query($conn, $summaryQuery);
$summary = mysqli_fetch_assoc($summaryResult);


$topProductsQuery = "
    SELECT 
        p.name,
        SUM(s.qty) as total_quantity,
        p.price as unit_price,
        SUM(s.price * s.qty) as total_revenue
    FROM sales s
    JOIN products p ON s.product_id = p.id
    $where_clause
    GROUP BY p.id, p.name, p.price
    ORDER BY total_quantity DESC
    LIMIT 5
";

$topProductsResult = mysqli_query($conn, $topProductsQuery);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sales Report</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
    <link rel="stylesheet" href="css/admin_style.css">
    <style>
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .summary-card {
            background: #fff;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .summary-card h3 {
            color: #666;
            margin-bottom: 0.5rem;
        }

        .summary-card .value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #333;
        }

        .top-products {
            background: #fff;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .calculation {
            color: #666;
            font-style: italic;
        }

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



        .alert-info {
            background-color: #d9edf7;
            color: #31708f;
            padding: 10px;
            border-radius: 5px;
            margin-top: 15px;
            text-align: center;
        }

        .filter-form {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            background-color: #f9f9f9;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            flex: 1 1 calc(33.333% - 1rem);
            min-width: 200px;
        }

        .form-group label {
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: #333;
        }

        .form-group input {
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }

        .form-group input:focus {
            border-color: #007bff;
            outline: none;
        }

        .filter-btn {
            background-color: #007bff;
            color: white;
            font-size: 1rem;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            align-self: flex-start;
            margin-top: auto;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .filter-btn:hover {
            background-color: #0056b3;
        }

        .filter-btn i {
            font-size: 1.2rem;
        }
    </style>
</head>
<body>

<?php include 'admin_header.php'; ?>
<main>
    <section class="sales-report">
        <h1 class="heading">Sales Summary Report</h1>

        <!-- Filter Form -->
        <form method="POST" action="" class="filter-form">
            <div class="form-group">
                <label for="product_name">Product Name</label>
                <input type="text" id="product_name" name="product_name"
                    placeholder="Enter Product Name"
                    value="<?php echo htmlspecialchars($product_name); ?>" />
            </div>

            <div class="form-group">
                <label for="start_date">Start Date</label>
                <input type="date" id="start_date" name="start_date"
                    value="<?php echo htmlspecialchars($start_date); ?>" />
            </div>

            <div class="form-group">
                <label for="end_date">End Date</label>
                <input type="date" id="end_date" name="end_date"
                    value="<?php echo htmlspecialchars($end_date); ?>" />
            </div>

            <button type="submit" class="filter-btn">
                <i class="fas fa-filter"></i> Apply Filters
            </button>
        </form>

     
        <div class="summary-cards">
            <div class="summary-card">
                <h3><i class="fas fa-shopping-cart"></i> Total Orders</h3>
                <div class="value"><?php echo number_format($summary['total_orders']); ?></div>
            </div>
            <div class="summary-card">
                <h3><i class="fas fa-box"></i> Total Items Sold</h3>
                <div class="value"><?php echo number_format($summary['total_quantity']); ?></div>
            </div>
            <div class="summary-card">
                <h3><i class="fas fa-peso-sign"></i> Total Revenue</h3>
                <div class="value">₱<?php echo number_format($summary['total_revenue'], 2); ?></div>
            </div>
            <div class="summary-card">
                <h3><i class="fas fa-chart-line"></i> Average Order Value</h3>
                <div class="value">₱<?php echo number_format($summary['average_order_value'], 2); ?></div>
            </div>
        </div>

   
        <div class="top-products">
            <h2><i class="fas fa-star"></i> Top Selling Products</h2>
            <table class="custom-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Quantity Sold</th>
                        <th>Unit Price</th>
                        <th>Total Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($product = mysqli_fetch_assoc($topProductsResult)) { ?>
                        <tr>
                            <td><?php echo htmlspecialchars($product['name']); ?></td>
                            <td><?php echo number_format($product['total_quantity']); ?></td>
                            <td>₱<?php echo number_format($product['unit_price']); ?></td>
                            <td class="price-cell">₱<?php echo number_format($product['total_revenue'], 2); ?></td>
                        </tr>
                    <?php } ?>
                </tbody>
            </table>
        </div>

        <div class="table-container">
            <div class="table-header">
                <h2 class="table-title">Detailed Sales Report</h2>
            </div>

            <?php
            if ($salesResult && mysqli_num_rows($salesResult) > 0) {
                echo "<table class='custom-table'>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Base Price</th>
                            <th>Size</th>
                            <th>Size Price</th>
                            <th>Customizations</th>
                            <th>Customization Price</th>
                            <th>Total Price</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>";

                while ($sale = mysqli_fetch_assoc($salesResult)) {
                    $customizations = $sale['customization_names'] ?: 'None';
                    $customization_prices = $sale['customization_prices'] ?: '0';
                    $size = $sale['sizename'] ?: 'Standard';
                    $size_price = $sale['sizeprice'] ?: '0';
                    
                
                    $total_per_item = $sale['sale_price'];
                    $final_total = $total_per_item * $sale['qty'];

                    echo "<tr>
                        <td>" . htmlspecialchars($sale['product_name']) . "</td>
                        <td>" . htmlspecialchars($sale['qty']) . "</td>
                        <td class='price-cell'>₱" . number_format($sale['product_price'], 2) . "</td>
                        <td>" . htmlspecialchars($size) . "</td>
                        <td class='price-cell'>₱" . number_format($size_price, 2) . "</td>
                        <td>" . htmlspecialchars($customizations) . "</td>
                      <td class='price-cell'>₱" . htmlspecialchars($customization_prices) . "</td>

                        <td class='price-cell'>₱" . number_format($final_total, 2) . "</td>
                        <td>" . htmlspecialchars($sale['date']) . "</td>
                    </tr>";
                }

                echo "</tbody></table>";
            } else {
                echo "<div class='alert-info'>No sales data available!</div>";
            }
            ?>
        </div>
    </section>
    <script src="js/admin_script.js"></script>
</main>
</body>
</html>