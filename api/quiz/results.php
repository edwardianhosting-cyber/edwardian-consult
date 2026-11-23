<?php
require_once 'config.php';

$pin = $_GET['pin'] ?? '';

if (!$pin) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'PIN required']);
    exit();
}

// Get room info
$res = mysqli_query($conn, "SELECT status, question_index FROM quiz_sessions WHERE pin = '$pin'");
if (!mysqli_num_rows($res)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Room not found']);
    exit();
}
$room = mysqli_fetch_assoc($res);

// Get leaderboard - players sorted by score desc
$players = [];
$res = mysqli_query($conn, 
    "SELECT name, score, answered FROM quiz_players WHERE session_pin = '$pin' ORDER BY score DESC, name ASC");
while ($row = mysqli_fetch_assoc($res)) {
    $players[] = [
        'id' => $row['name'],
        'name' => $row['name'],
        'score' => (int)$row['score'],
        'correct' => (bool)$row['answered']
    ];
}

// Count correct answers per player from quiz_player_answers
$correctCounts = [];
$cres = mysqli_query($conn, 
    "SELECT player_name, COUNT(*) as correct_count FROM quiz_player_answers 
     WHERE session_pin = '$pin' AND is_correct = 1 
     GROUP BY player_name");
while ($crow = mysqli_fetch_assoc($cres)) {
    $correctCounts[$crow['player_name']] = (int)$crow['correct_count'];
}

// Add correct count to each player
foreach ($players as &$p) {
    $p['correct'] = $correctCounts[$p['name']] ?? 0;
}
unset($p);

echo json_encode([
    'success' => true,
    'pin' => $pin,
    'status' => $room['status'],
    'questionIndex' => (int)($room['question_index'] ?? 0),
    'leaderboard' => $players
]);
