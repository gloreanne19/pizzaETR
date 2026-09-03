<?php
include 'config.php';
session_start();

$admin_id = $_SESSION['admin_id'];

if (!isset($admin_id)) {
    header('location:admin_login.php');
}

$userResult = $conn->query("SELECT * FROM `user`");


if (isset($_GET['delete'])) {
    $delete_id = $_GET['delete'];
    $delete_user= $conn->prepare("DELETE FROM `user` WHERE id = ?");
    $delete_user->execute([$delete_id]);
    header('location:admin_orders.php');
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Users</title>

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

        .users .heading {
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
    </style>
</head>

<body>

    <?php include 'admin_header.php'; ?>
    <main>
        <section class="orders">

            <h1 class="heading">Users</h1>

            <div class="table-container">
                <div class="table-header">
                    <h2 class="table-title">Users</h2>
                    <span class="total-items">Total: <?php echo mysqli_num_rows($userResult); ?></span>
                </div>

                <?php
                if ($userResult && mysqli_num_rows($userResult) > 0) {
                    echo "<table class='custom-table'>
            <thead>
                <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Actions</th>

                </tr>
            </thead>
            <tbody>";


                    while ($user = mysqli_fetch_assoc($userResult)) {
                        echo "<tr>
                <td>" . htmlspecialchars($user['id']) . "</td>
                <td>" . htmlspecialchars($user['name']) . "</td>
                <td> " . htmlspecialchars($user['email']) . "</td>
              
                <td class='actions-cell'>
                  <a href='users_accounts.php?delete=" . $user['id'] . "' class='delete-btn' onclick='return confirm(\"delete this order?\");'>Delete</a>
                </td>
            </tr>";
                    }

                    echo "</tbody></table>";
                } else {
                    echo "<div class='alert-info'>No orders placed yet!</div>";
                }
                ?>
            </div>

            <script src="js/admin_script.js"></script>
    </main>
</body>

</html>