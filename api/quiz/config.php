<?php
// API Quiz Backend - MySQL Connection (XAMPP Local / Infinity Free)
// Configure these values to match your MySQL database

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Force HTTPS
if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
    header("Location: https://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ============================================
// DATABASE CONFIGURATION - EDIT THESE VALUES
// ============================================
$db_host     = 'localhost';      // MySQL host (localhost for XAMPP, sqlXXX.infinityfree.com for Infinity Free)
$db_port     = '3306';           // MySQL port
$db_name     = 'edwardian_local'; // Your database name
$db_user     = 'root';           // Your MySQL user (XAMPP default: root)
$db_password = '';               // Your MySQL password (XAMPP default: empty)

// Connect to MySQL using MySQLi
$conn = mysqli_connect($db_host, $db_user, $db_password, $db_name);

if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . mysqli_connect_error()]);
    exit();
}

// Ensure charset
mysqli_set_charset($conn, 'utf8mb4');

/**
 * Generate a unique 6-digit game PIN
 */
function generatePin($conn) {
    do {
        $pin = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $res = mysqli_query($conn, "SELECT COUNT(*) FROM quiz_sessions WHERE pin = '$pin'");
    } while (mysqli_fetch_row($res)[0] > 0);
    return $pin;
}

/**
 * Ensure quiz tables exist in MySQL
 */
function ensureTables($conn) {
    mysqli_query($conn, "
        CREATE TABLE IF NOT EXISTS quiz_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pin VARCHAR(6) UNIQUE NOT NULL,
            status VARCHAR(20) DEFAULT 'lobby',
            subjects TEXT DEFAULT '[]',
            question_ids TEXT DEFAULT '[]',
            current_question_id INT DEFAULT NULL,
            question_index INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ");
    mysqli_query($conn, "
        CREATE TABLE IF NOT EXISTS quiz_players (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_pin VARCHAR(6) NOT NULL,
            name VARCHAR(100) NOT NULL,
            score INT DEFAULT 0,
            answered TINYINT(1) DEFAULT 0,
            answer_time INT DEFAULT 0,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX(session_pin)
        );
    ");
    mysqli_query($conn, "
        CREATE TABLE IF NOT EXISTS quiz_session_questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_pin VARCHAR(6) NOT NULL,
            question_id INT NOT NULL,
            question_text TEXT NOT NULL,
            option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT,
            correct_option INT DEFAULT 0,
            explanation TEXT,
            asked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX(session_pin)
        );
    ");
    mysqli_query($conn, "
        CREATE TABLE IF NOT EXISTS quiz_player_answers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_pin VARCHAR(6) NOT NULL,
            player_name VARCHAR(100) NOT NULL,
            question_id INT NOT NULL,
            answer_index INT NOT NULL,
            is_correct TINYINT(1) DEFAULT 0,
            points INT DEFAULT 0,
            answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ");
}

// Ensure tables exist on every request
ensureTables($conn);
