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
    picture LONGTEXT,
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

// Task definitions table (predefined tasks from DB)
$conn->query("CREATE TABLE IF NOT EXISTS task_definitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_type ENUM('weekly', 'daily') NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_icon VARCHAR(100) DEFAULT 'fas fa-check',
    proof_url VARCHAR(500) DEFAULT '',
    points INT DEFAULT 10
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// User tasks table
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
    proof_images LONGTEXT DEFAULT NULL,
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

// Drop old available_tasks table if it exists (replaced by task_definitions)
$conn->query("DROP TABLE IF EXISTS available_tasks");

// Migration: upgrade proof_images from TEXT to LONGTEXT to support large base64 images
$conn->query("ALTER TABLE user_tasks MODIFY COLUMN proof_images LONGTEXT DEFAULT NULL");
// Migration: upgrade picture to LONGTEXT to support base64 profile photos
$conn->query("ALTER TABLE users MODIFY COLUMN picture LONGTEXT");

// ===== SEED DATA: Clear existing and re-insert =====
$conn->query("DELETE FROM task_definitions");

// Weekly Tasks (50)
$weeklyTasks = [
    ['Müll im Wald sammeln', 'fas fa-recycle', 50],
    ['Mit dem Fahrrad zur Arbeit', 'fas fa-bicycle', 30],
    ['Plastikfrei einkaufen', 'fas fa-shopping-bag', 40],
    ['Energiesparen zu Hause', 'fas fa-lightbulb', 25],
    ['Wasser sparen', 'fas fa-droplet', 25],
    ['Pflanze einen Baum', 'fas fa-tree', 60],
    ['Vegetarischer Tag', 'fas fa-leaf', 20],
    ['Öffentliche Verkehrsmittel nutzen', 'fas fa-bus', 30],
    ['Kompost machen', 'fas fa-leaf', 35],
    ['Secondhand-Einkauf', 'fas fa-shirt', 30],
    ['Nachbarn zum Umweltschutz motivieren', 'fas fa-handshake', 40],
    ['Naturschutzgebiet besuchen', 'fas fa-mountain', 25],
    ['Stromsparende Geräte anschaffen', 'fas fa-plug', 45],
    ['Regentonnen aufstellen', 'fas fa-droplet', 35],
    ['Bienenfreundliche Pflanzen säen', 'fas fa-flower', 35],
    ['Plastikfreie Verpackung verwenden', 'fas fa-box-open', 30],
    ['Carpool-Fahrt organisieren', 'fas fa-car', 30],
    ['Lokale Produkte kaufen', 'fas fa-apple', 20],
    ['Müll sortieren und recyceln', 'fas fa-trash', 20],
    ['DIY-Reparaturkurs besuchen', 'fas fa-hammer', 40],
    ['Umweltfilm schauen und lernen', 'fas fa-film', 20],
    ['Wildblumenwiese anlegen', 'fas fa-clover', 45],
    ['Nachhaltige Kosmetik testen', 'fas fa-spray-can', 20],
    ['Grüne Wanderung unternehmen', 'fas fa-person-hiking', 25],
    ['Stromliste optimieren', 'fas fa-chart-line', 30],
    ['Plastiktüten durch Beutel ersetzen', 'fas fa-bag-shopping', 20],
    ['Umwelt-Webinar besuchen', 'fas fa-globe', 30],
    ['Nachhaltige Mode kaufen', 'fas fa-shirt', 30],
    ['Garten ohne Chemikalien pflegen', 'fas fa-flower', 25],
    ['Flussufer reinigen', 'fas fa-water', 50],
    ['Bio-Produkte kaufen', 'fas fa-carrot', 20],
    ['Duschzeit verkürzen', 'fas fa-shower', 15],
    ['Freunde zum Umweltschutz einladen', 'fas fa-users', 30],
    ['Solaranlage prüfen', 'fas fa-sun', 35],
    ['Abfallarme Einkaufsrouten planen', 'fas fa-map', 20],
    ['Nachhaltige Technologie kaufen', 'fas fa-laptop', 40],
    ['Tierfreundlichen Garten gestalten', 'fas fa-paw', 35],
    ['Regenwasser sammeln', 'fas fa-cloud-rain', 25],
    ['Bedrohte Tierarten unterstützen', 'fas fa-dove', 45],
    ['Nachhaltige Finanzprodukte wählen', 'fas fa-money-bill', 30],
    ['Klimaziele planen', 'fas fa-bullseye', 20],
    ['Umweltzertifikate überprüfen', 'fas fa-certificate', 20],
    ['Waldspaziergang machen', 'fas fa-tree', 15],
    ['Nachbarschaftsgarten nutzen', 'fas fa-leaf', 25],
    ['Klimafreundlich kochen', 'fas fa-utensils', 20],
    ['Naturschutzorganisation unterstützen', 'fas fa-heart', 35],
    ['Nachhaltigkeit reflektieren', 'fas fa-person-praying', 15],
    ['Grüne Apps nutzen', 'fas fa-mobile', 15],
    ['Umweltfreundliche Versicherung wählen', 'fas fa-shield', 30],
    ['Nachhaltigkeitsziele überprüfen', 'fas fa-check', 15]
];

// Daily Tasks (100)
$dailyTasks = [
    ['Wasser beim Zähneputzen sparen', 'fas fa-water', 5],
    ['Licht ausschalten', 'fas fa-lightbulb', 5],
    ['Zu Fuß gehen statt Auto fahren', 'fas fa-person-walking', 10],
    ['Müll korrekt trennen', 'fas fa-trash', 5],
    ['Energiesparende Geräte nutzen', 'fas fa-plug', 5],
    ['Fleischfrei essen', 'fas fa-salad', 10],
    ['Dusche statt Bad nehmen', 'fas fa-shower', 5],
    ['Plastikverpackungen vermeiden', 'fas fa-ban', 10],
    ['Wiederverwendbare Behälter nutzen', 'fas fa-box', 5],
    ['Heizung regulieren', 'fas fa-temperature-low', 5],
    ['Fahrrad statt Auto', 'fas fa-bicycle', 10],
    ['Öffis statt Auto', 'fas fa-bus', 10],
    ['Kaffee in eigener Tasse', 'fas fa-mug-hot', 5],
    ['Lebensmittel nicht verschwenden', 'fas fa-apple', 10],
    ['Gebrauchte Kleidung tragen', 'fas fa-shirt', 5],
    ['Digitale statt Papier-Rechnung', 'fas fa-envelope', 5],
    ['Pflanzen gießen', 'fas fa-leaf', 5],
    ['Batterien richtig entsorgen', 'fas fa-battery-full', 5],
    ['Nachhaltiges Shopping planen', 'fas fa-list', 5],
    ['Umweltfreundliches Putzmittel verwenden', 'fas fa-spray-can', 5],
    ['Insekten-freundliche Umgebung schaffen', 'fas fa-bug', 10],
    ['Grüne Webseiten nutzen', 'fas fa-globe', 5],
    ['Luftqualität überprüfen', 'fas fa-wind', 5],
    ['Naturfreunde treffen', 'fas fa-people-group', 10],
    ['Biologische Lebensmittel essen', 'fas fa-carrot', 10],
    ['Fußabdruck berechnen', 'fas fa-chart-line', 5],
    ['Werbebriefe abmelden', 'fas fa-envelopes-bulk', 5],
    ['Klimakompensation überprüfen', 'fas fa-leaf', 5],
    ['Nachhaltige Marken recherchieren', 'fas fa-search', 5],
    ['Kostenlos tauschen statt kaufen', 'fas fa-exchange', 10],
    ['Umwelttipps teilen', 'fas fa-share-nodes', 5],
    ['Naturschutzgebiet respektieren', 'fas fa-hand', 5],
    ['Grüne Alternativen finden', 'fas fa-leaf', 5],
    ['Nachbarn über Umwelt sprechen', 'fas fa-comments', 5],
    ['Wasserhahn nicht laufen lassen', 'fas fa-water', 5],
    ['Nachhaltige Finanzen planen', 'fas fa-money-bill', 10],
    ['Öko-Produkte nutzen', 'fas fa-leaf', 5],
    ['Energie-Rechnung prüfen', 'fas fa-chart-pie', 5],
    ['Pflanze des Tages retten', 'fas fa-flower', 5],
    ['Müll vermeiden', 'fas fa-ban', 10],
    ['Nachhaltig verpackt einkaufen', 'fas fa-package', 5],
    ['Umweltfreundlich waschen', 'fas fa-droplet', 5],
    ['Grüne Inspirationen sammeln', 'fas fa-bookmark', 5],
    ['Tiere beobachten', 'fas fa-binoculars', 5],
    ['Nachhaltig kochen', 'fas fa-pot-food', 10],
    ['Obst und Gemüse lokal kaufen', 'fas fa-apple', 10],
    ['Wasser-Fußabdruck reduzieren', 'fas fa-droplet', 5],
    ['Naturschutz unterstützen', 'fas fa-hands-praying', 10],
    ['Grüne Mobilität checken', 'fas fa-car', 5],
    ['Nachhaltiges Frühstück', 'fas fa-bread-slice', 5],
    ['Alte Kleidung weitergeben', 'fas fa-person-dots', 5],
    ['Umweltnachrichten lesen', 'fas fa-newspaper', 5],
    ['Wäsche bei niedriger Temperatur waschen', 'fas fa-washing-machine', 5],
    ['Klimafreundlich pendeln', 'fas fa-person-walking', 10],
    ['Naturbeobachtung', 'fas fa-leaf', 5],
    ['Grüne Gedanken notieren', 'fas fa-pen', 5],
    ['Umweltziele reflektieren', 'fas fa-person-praying', 5],
    ['Nachhaltige Mode überprüfen', 'fas fa-shirt', 5],
    ['Elektronik-Müll vermeiden', 'fas fa-ban', 10],
    ['Bio-Lebensmittel genießen', 'fas fa-leaf', 5],
    ['Grüne Routine etablieren', 'fas fa-repeat', 5],
    ['Wasser sparen beim Duschen', 'fas fa-shower', 5],
    ['Umweltfreundlich reisen', 'fas fa-map', 10],
    ['Nachhaltige Geschenke kaufen', 'fas fa-gift', 10],
    ['Natur fotografieren', 'fas fa-camera', 5],
    ['Grüne Gemeinschaft pflegen', 'fas fa-handshake', 10],
    ['Lebensmittel-Reste verwerten', 'fas fa-utensils', 5],
    ['Nachhaltige Hautpflege nutzen', 'fas fa-droplet', 5],
    ['Umweltschutz-App nutzen', 'fas fa-mobile', 5],
    ['Natur-Yoga machen', 'fas fa-person', 10],
    ['Grüne Cafés besuchen', 'fas fa-leaf', 5],
    ['Nachhaltig waschen', 'fas fa-droplet', 5],
    ['Umweltzertifikate prüfen', 'fas fa-certificate', 5],
    ['Grüne Dekorationen nutzen', 'fas fa-flower', 5],
    ['Nachhaltige Hobbys', 'fas fa-heart', 5],
    ['Natur-Workout', 'fas fa-person-hiking', 10],
    ['Grüne Gebäude erkunden', 'fas fa-building', 5],
    ['Nachhaltige Meetings', 'fas fa-comments', 5],
    ['Umweltstress reduzieren', 'fas fa-spa', 5],
    ['Grüne Oasen schaffen', 'fas fa-leaf', 10],
    ['Nachhaltig einkaufen', 'fas fa-bag-shopping', 10],
    ['Wasser-Qualität prüfen', 'fas fa-droplet', 5],
    ['Grüne Energien nutzen', 'fas fa-sun', 10],
    ['Nachhaltige Nachbarn unterstützen', 'fas fa-hand', 5],
    ['Umwelt-Journal schreiben', 'fas fa-book', 5],
    ['Grüne Inspiration teilen', 'fas fa-share', 5],
    ['Nachhaltige Kreativität', 'fas fa-palette', 5],
    ['Natur-Spaziergang', 'fas fa-person-walking', 5],
    ['Grüne Routinen ausbauen', 'fas fa-repeat', 5],
    ['Nachhaltige Freundschaften pflegen', 'fas fa-handshake', 5],
    ['Umweltliche Gesten', 'fas fa-hands-praying', 5],
    ['Grüne Gedanken sammeln', 'fas fa-lightbulb', 5],
    ['Nachhaltige Pausen einbauen', 'fas fa-leaf', 5],
    ['Umwelt-Podcast hören', 'fas fa-headphones', 5],
    ['Grüne Tradition starten', 'fas fa-star', 5],
    ['Nachhaltige Ziele visualisieren', 'fas fa-eye', 5],
    ['Umwelt-Erkenntnisse teilen', 'fas fa-share-nodes', 5],
    ['Grüner Alltag feststellen', 'fas fa-check', 5],
    ['Nachhaltige Reflexion', 'fas fa-person-praying', 5],
    ['Nächste grüne Aktion planen', 'fas fa-calendar', 5]
];

// Insert weekly tasks
$stmt = $conn->prepare("INSERT INTO task_definitions (task_type, task_name, task_icon, points) VALUES ('weekly', ?, ?, ?)");
foreach ($weeklyTasks as $task) {
    $stmt->bind_param("ssi", $task[0], $task[1], $task[2]);
    $stmt->execute();
}
$stmt->close();

// Insert daily tasks
$stmt = $conn->prepare("INSERT INTO task_definitions (task_type, task_name, task_icon, points) VALUES ('daily', ?, ?, ?)");
foreach ($dailyTasks as $task) {
    $stmt->bind_param("ssi", $task[0], $task[1], $task[2]);
    $stmt->execute();
}
$stmt->close();

echo json_encode(["success" => true, "message" => "Datenbank erfolgreich eingerichtet mit allen 150 Aufgaben!"]);