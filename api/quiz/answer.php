<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$pin          = $data['pin'] ?? '';
$answer       = (int)($data['answer'] ?? -1);
$playerName   = $data['playerName'] ?? '';
$answerTimeMs = (int)($data['answerTimeMs'] ?? 60000);

if (!$pin || $answer < 0 || !$playerName) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

// Get current question for this session
$res = mysqli_query($conn, "SELECT current_question_id, status FROM quiz_sessions WHERE pin = '$pin'");
if (!mysqli_num_rows($res)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Room not found']);
    exit();
}
$room = mysqli_fetch_assoc($res);

if ($room['status'] !== 'question') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No active question']);
    exit();
}

$qId = (int)$room['current_question_id'];

// Get correct option
$qres = mysqli_query($conn, "SELECT correct_option FROM quiz_session_questions WHERE question_id = $qId");
if (!mysqli_num_rows($qres)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Question not found']);
    exit();
}
$q = mysqli_fetch_assoc($qres);
$correctOption = (int)($q['correct_option'] ?? 0);
$isCorrect = ($answer === $correctOption);

// Calculate speed-based points (max 1000)
$secs = max(0, min(60, $answerTimeMs / 1000));
$points = $isCorrect ? max(0, round(1000 * (1 - $secs / 60))) : 0;

// Update player's answer and score
mysqli_query($conn, 
    "UPDATE quiz_players 
     SET answered = 1, answer_time = $answerTimeMs, score = score + $points 
     WHERE session_pin = '$pin' AND name = '" . mysqli_real_escape_string($conn, $playerName) . "'"
);

// Save answer record
mysqli_query($conn, 
    "INSERT INTO quiz_player_answers 
     (session_pin, player_name, question_id, answer_index, is_correct, points) 
     VALUES ('$pin', '" . mysqli_real_escape_string($conn, $playerName) . "', $qId, $answer, " . ($isCorrect ? 1 : 0) . ", $points)"
);

// Check if all players have answered
$pres = mysqli_query($conn, 
    "SELECT COUNT(*) AS total, SUM(CASE WHEN answered THEN 1 ELSE 0 END) AS answered 
     FROM quiz_players WHERE session_pin = '$pin'");
$stats = mysqli_fetch_assoc($pres);
$allAnswered = (int)$stats['total'] > 0 && (int)$stats['answered'] >= (int)$stats['total'];

if ($allAnswered) {
    mysqli_query($conn, "UPDATE quiz_sessions SET status = 'results' WHERE pin = '$pin'");
}

echo json_encode([
    'success' => true,
    'correct' => $correctOption,
    'points' => $points,
    'allAnswered' => $allAnswered
]);
