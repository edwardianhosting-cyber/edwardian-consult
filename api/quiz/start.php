<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$pin = $data['pin'] ?? '';

if (!$pin) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'PIN required']);
    exit();
}

// Check room exists and has players
$res = mysqli_query($conn, "SELECT COUNT(*) FROM quiz_players WHERE session_pin = '$pin'");
if (mysqli_fetch_row($res)[0] === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No participants yet']);
    exit();
}

// Get current question index for this session
$res = mysqli_query($conn, "SELECT question_index FROM quiz_sessions WHERE pin = '$pin'");
$roomInfo = mysqli_fetch_assoc($res);
$questionIndex = (int)($roomInfo['question_index'] ?? 0);

// Get subjects filter for question selection
$sres = mysqli_query($conn, "SELECT subjects FROM quiz_sessions WHERE pin = '$pin'");
$subjects = [];
if ($sres && mysqli_num_rows($sres)) {
    $row = mysqli_fetch_assoc($sres);
    $subjects = json_decode($row['subjects'] ?? '[]', true) ?: [];
}

// Build WHERE clause for question selection
$where = "is_active = true";
$params = [];
if (!empty($subjects)) {
    $placeholders = implode("', '", array_map(function($s) use ($conn) { return mysqli_real_escape_string($conn, $s); }, $subjects));
    $where = "is_active = true AND subject IN ('$placeholders')";
}

// Pick random question from existing question table
$res = mysqli_query($conn, 
    "SELECT id, text as question_text, option_a, option_b, option_c, option_d, correct_option 
     FROM question 
     WHERE $where 
     ORDER BY RAND() 
     LIMIT 1");

if (!mysqli_num_rows($res)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No questions found for selected subjects']);
    exit();
}

$q = mysqli_fetch_assoc($res);
$qId = (int)$q['id'];

// Insert into session questions table
mysqli_query($conn, 
    "INSERT INTO quiz_session_questions 
     (session_pin, question_id, question_text, option_a, option_b, option_c, option_d, correct_option) 
     VALUES ('$pin', $qId, '" . mysqli_real_escape_string($conn, $q['question_text']) . "', 
     '" . mysqli_real_escape_string($conn, $q['option_a'] ?? '') . "', 
     '" . mysqli_real_escape_string($conn, $q['option_b'] ?? '') . "', 
     '" . mysqli_real_escape_string($conn, $q['option_c'] ?? '') . "', 
     '" . mysqli_real_escape_string($conn, $q['option_d'] ?? '') . "', 
     " . (int)$q['correct_option'] . ")"
);

// Get all question IDs for this session
$qres = mysqli_query($conn, "SELECT question_id FROM quiz_session_questions WHERE session_pin = '$pin' ORDER BY id");
$questionIds = [];
while ($row = mysqli_fetch_assoc($qres)) {
    $questionIds[] = (int)$row['question_id'];
}

// Update session state to QUESTION
mysqli_query($conn, 
    "UPDATE quiz_sessions 
     SET status = 'question', current_question_id = $qId, question_index = question_index + 1, question_ids = '" . mysqli_real_escape_string($conn, json_encode($questionIds)) . "' 
     WHERE pin = '$pin'"
);

// Reset all player answers for new question
mysqli_query($conn, "UPDATE quiz_players SET answered = 0, answer_time = 0 WHERE session_pin = '$pin'");

echo json_encode([
    'success' => true,
    'state' => 'question',
    'questionIndex' => (int)($questionIndex + 1),
    'current' => [
        'id' => $qId,
        'text' => $q['question_text'],
        'options' => [$q['option_a'], $q['option_b'], $q['option_c'], $q['option_d']],
        'correctOption' => (int)$q['correct_option']
    ],
    'timer' => 60
]);
