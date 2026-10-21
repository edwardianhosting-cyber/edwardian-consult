<?php
require_once 'config.php';

$pin = $_GET['pin'] ?? '';

if (!$pin) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'PIN required']);
    exit();
}

// Get room info
$res = mysqli_query($conn, "SELECT status, question_index, current_question_id FROM quiz_sessions WHERE pin = '$pin'");
if (!mysqli_num_rows($res)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Room not found']);
    exit();
}
$room = mysqli_fetch_assoc($res);
$status = $room['status'];
$questionIndex = (int)($room['question_index'] ?? 0);

// Get players
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

$response = [
    'success' => true,
    'pin' => $pin,
    'state' => $status,
    'players' => $players,
    'questionIndex' => $questionIndex,
    'countdownSeconds' => 0,
    'current' => null,
    'timer' => 0,
    'count' => $answeredCount,
    'total' => $total,
    'subjects' => []
];

// If in question state, get current question
if ($status === 'question' && $room['current_question_id']) {
    $qres = mysqli_query($conn, 
        "SELECT question_text, option_a, option_b, option_c, option_d, correct_option 
         FROM quiz_session_questions WHERE id = " . (int)$room['current_question_id']);
    if (mysqli_num_rows($qres)) {
        $q = mysqli_fetch_assoc($qres);
        $options = [$q['option_a'], $q['option_b'], $q['option_c'], $q['option_d']];
        $response['current'] = [
            'id' => (int)$room['current_question_id'],
            'text' => $q['question_text'],
            'options' => $options,
            'correctOption' => (int)($q['correct_option'] ?? 0)
        ];
        $response['timer'] = 60;
    }
}

// Get subjects filter
$sres = mysqli_query($conn, "SELECT subjects FROM quiz_sessions WHERE pin = '$pin'");
if ($sres && mysqli_num_rows($sres)) {
    $subjRow = mysqli_fetch_assoc($sres);
    $response['subjects'] = json_decode($subjRow['subjects'] ?? '[]', true) ?: [];
}

echo json_encode($response);
