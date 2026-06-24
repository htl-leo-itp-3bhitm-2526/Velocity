<?php
// Database configuration
define('DB_HOST', 'db_server');
define('DB_USER', 'root');
define('DB_PASS', 'rootpassword');
define('DB_NAME', 'velocity_db');

function getConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        $conn->set_charset("utf8mb4");
        return $conn;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
        exit;
    }
}

function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?: [];
}

function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function sendError($message, $statusCode = 400) {
    sendJson(["error" => $message], $statusCode);
}

function getLoggedInUser() {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    return [
        'id' => $_SESSION['user_id'],
        'email' => $_SESSION['user_email'],
        'name' => $_SESSION['user_name'],
        'picture' => $_SESSION['user_picture'] ?? ''
    ];
}

function requireLogin() {
    $user = getLoggedInUser();
    if (!$user) {
        sendError("Nicht angemeldet. Bitte melde dich zuerst an.", 401);
    }
    return $user;
}