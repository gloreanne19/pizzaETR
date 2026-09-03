<?php

include 'config.php'; 

session_start();

if (isset($_POST['login'])) {
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $pass = sha1($_POST['pass']);

    $query = "SELECT * FROM `user` WHERE email = '$email' AND password = '$pass'";

    $result = mysqli_query($conn, $query);

    if ($result && mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);

        $_SESSION['user_id'] = $row['id'];
        $_SESSION['message'] = 'Login Successfully!';
        header('location:index.php');
        exit();
    } else {
        $_SESSION['message'] = 'Incorrect email or password!';
        header('location:index.php');
        exit();
    }
}
?>
