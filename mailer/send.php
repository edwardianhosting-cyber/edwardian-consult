<?php
/**
 * Edwardian Educational Consult — PHP Mailer for InfinityFree
 * Upload this file to: htdocs/mailer/send.php
 * 
 * REQUIREMENTS:
 * 1. Upload this file to InfinityFree htdocs/mailer/send.php
 * 2. Download PHPMailer from https://github.com/PHPMailer/PHPMailer
 * 3. Upload the entire "src" folder from PHPMailer as "phpmailer" to htdocs/
 *    So you should have:
 *    - htdocs/mailer/send.php
 *    - htdocs/phpmailer/Exception.php
 *    - htdocs/phpmailer/PHPMailer.php
 *    - htdocs/phpmailer/SMTP.php
 */

// ─── Config ──────────────────────────────────────────────────────────────────

define('API_KEY',    'eiec-mailer-2026');
define('SMTP_HOST',  'mail.edwardianeducationalconsult.com.ng');
define('SMTP_PORT',  587);
define('SMTP_USER',  'registrar@edwardianeducationalconsult.com.ng');
define('SMTP_PASS',  'YOUR_WHOGOHOST_EMAIL_PASSWORD'); // <-- REPLACE THIS
define('FROM_NAME',  'Edwardian Educational Consult');
define('FROM_EMAIL', 'registrar@edwardianeducationalconsult.com.ng');

// ─── CORS headers ─────────────────────────────────────────────────────────────

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ─── Only allow POST ──────────────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// ─── Auth check ───────────────────────────────────────────────────────────────

$authHeader = '';
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
}

$token = '';
if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    $token = trim($matches[1]);
}

if ($token !== API_KEY) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

// ─── Parse request body ───────────────────────────────────────────────────────

$body = json_decode(file_get_contents('php://input'), true);

if (!$body) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
    exit();
}

$to      = isset($body['to'])      ? trim($body['to'])      : '';
$subject = isset($body['subject']) ? trim($body['subject']) : '';
$html    = isset($body['html'])    ? $body['html']           : '';

if (!$to || !$subject || !$html) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'to, subject, and html are required']);
    exit();
}

// Validate email address
if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit();
}

// ─── Send email via PHPMailer ─────────────────────────────────────────────────

require_once __DIR__ . '/phpmailer/Exception.php';
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';

$mail = new PHPMailer\PHPMailer\PHPMailer(true);

try {
    // SMTP settings
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ],
    ];

    // Sender & recipient
    $mail->setFrom(FROM_EMAIL, FROM_NAME);
    $mail->addAddress($to);

    // Content
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    $mail->Subject = $subject;
    $mail->Body    = $html;
    $mail->AltBody = strip_tags($html);

    $mail->send();

    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Email failed: ' . $mail->ErrorInfo
    ]);
}
