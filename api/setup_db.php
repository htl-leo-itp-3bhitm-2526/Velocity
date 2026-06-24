<?php
/**
 * Database Setup Script
 * Run this once to create all tables.
 * Access: http://localhost:8080/Velocity/api/setup_db.php
 */

require_once __DIR__ . '/config/database.php';

// First connect without selecting a database
try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

$conn->set_charset("utf8mb4");

// Create database if not exists
$conn->query("CREATE DATABASE IF NOT EXISTS " . DB_NAME);
$conn->select_db(DB_NAME);

// Users table
$conn->query("CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    picture VARCHAR(500) DEFAULT '',
    password_hash VARCHAR(255) DEFAULT NULL,
    auth_provider ENUM('google', 'email') DEFAULT 'google',
    streak INT DEFAULT 0,
    points INT DEFAULT 0,
    total_trash_kg DECIMAL(10,2) DEFAULT 0.00,
    total_water_l DECIMAL(10,2) DEFAULT 0.00,
    level INT DEFAULT 1,
    level_title VARCHAR(100) DEFAULT 'Green Seed',
    xp INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    last_streak_date DATE NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Tasks table
$conn->query("CREATE TABLE IF NOT EXISTS user_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_icon VARCHAR(100) DEFAULT 'fas fa-check',
    points INT DEFAULT 0,
    is_daily TINYINT(1) DEFAULT 0,
    status ENUM('accepted', 'completed', 'cancelled') DEFAULT 'accepted',
    accepted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_date TIMESTAMP NULL,
    proof_images TEXT DEFAULT NULL,
    proof_uploaded_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Friends table
$conn->query("CREATE TABLE IF NOT EXISTS friends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (user_id, friend_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Chat messages table
$conn->query("CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'friend_request', 'friend_request_response') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Badges table
$conn->query("CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_key VARCHAR(100) NOT NULL,
    badge_name VARCHAR(255) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_badge (user_id, badge_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

echo json_encode(["success" => true, "message" => "Datenbank erfolgreich eingerichtet!"]);