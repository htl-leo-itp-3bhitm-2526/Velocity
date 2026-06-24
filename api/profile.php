<?php
/**
 * Profile API
 * GET  /api/profile.php?action=get - Get user profile
 * POST /api/profile.php?action=update - Update profile stats
 * GET  /api/profile.php?action=users - Get all users (for friends)
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
$user = requireLogin();

switch ($action) {
    case 'get':
        handleGetProfile($user);
        break;
    case 'update':
        handleUpdateProfile($user);
        break;
    case 'users':
        handleGetUsers($user);
        break;
    default:
        sendError("Unknown action", 400);
}

function handleGetProfile($user) {
    $userId = $user['id'];
    $conn = getConnection();

    $stmt = $conn->prepare("SELECT id, name, email, picture, streak, points, total_trash_kg, total_water_l, level, level_title, xp, created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendError("User not found", 404);
    }

    $profile = $result->fetch_assoc();

    // Get completed tasks count
    $stmt = $conn->prepare("SELECT COUNT(*) as completed_count FROM user_tasks WHERE user_id = ? AND status = 'completed'");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $taskResult = $stmt->get_result();
    $taskData = $taskResult->fetch_assoc();

    // Get badges
    $stmt = $conn->prepare("SELECT badge_key, badge_name, earned_at FROM user_badges WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $badgesResult = $stmt->get_result();
    $badges = [];
    while ($badge = $badgesResult->fetch_assoc()) {
        $badges[] = $badge;
    }

    sendJson([
        "profile" => [
            "id" => (int)$profile['id'],
            "name" => $profile['name'],
            "email" => $profile['email'],
            "picture" => $profile['picture'] ?? '',
            "streak" => (int)$profile['streak'],
            "points" => (int)$profile['points'],
            "total_trash_kg" => (float)$profile['total_trash_kg'],
            "total_water_l" => (float)$profile['total_water_l'],
            "level" => (int)$profile['level'],
            "level_title" => $profile['level_title'],
            "xp" => (int)$profile['xp'],
            "completed_tasks" => (int)$taskData['completed_count'],
            "badges" => $badges,
            "created_at" => $profile['created_at']
        ]
    ]);
}

function handleUpdateProfile($user) {
    $input = getJsonInput();
    $userId = $user['id'];
    $conn = getConnection();

    $updates = [];
    $params = [];
    $types = '';

    if (isset($input['total_trash_kg'])) {
        $updates[] = "total_trash_kg = ?";
        $params[] = (float)$input['total_trash_kg'];
        $types .= 'd';
    }
    if (isset($input['total_water_l'])) {
        $updates[] = "total_water_l = ?";
        $params[] = (float)$input['total_water_l'];
        $types .= 'd';
    }
    if (isset($input['name'])) {
        $updates[] = "name = ?";
        $params[] = trim($input['name']);
        $types .= 's';
    }

    if (empty($updates)) {
        sendError("No fields to update");
    }

    $params[] = $userId;
    $types .= 'i';

    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();

    sendJson(["success" => true, "message" => "Profile updated"]);
}

function handleGetUsers($user) {
    $userId = $user['id'];
    $conn = getConnection();

    $stmt = $conn->prepare("SELECT id, name, email, picture, streak, points, level, level_title FROM users WHERE id != ? ORDER BY points DESC LIMIT 50");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            "id" => (int)$row['id'],
            "name" => $row['name'],
            "email" => $row['email'],
            "picture" => $row['picture'] ?? '',
            "streak" => (int)$row['streak'],
            "points" => (int)$row['points'],
            "level" => (int)$row['level'],
            "level_title" => $row['level_title']
        ];
    }

    sendJson(["users" => $users]);
}