<?php
/**
 * Authentication API
 * POST /api/auth.php?action=login - Login with Google
 * POST /api/auth.php?action=logout - Logout
 * GET  /api/auth.php?action=check - Check if logged in
 */

require_once __DIR__ . '/config/database.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    case 'login':
        if ($method !== 'POST') sendError("Method not allowed", 405);
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check':
        handleCheck();
        break;
    case 'register_email':
        if ($method !== 'POST') sendError("Method not allowed", 405);
        handleEmailRegister();
        break;
    case 'login_email':
        if ($method !== 'POST') sendError("Method not allowed", 405);
        handleEmailLogin();
        break;
    default:
        sendError("Unknown action", 400);
}

function handleLogin() {
    $input = getJsonInput();
    $email = trim($input['email'] ?? '');
    $name = trim($input['name'] ?? '');
    $picture = trim($input['picture'] ?? '');

    if (empty($email) || empty($name)) {
        sendError("Email and name required");
    }

    $conn = getConnection();

    // Check if user exists
    $stmt = $conn->prepare("SELECT id, name, email, picture, streak, points, level, level_title, xp FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Update existing user
        $user = $result->fetch_assoc();
        $stmt = $conn->prepare("UPDATE users SET name = ?, picture = ?, last_login = NOW() WHERE email = ?");
        $stmt->bind_param("sss", $name, $picture, $email);
        $stmt->execute();
    } else {
        // Create new user
        $stmt = $conn->prepare("INSERT INTO users (email, name, picture, auth_provider, last_login) VALUES (?, ?, ?, 'google', NOW())");
        $stmt->bind_param("sss", $email, $name, $picture);
        $stmt->execute();

        $userId = $conn->insert_id;
        $user = [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'picture' => $picture,
            'streak' => 0,
            'points' => 0,
            'level' => 1,
            'level_title' => 'Green Seed',
            'xp' => 0
        ];
    }

    // Set session
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_picture'] = $user['picture'] ?? $picture;

    sendJson([
        "success" => true,
        "user" => [
            "id" => $user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "picture" => $user['picture'] ?? $picture,
            "streak" => (int)$user['streak'],
            "points" => (int)$user['points'],
            "level" => (int)$user['level'],
            "level_title" => $user['level_title'],
            "xp" => (int)$user['xp']
        ]
    ]);
}

function handleEmailRegister() {
    $input = getJsonInput();
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $name = trim($input['name'] ?? '');

    if (empty($email) || empty($password) || empty($name)) {
        sendError("Email, password and name required");
    }
    if (strlen($password) < 6) {
        sendError("Password must be at least 6 characters");
    }

    $conn = getConnection();

    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        sendError("Email already registered");
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (email, name, password_hash, auth_provider, last_login) VALUES (?, ?, ?, 'email', NOW())");
    $stmt->bind_param("sss", $email, $name, $passwordHash);
    $stmt->execute();

    $userId = $conn->insert_id;

    session_start();
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_picture'] = '';

    sendJson([
        "success" => true,
        "user" => [
            "id" => $userId,
            "name" => $name,
            "email" => $email,
            "picture" => '',
            "streak" => 0,
            "points" => 0,
            "level" => 1,
            "level_title" => 'Green Seed',
            "xp" => 0
        ]
    ]);
}

function handleEmailLogin() {
    $input = getJsonInput();
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        sendError("Email and password required");
    }

    $conn = getConnection();

    $stmt = $conn->prepare("SELECT id, name, email, picture, password_hash, streak, points, level, level_title, xp FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendError("Invalid email or password", 401);
    }

    $user = $result->fetch_assoc();

    if (!password_verify($password, $user['password_hash'])) {
        sendError("Invalid email or password", 401);
    }

    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_picture'] = $user['picture'] ?? '';

    // Update last login
    $stmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();

    sendJson([
        "success" => true,
        "user" => [
            "id" => $user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "picture" => $user['picture'] ?? '',
            "streak" => (int)$user['streak'],
            "points" => (int)$user['points'],
            "level" => (int)$user['level'],
            "level_title" => $user['level_title'],
            "xp" => (int)$user['xp']
        ]
    ]);
}

function handleLogout() {
    session_start();
    session_destroy();
    sendJson(["success" => true, "message" => "Logged out"]);
}

function handleCheck() {
    $user = getLoggedInUser();
    if (!$user) {
        sendJson(["loggedIn" => false], 200);
        return;
    }

    $conn = getConnection();
    $stmt = $conn->prepare("SELECT id, name, email, picture, streak, points, level, level_title, xp FROM users WHERE id = ?");
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        session_destroy();
        sendJson(["loggedIn" => false], 200);
        return;
    }

    $dbUser = $result->fetch_assoc();
    sendJson([
        "loggedIn" => true,
        "user" => [
            "id" => (int)$dbUser['id'],
            "name" => $dbUser['name'],
            "email" => $dbUser['email'],
            "picture" => $dbUser['picture'] ?? '',
            "streak" => (int)$dbUser['streak'],
            "points" => (int)$dbUser['points'],
            "level" => (int)$dbUser['level'],
            "level_title" => $dbUser['level_title'],
            "xp" => (int)$dbUser['xp']
        ]
    ]);
}