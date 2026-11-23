<?php
require_once 'config.php';

$pin = generatePin($conn);

// Get subjects from existing question table
$res = mysqli_query($conn, "SELECT DISTINCT subject FROM question WHERE is_active = true ORDER BY subject");
$subjects = [];
while ($row = mysqli_fetch_assoc($res)) {
    if ($row['subject']) {
        $subjects[] = $row['subject'];
    }
}

// Insert session into MySQL
mysqli_query($conn, 
    "INSERT INTO quiz_sessions (pin, status, subjects, question_ids, question_index) 
     VALUES ('$pin', 'lobby', '" . mysqli_real_escape_string($conn, json_encode($subjects)) . "', '[]', 0)"
);

echo json_encode([
    'success' => true,
    'pin' => $pin,
    'subjects' => $subjects
]);
