<?php
/**
 * Tasks API
 * POST /api/tasks.php?action=accept - Accept a task
 * POST /api/tasks.php?action=upload_proof - Upload proof images
 * POST /api/tasks.php?action=complete - Complete a task
 * GET  /api/tasks.php?action=my_tasks - Get user's tasks
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
    case 'accept':
        handleAcceptTask($user);
        break;
    case 'upload_proof':
        handleUploadProof($user);
        break;
    case 'complete':
        handleCompleteTask($user);
        break;
    case 'my_tasks':
        handleGetMyTasks($user);
        break;
    case 'recent_uploads':
        handleRecentUploads($user);
        break;
    default:
        sendError("Unknown action", 400);
}

function handleAcceptTask($user) {
    $input = getJsonInput();
    $taskName = trim($input['task_name'] ?? '');
    $taskIcon = trim($input['task_icon'] ?? 'fas fa-check');
    $points = (int)($input['points'] ?? 0);
    $isDaily = (int)($input['is_daily'] ?? 0);

    if (empty($taskName)) {
        sendError("Task name required");
    }

    $userId = $user['id'];
    $conn = getConnection();

    // Check if already accepted today
    if ($isDaily) {
        $today = date('Y-m-d');
        $stmt = $conn->prepare("SELECT id FROM user_tasks WHERE user_id = ? AND task_name = ? AND is_daily = 1 AND DATE(accepted_date) = ?");
        $stmt->bind_param("iss", $userId, $taskName, $today);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            sendError("Task already accepted today");
        }
    }

    // Check if already accepted (for non-daily)
    $stmt = $conn->prepare("SELECT id, status FROM user_tasks WHERE user_id = ? AND task_name = ? AND status = 'accepted'");
    $stmt->bind_param("is", $userId, $taskName);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        sendError("Task already accepted");
    }

    $stmt = $conn->prepare("INSERT INTO user_tasks (user_id, task_name, task_icon, points, is_daily, status) VALUES (?, ?, ?, ?, ?, 'accepted')");
    $stmt->bind_param("issii", $userId, $taskName, $taskIcon, $points, $isDaily);
    $stmt->execute();

    sendJson([
        "success" => true,
        "task" => [
            "id" => $conn->insert_id,
            "task_name" => $taskName,
            "task_icon" => $taskIcon,
            "points" => $points,
            "is_daily" => $isDaily,
            "status" => "accepted"
        ]
    ]);
}

function handleUploadProof($user) {
    $input = getJsonInput();
    $taskId = (int)($input['task_id'] ?? 0);
    $proofImages = $input['proof_images'] ?? []; // Array of base64 data URIs
    $fileNames = $input['file_names'] ?? [];

    if ($taskId === 0 || empty($proofImages)) {
        sendError("Task ID and proof images required");
    }

    $userId = $user['id'];
    $conn = getConnection();

    // Verify task belongs to user
    $stmt = $conn->prepare("SELECT id FROM user_tasks WHERE id = ? AND user_id = ? AND status = 'accepted'");
    $stmt->bind_param("ii", $taskId, $userId);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        sendError("Task not found or already completed");
    }

    $proofData = json_encode([
        'images' => $proofImages,
        'names' => $fileNames
    ]);

    $stmt = $conn->prepare("UPDATE user_tasks SET proof_images = ?, proof_uploaded_at = NOW() WHERE id = ?");
    $stmt->bind_param("si", $proofData, $taskId);
    $stmt->execute();

    sendJson(["success" => true, "message" => "Proof uploaded"]);
}

function handleCompleteTask($user) {
    $input = getJsonInput();
    $taskId = (int)($input['task_id'] ?? 0);

    if ($taskId === 0) {
        sendError("Task ID required");
    }

    $userId = $user['id'];
    $conn = getConnection();

    // Verify task belongs to user and has proof
    $stmt = $conn->prepare("SELECT id, points, is_daily, task_name FROM user_tasks WHERE id = ? AND user_id = ? AND status = 'accepted' AND proof_images IS NOT NULL");
    $stmt->bind_param("ii", $taskId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendError("Task not found, already completed, or no proof uploaded");
    }

    $task = $result->fetch_assoc();

    // Update task status
    $stmt = $conn->prepare("UPDATE user_tasks SET status = 'completed', completed_date = NOW() WHERE id = ?");
    $stmt->bind_param("i", $taskId);
    $stmt->execute();

    // Award points to user
    $points = (int)$task['points'];
    if ($points > 0) {
        $stmt = $conn->prepare("UPDATE users SET points = points + ?, xp = xp + ? WHERE id = ?");
        $stmt->bind_param("iii", $points, $points, $userId);
        $stmt->execute();
    }

    // If daily task, update streak
    if ($task['is_daily']) {
        $today = date('Y-m-d');
        $stmt = $conn->prepare("UPDATE users SET streak = streak + 1, last_streak_date = ? WHERE id = ?");
        $stmt->bind_param("si", $today, $userId);
        $stmt->execute();
    }

    sendJson([
        "success" => true,
        "message" => "Task completed",
        "points_awarded" => $points
    ]);
}

function handleGetMyTasks($user) {
    $userId = $user['id'];
    $conn = getConnection();

    $stmt = $conn->prepare("SELECT id, task_name, task_icon, points, is_daily, status, accepted_date, completed_date, proof_uploaded_at FROM user_tasks WHERE user_id = ? ORDER BY accepted_date DESC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $task = [
            "id" => (int)$row['id'],
            "task_name" => $row['task_name'],
            "task_icon" => $row['task_icon'],
            "points" => (int)$row['points'],
            "is_daily" => (bool)$row['is_daily'],
            "status" => $row['status'],
            "accepted_date" => $row['accepted_date'],
            "completed_date" => $row['completed_date'],
            "proof_uploaded_at" => $row['proof_uploaded_at'],
            "has_proof" => false
        ];

        // Check if proof exists
        $stmt2 = $conn->prepare("SELECT proof_images FROM user_tasks WHERE id = ?");
        $stmt2->bind_param("i", $row['id']);
        $stmt2->execute();
        $proofResult = $stmt2->get_result();
        if ($proofRow = $proofResult->fetch_assoc()) {
            $task['has_proof'] = !empty($proofRow['proof_images']);
        }

        $tasks[] = $task;
    }

    sendJson(["tasks" => $tasks]);
}

function handleRecentUploads($user) {
    $conn = getConnection();

    $stmt = $conn->prepare("
        SELECT ut.id, ut.task_name, ut.proof_images, ut.proof_uploaded_at, u.name as user_name
        FROM user_tasks ut
        JOIN users u ON ut.user_id = u.id
        WHERE ut.proof_images IS NOT NULL AND ut.proof_images != ''
        ORDER BY ut.proof_uploaded_at DESC
        LIMIT 3
    ");
    $stmt->execute();
    $result = $stmt->get_result();

    $uploads = [];
    while ($row = $result->fetch_assoc()) {
        $proofData = json_decode($row['proof_images'], true);
        $uploads[] = [
            "id" => $row['id'],
            "task_name" => $row['task_name'],
            "user_name" => $row['user_name'],
            "proof_images" => $proofData['images'] ?? [],
            "file_names" => $proofData['names'] ?? [],
            "uploaded_at" => $row['proof_uploaded_at']
        ];
    }

    sendJson(["uploads" => $uploads]);
}