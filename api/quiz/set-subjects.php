<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$pin      = $data['pin'] ?? '';
$subjects = $data['subjects'] ?? [];

if (!$pin) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'PIN required']);
    exit();
}

// Update subjects filter for this session
mysqli_query($conn, 
    "UPDATE quiz_sessions SET subjects = '" . mysqli_real_escape_string($conn, json_encode($subjects)) . "' WHERE pin = '$pin'"
);

echo json_encode([
    'success' => true,
    'subjects' => $subjects
]);
