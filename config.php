<?php

 

 $db_host = "localhost";
 $db_name = "pizza_pizza";
 $username = "root";
 $password = "";

 // Create connection
 $conn = mysqli_connect($db_host, $username, $password, $db_name);

 // Check connection
 if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
 }


?>