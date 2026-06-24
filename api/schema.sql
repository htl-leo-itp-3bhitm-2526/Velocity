-- ============================================================
-- Velocity - Complete Database Schema + Initial Data
-- ============================================================

CREATE DATABASE IF NOT EXISTS velocity_db;
USE velocity_db;

-- ============================================================
-- TABLES
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Task definitions (predefined tasks from tasks.json)
CREATE TABLE IF NOT EXISTS task_definitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_type ENUM('weekly', 'daily') NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_icon VARCHAR(100) DEFAULT 'fas fa-check',
    proof_url VARCHAR(500) DEFAULT '',
    points INT DEFAULT 10
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User tasks (accepted/completed by users)
CREATE TABLE IF NOT EXISTS user_tasks (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Friends table
CREATE TABLE IF NOT EXISTS friends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (user_id, friend_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'friend_request', 'friend_request_response') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_key VARCHAR(100) NOT NULL,
    badge_name VARCHAR(255) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_badge (user_id, badge_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SEED DATA: Weekly Tasks (50)
-- ============================================================
INSERT INTO task_definitions (task_type, task_name, task_icon, proof_url, points) VALUES
('weekly', 'Müll im Wald sammeln', 'fas fa-recycle', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 50),
('weekly', 'Mit dem Fahrrad zur Arbeit', 'fas fa-bicycle', 'https://pixabay.com/photos/cycle-sign-lane-street-road-6676225/', 30),
('weekly', 'Plastikfrei einkaufen', 'fas fa-shopping-bag', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 40),
('weekly', 'Energiesparen zu Hause', 'fas fa-lightbulb', 'https://pixabay.com/photos/lightbulb-pear-electricity-energy-1640351/', 25),
('weekly', 'Wasser sparen', 'fas fa-droplet', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 25),
('weekly', 'Pflanze einen Baum', 'fas fa-tree', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 60),
('weekly', 'Vegetarischer Tag', 'fas fa-leaf', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 20),
('weekly', 'Öffentliche Verkehrsmittel nutzen', 'fas fa-bus', 'https://pixabay.com/photos/train-station-platform-railway-3384786/', 30),
('weekly', 'Kompost machen', 'fas fa-leaf', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 35),
('weekly', 'Secondhand-Einkauf', 'fas fa-shirt', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 30),
('weekly', 'Nachbarn zum Umweltschutz motivieren', 'fas fa-handshake', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 40),
('weekly', 'Naturschutzgebiet besuchen', 'fas fa-mountain', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 25),
('weekly', 'Stromsparende Geräte anschaffen', 'fas fa-plug', 'https://pixabay.com/images/download/x-2565575_1920.jpg', 45),
('weekly', 'Regentonnen aufstellen', 'fas fa-droplet', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 35),
('weekly', 'Bienenfreundliche Pflanzen säen', 'fas fa-flower', 'https://pixabay.com/photos/bee-biene-spring-natur-nature-5324760/', 35),
('weekly', 'Plastikfreie Verpackung verwenden', 'fas fa-box-open', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 30),
('weekly', 'Carpool-Fahrt organisieren', 'fas fa-car', 'https://pixabay.com/photos/train-station-platform-railway-3384786/', 30),
('weekly', 'Lokale Produkte kaufen', 'fas fa-apple', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 20),
('weekly', 'Müll sortieren und recyceln', 'fas fa-trash', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 20),
('weekly', 'DIY-Reparaturkurs besuchen', 'fas fa-hammer', 'https://pixabay.com/images/download/x-2565575_1920.jpg', 40),
('weekly', 'Umweltfilm schauen und lernen', 'fas fa-film', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 20),
('weekly', 'Wildblumenwiese anlegen', 'fas fa-clover', 'https://pixabay.com/photos/bee-biene-spring-natur-nature-5324760/', 45),
('weekly', 'Nachhaltige Kosmetik testen', 'fas fa-spray-can', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 20),
('weekly', 'Grüne Wanderung unternehmen', 'fas fa-person-hiking', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 25),
('weekly', 'Stromliste optimieren', 'fas fa-chart-line', 'https://pixabay.com/photos/lightbulb-pear-electricity-energy-1640351/', 30),
('weekly', 'Plastiktüten durch Beutel ersetzen', 'fas fa-bag-shopping', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 20),
('weekly', 'Umwelt-Webinar besuchen', 'fas fa-globe', 'https://pixabay.com/images/download/x-2565575_1920.jpg', 30),
('weekly', 'Nachhaltige Mode kaufen', 'fas fa-shirt', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 30),
('weekly', 'Garten ohne Chemikalien pflegen', 'fas fa-flower', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 25),
('weekly', 'Flussufer reinigen', 'fas fa-water', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 50),
('weekly', 'Bio-Produkte kaufen', 'fas fa-carrot', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 20),
('weekly', 'Duschzeit verkürzen', 'fas fa-shower', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 15),
('weekly', 'Freunde zum Umweltschutz einladen', 'fas fa-users', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 30),
('weekly', 'Solaranlage prüfen', 'fas fa-sun', 'https://pixabay.com/images/download/x-2565575_1920.jpg', 35),
('weekly', 'Abfallarme Einkaufsrouten planen', 'fas fa-map', 'https://pixabay.com/photos/cycle-sign-lane-street-road-6676225/', 20),
('weekly', 'Nachhaltige Technologie kaufen', 'fas fa-laptop', 'https://pixabay.com/images/download/x-2565575_1920.jpg', 40),
('weekly', 'Tierfreundlichen Garten gestalten', 'fas fa-paw', 'https://pixabay.com/photos/bee-biene-spring-natur-nature-5324760/', 35),
('weekly', 'Regenwasser sammeln', 'fas fa-cloud-rain', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 25),
('weekly', 'Bedrohte Tierarten unterstützen', 'fas fa-dove', 'https://pixabay.com/photos/bee-biene-spring-natur-nature-5324760/', 45),
('weekly', 'Nachhaltige Finanzprodukte wählen', 'fas fa-money-bill', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 30),
('weekly', 'Klimaziele planen', 'fas fa-bullseye', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 20),
('weekly', 'Umweltzertifikate überprüfen', 'fas fa-certificate', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 20),
('weekly', 'Waldspaziergang machen', 'fas fa-tree', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 15),
('weekly', 'Nachbarschaftsgarten nutzen', 'fas fa-leaf', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 25),
('weekly', 'Klimafreundlich kochen', 'fas fa-utensils', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 20),
('weekly', 'Naturschutzorganisation unterstützen', 'fas fa-heart', 'https://pixabay.com/photos/bee-biene-spring-natur-nature-5324760/', 35),
('weekly', 'Nachhaltigkeit reflektieren', 'fas fa-person-praying', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 15),
('weekly', 'Grüne Apps nutzen', 'fas fa-mobile', 'https://pixabay.com/images/download/x-2565575_1920.jpg', 15),
('weekly', 'Umweltfreundliche Versicherung wählen', 'fas fa-shield', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 30),
('weekly', 'Nachhaltigkeitsziele überprüfen', 'fas fa-check', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 15);

-- ============================================================
-- SEED DATA: Daily Tasks (100)
-- ============================================================
INSERT INTO task_definitions (task_type, task_name, task_icon, proof_url, points) VALUES
('daily', 'Wasser beim Zähneputzen sparen', 'fas fa-water', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 5),
('daily', 'Licht ausschalten', 'fas fa-lightbulb', 'https://pixabay.com/photos/lightbulb-pear-electricity-energy-1640351/', 5),
('daily', 'Zu Fuß gehen statt Auto fahren', 'fas fa-person-walking', 'https://pixabay.com/photos/cycle-sign-lane-street-road-6676225/', 10),
('daily', 'Müll korrekt trennen', 'fas fa-trash', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 5),
('daily', 'Energiesparende Geräte nutzen', 'fas fa-plug', 'https://pixabay.com/images/download/x-2565575_1920.jpg', 5),
('daily', 'Fleischfrei essen', 'fas fa-salad', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 10),
('daily', 'Dusche statt Bad nehmen', 'fas fa-shower', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 5),
('daily', 'Plastikverpackungen vermeiden', 'fas fa-ban', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 10),
('daily', 'Wiederverwendbare Behälter nutzen', 'fas fa-box', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 5),
('daily', 'Heizung regulieren', 'fas fa-temperature-low', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Fahrrad statt Auto', 'fas fa-bicycle', 'https://pixabay.com/photos/cycle-sign-lane-street-road-6676225/', 10),
('daily', 'Öffis statt Auto', 'fas fa-bus', 'https://pixabay.com/photos/train-station-platform-railway-3384786/', 10),
('daily', 'Kaffee in eigener Tasse', 'fas fa-mug-hot', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 5),
('daily', 'Lebensmittel nicht verschwenden', 'fas fa-apple', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 10),
('daily', 'Gebrauchte Kleidung tragen', 'fas fa-shirt', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 5),
('daily', 'Digitale statt Papier-Rechnung', 'fas fa-envelope', 'https://pixabay.com/images/download/x-2565575_1920.jpg', 5),
('daily', 'Pflanzen gießen', 'fas fa-leaf', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 5),
('daily', 'Batterien richtig entsorgen', 'fas fa-battery-full', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 5),
('daily', 'Nachhaltiges Shopping planen', 'fas fa-list', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 5),
('daily', 'Umweltfreundliches Putzmittel verwenden', 'fas fa-spray-can', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 5),
('daily', 'Insekten-freundliche Umgebung schaffen', 'fas fa-bug', 'https://pixabay.com/photos/bee-biene-spring-natur-nature-5324760/', 10),
('daily', 'Grüne Webseiten nutzen', 'fas fa-globe', 'https://pixabay.com/images/download/x-2565575_1920.jpg', 5),
('daily', 'Luftqualität überprüfen', 'fas fa-wind', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 5),
('daily', 'Naturfreunde treffen', 'fas fa-people-group', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 10),
('daily', 'Biologische Lebensmittel essen', 'fas fa-carrot', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 10),
('daily', 'Fußabdruck berechnen', 'fas fa-chart-line', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Werbebriefe abmelden', 'fas fa-envelopes-bulk', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 5),
('daily', 'Klimakompensation überprüfen', 'fas fa-leaf', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 5),
('daily', 'Nachhaltige Marken recherchieren', 'fas fa-search', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 5),
('daily', 'Kostenlos tauschen statt kaufen', 'fas fa-exchange', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 10),
('daily', 'Umwelttipps teilen', 'fas fa-share-nodes', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Naturschutzgebiet respektieren', 'fas fa-hand', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 5),
('daily', 'Grüne Alternativen finden', 'fas fa-leaf', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 5),
('daily', 'Nachbarn über Umwelt sprechen', 'fas fa-comments', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Wasserhahn nicht laufen lassen', 'fas fa-water', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 5),
('daily', 'Nachhaltige Finanzen planen', 'fas fa-money-bill', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 10),
('daily', 'Öko-Produkte nutzen', 'fas fa-leaf', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 5),
('daily', 'Energie-Rechnung prüfen', 'fas fa-chart-pie', 'https://pixabay.com/photos/lightbulb-pear-electricity-energy-1640351/', 5),
('daily', 'Pflanze des Tages retten', 'fas fa-flower', 'https://pixabay.com/photos/bee-biene-spring-natur-nature-5324760/', 5),
('daily', 'Müll vermeiden', 'fas fa-ban', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 10),
('daily', 'Nachhaltig verpackt einkaufen', 'fas fa-package', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 5),
('daily', 'Umweltfreundlich waschen', 'fas fa-droplet', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 5),
('daily', 'Grüne Inspirationen sammeln', 'fas fa-bookmark', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 5),
('daily', 'Tiere beobachten', 'fas fa-binoculars', 'https://pixabay.com/photos/bee-biene-spring-natur-nature-5324760/', 5),
('daily', 'Nachhaltig kochen', 'fas fa-pot-food', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 10),
('daily', 'Obst und Gemüse lokal kaufen', 'fas fa-apple', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 10),
('daily', 'Wasser-Fußabdruck reduzieren', 'fas fa-droplet', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 5),
('daily', 'Naturschutz unterstützen', 'fas fa-hands-praying', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 10),
('daily', 'Grüne Mobilität checken', 'fas fa-car', 'https://pixabay.com/photos/cycle-sign-lane-street-road-6676225/', 5),
('daily', 'Nachhaltiges Frühstück', 'fas fa-bread-slice', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 5),
('daily', 'Alte Kleidung weitergeben', 'fas fa-person-dots', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 5),
('daily', 'Umweltnachrichten lesen', 'fas fa-newspaper', 'https://pixabay.com/images/download/x-2565575_1920.jpg', 5),
('daily', 'Wäsche bei niedriger Temperatur waschen', 'fas fa-washing-machine', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 5),
('daily', 'Klimafreundlich pendeln', 'fas fa-person-walking', 'https://pixabay.com/photos/cycle-sign-lane-street-road-6676225/', 10),
('daily', 'Naturbeobachtung', 'fas fa-leaf', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 5),
('daily', 'Grüne Gedanken notieren', 'fas fa-pen', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Umweltziele reflektieren', 'fas fa-person-praying', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Nachhaltige Mode überprüfen', 'fas fa-shirt', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 5),
('daily', 'Elektronik-Müll vermeiden', 'fas fa-ban', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 10),
('daily', 'Bio-Lebensmittel genießen', 'fas fa-leaf', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 5),
('daily', 'Grüne Routine etablieren', 'fas fa-repeat', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Wasser sparen beim Duschen', 'fas fa-shower', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 5),
('daily', 'Umweltfreundlich reisen', 'fas fa-map', 'https://pixabay.com/photos/train-station-platform-railway-3384786/', 10),
('daily', 'Nachhaltige Geschenke kaufen', 'fas fa-gift', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 10),
('daily', 'Natur fotografieren', 'fas fa-camera', 'https://pixabay.com/photos/bee-biene-spring-natur-nature-5324760/', 5),
('daily', 'Grüne Gemeinschaft pflegen', 'fas fa-handshake', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 10),
('daily', 'Lebensmittel-Reste verwerten', 'fas fa-utensils', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 5),
('daily', 'Nachhaltige Hautpflege nutzen', 'fas fa-droplet', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 5),
('daily', 'Umweltschutz-App nutzen', 'fas fa-mobile', 'https://pixabay.com/images/download/x-2565575_1920.jpg', 5),
('daily', 'Natur-Yoga machen', 'fas fa-person', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 10),
('daily', 'Grüne Cafés besuchen', 'fas fa-leaf', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 5),
('daily', 'Nachhaltig waschen', 'fas fa-droplet', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 5),
('daily', 'Umweltzertifikate prüfen', 'fas fa-certificate', 'https://pixabay.com/photos/the-bottle-plastic-segregation-5128607/', 5),
('daily', 'Grüne Dekorationen nutzen', 'fas fa-flower', 'https://pixabay.com/photos/bee-biene-spring-natur-nature-5324760/', 5),
('daily', 'Nachhaltige Hobbys', 'fas fa-heart', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Natur-Workout', 'fas fa-person-hiking', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 10),
('daily', 'Grüne Gebäude erkunden', 'fas fa-building', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Nachhaltige Meetings', 'fas fa-comments', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Umweltstress reduzieren', 'fas fa-spa', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 5),
('daily', 'Grüne Oasen schaffen', 'fas fa-leaf', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 10),
('daily', 'Nachhaltig einkaufen', 'fas fa-bag-shopping', 'https://pixabay.com/photos/grocery-shopping-supermarket-1232944/', 10),
('daily', 'Wasser-Qualität prüfen', 'fas fa-droplet', 'https://pixabay.com/photos/flower-nature-bloom-spring-plant-5107724/', 5),
('daily', 'Grüne Energien nutzen', 'fas fa-sun', 'https://pixabay.com/images/download/x-2565575_1920.jpg', 10),
('daily', 'Nachhaltige Nachbarn unterstützen', 'fas fa-hand', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Umwelt-Journal schreiben', 'fas fa-book', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Grüne Inspiration teilen', 'fas fa-share', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Nachhaltige Kreativität', 'fas fa-palette', 'https://pixabay.com/photos/bee-biene-spring-natur-nature-5324760/', 5),
('daily', 'Natur-Spaziergang', 'fas fa-person-walking', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 5),
('daily', 'Grüne Routinen ausbauen', 'fas fa-repeat', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Nachhaltige Freundschaften pflegen', 'fas fa-handshake', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Umweltliche Gesten', 'fas fa-hands-praying', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Grüne Gedanken sammeln', 'fas fa-lightbulb', 'https://pixabay.com/photos/lightbulb-pear-electricity-energy-1640351/', 5),
('daily', 'Nachhaltige Pausen einbauen', 'fas fa-leaf', 'https://pixabay.com/photos/natur-grass-summer-green-spring-818749/', 5),
('daily', 'Umwelt-Podcast hören', 'fas fa-headphones', 'https://pixabay.com/images/download/x-2565575_1920.jpg', 5),
('daily', 'Grüne Tradition starten', 'fas fa-star', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Nachhaltige Ziele visualisieren', 'fas fa-eye', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Umwelt-Erkenntnisse teilen', 'fas fa-share-nodes', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Grüner Alltag feststellen', 'fas fa-check', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Nachhaltige Reflexion', 'fas fa-person-praying', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5),
('daily', 'Nächste grüne Aktion planen', 'fas fa-calendar', 'https://pixabay.com/photos/holiday-home-summer-house-house-177401/', 5);