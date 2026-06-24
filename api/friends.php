<?php
/**
 * Friends API
 * GET  /api/friends.php?action=list - Get friends list
 * POST /api/friends.php?action=request - Send friend request
 * POST /api/friends.php?action=respond - Accept/decline request
 * GET  /api/friends.php?action=requests - Get pending requests
 * POST /api/friends.php?action=chat - Send chat message
 * GET  /api/friends.php?action=chat_messages - Get chat messages
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
    case 'list':
        handleFriendsList($user);
        break;
    case 'request':
        handleSendRequest($user);
        break;
    case 'respond':
        handleRespondRequest($user);
        break;
    case 'requests':
        handleGetRequests($user);
        break;
    case 'chat':
        handleSendChat($user);
        break;
    case 'chat_messages':
        handleGetChatMessages($user);
        break;
    default:
        sendError("Unknown action", 400);
}

function handleFriendsList($user) {
    $userId = $user['id'];
    $conn = getConnection();

    // Get accepted friends
    $stmt = $conn->prepare("
        SELECT u.id, u.name, u.email, u.picture, u.streak, u.points, u.level, u.level_title
        FROM friends f
        JOIN users u ON (CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END) = u.id
        WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
    ");
    $stmt->bind_param("iii", $userId, $userId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $friends = [];
    while ($row = $result->fetch_assoc()) {
        $friends[] = [
            "id" => (int)$row['id'],
            "name" => $row['name'],
            "email" => $row['email'],
            "picture" => $row['picture'] ?? '',
            "streak" => (int)$row['streak'],
            "points" => (int)$row['points'],
            "level" => (int)$row['level'],
            "level_title" => $row['level_title'],
            "isFriend" => true
        ];
    }

    sendJson(["friends" => $friends]);
}

function handleSendRequest($user) {
    $input = getJsonInput();
    $friendEmail = trim($input['email'] ?? '');

    if (empty($friendEmail)) {
        sendError("Friend email required");
    }

    $userId = $user['id'];
    $conn = getConnection();

    // Find friend by email
    $stmt = $conn->prepare("SELECT id, name, email FROM users WHERE email = ?");
    $stmt->bind_param("s", $friendEmail);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendError("User not found");
    }

    $friend = $result->fetch_assoc();
    $friendId = (int)$friend['id'];

    if ($friendId === $userId) {
        sendError("Cannot add yourself");
    }

    // Check if already friends
    $stmt = $conn->prepare("SELECT id, status FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)");
    $stmt->bind_param("iiii", $userId, $friendId, $friendId, $userId);
    $stmt->execute();
    $existing = $stmt->get_result();

    if ($existing->num_rows > 0) {
        $row = $existing->fetch_assoc();
        if ($row['status'] === 'accepted') {
            sendError("Already friends");
        }
        if ($row['status'] === 'pending') {
            sendError("Friend request already sent");
        }
    }

    // Send friend request
    $stmt = $conn->prepare("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'pending')");
    $stmt->bind_param("ii", $userId, $friendId);
    $stmt->execute();

    // Add chat message for the request
    $message = $user['name'] . " hat dir eine Freundschaftsanfrage geschickt.";
    $stmt = $conn->prepare("INSERT INTO chat_messages (sender_id, receiver_id, message, message_type) VALUES (?, ?, ?, 'friend_request')");
    $stmt->bind_param("iis", $userId, $friendId, $message);
    $stmt->execute();

    sendJson(["success" => true, "message" => "Friend request sent"]);
}

function handleRespondRequest($user) {
    $input = getJsonInput();
    $requestId = (int)($input['request_id'] ?? 0);
    $action = $input['action'] ?? ''; // 'accept' or 'decline'

    if ($requestId === 0 || !in_array($action, ['accept', 'decline'])) {
        sendError("Request ID and action (accept/decline) required");
    }

    $userId = $user['id'];
    $conn = getConnection();

    // Verify request exists and is for this user
    $stmt = $conn->prepare("SELECT f.id, f.user_id, f.friend_id, u.name as sender_name FROM friends f JOIN users u ON f.user_id = u.id WHERE f.id = ? AND f.friend_id = ? AND f.status = 'pending'");
    $stmt->bind_param("ii", $requestId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendError("Friend request not found");
    }

    $request = $result->fetch_assoc();
    $newStatus = ($action === 'accept') ? 'accepted' : 'declined';

    $stmt = $conn->prepare("UPDATE friends SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $newStatus, $requestId);
    $stmt->execute();

    if ($action === 'accept') {
        $message = $user['name'] . " hat deine Freundschaftsanfrage angenommen.";
    } else {
        $message = $user['name'] . " hat deine Freundschaftsanfrage abgelehnt.";
    }

    $stmt = $conn->prepare("INSERT INTO chat_messages (sender_id, receiver_id, message, message_type) VALUES (?, ?, ?, 'friend_request_response')");
    $stmt->bind_param("iis", $userId, $request['user_id'], $message);
    $stmt->execute();

    sendJson(["success" => true, "message" => "Request " . $action . "ed"]);
}

function handleGetRequests($user) {
    $userId = $user['id'];
    $conn = getConnection();

    $stmt = $conn->prepare("
        SELECT f.id, f.user_id as from_id, u.name as from_name, u.email as from_email, f.created_at
        FROM friends f
        JOIN users u ON f.user_id = u.id
        WHERE f.friend_id = ? AND f.status = 'pending'
        ORDER BY f.created_at DESC
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $requests = [];
    while ($row = $result->fetch_assoc()) {
        $requests[] = [
            "id" => (int)$row['id'],
            "from_id" => (int)$row['from_id'],
            "from_name" => $row['from_name'],
            "from_email" => $row['from_email'],
            "created_at" => $row['created_at']
        ];
    }

    sendJson(["requests" => $requests]);
}

function handleSendChat($user) {
    $input = getJsonInput();
    $receiverEmail = trim($input['receiver'] ?? '');
    $message = trim($input['message'] ?? '');

    if (empty($receiverEmail) || empty($message)) {
        sendError("Receiver email and message required");
    }

    $userId = $user['id'];
    $conn = getConnection();

    // Find receiver
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $receiverEmail);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendError("Receiver not found");
    }

    $receiverId = (int)$result->fetch_assoc()['id'];

    // Check if friends
    $stmt = $conn->prepare("SELECT id FROM friends WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status = 'accepted'");
    $stmt->bind_param("iiii", $userId, $receiverId, $receiverId, $userId);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        sendError("You can only chat with friends");
    }

    $stmt = $conn->prepare("INSERT INTO chat_messages (sender_id, receiver_id, message, message_type) VALUES (?, ?, ?, 'text')");
    $stmt->bind_param("iis", $userId, $receiverId, $message);
    $stmt->execute();

    sendJson(["success" => true, "message" => "Message sent"]);
}

function handleGetChatMessages($user) {
    $friendEmail = trim($_GET['friend'] ?? '');
    if (empty($friendEmail)) {
        sendError("Friend email required");
    }

    $userId = $user['id'];
    $conn = getConnection();

    // Find friend
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $friendEmail);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendError("Friend not found");
    }

    $friendId = (int)$result->fetch_assoc()['id'];

    $stmt = $conn->prepare("
        SELECT cm.message, cm.message_type, cm.created_at, u.name as sender_name, u.email as sender_email
        FROM chat_messages cm
        JOIN users u ON cm.sender_id = u.id
        WHERE (cm.sender_id = ? AND cm.receiver_id = ?) OR (cm.sender_id = ? AND cm.receiver_id = ?)
        ORDER BY cm.created_at ASC
        LIMIT 100
    ");
    $stmt->bind_param("iiii", $userId, $friendId, $friendId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = [
            "sender" => $row['sender_email'],
            "sender_name" => $row['sender_name'],
            "text" => $row['message'],
            "type" => $row['message_type'],
            "timestamp" => $row['created_at']
        ];
    }

    sendJson(["messages" => $messages]);
}