<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$pin    = $data['pin'] ?? '';
$name   = trim($data['name'] ?? '');

if (!$pin || !$name) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'PIN and name required']);
    exit();
}

// Check room exists
$res = mysqli_query($conn, "SELECT status, question_index FROM quiz_sessions WHERE pin = '$pin'");
if (!mysqli_num_rows($res)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Room not found']);
    exit();
}
$room = mysqli_fetch_assoc($res);

// Check if name already exists (rejoin scenario)
$res = mysqli_query($conn, "SELECT COUNT(*) FROM quiz_players WHERE session_pin = '$pin' AND name = '$name'");
if (mysqli_fetch_row($res)[0] > 0) {
    // Allow rejoin - reset their answer status
    mysqli_query($conn, "UPDATE quiz_players SET answered = 0, answer_time = 0 WHERE session_pin = '$pin' AND name = '$name'");
} else {
    // New player
    mysqli_query($conn, "INSERT INTO quiz_players (session_pin, name, score, answered, answer_time) VALUES ('$pin', '$name', 0, 0, 0)");
}

// Get current state
$status = $room['status'];
$questionIndex = (int)($room['question_index'] ?? 0);

// Get players list
$players = [];
$res = mysqli_query($conn, "SELECT name, score, answered FROM quiz_players WHERE session_pin = '$pin' ORDER BY joined_at");
while ($row = mysqli_fetch_assoc($res)) {
    $players[] = [
        'name' => $row['name'],
        'score' => (int)$row['score'],
        'answered' => (bool)$row['answered']
    ];
}

$total = count($players);
$answeredCount = count(array_filter($players, fn($p) => $p['answered']));

echo json_encode([
    'success' => true,
    'state' => $status,
    'questionIndex' => $questionIndex,
    'players' => $players,
    'count' => $answeredCount,
    'total' => $total
]);
