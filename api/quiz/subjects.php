<?php
require_once 'config.php';

// Get all distinct subjects from active questions
$res = mysqli_query($conn, "SELECT DISTINCT subject FROM question WHERE is_active = true ORDER BY subject");
$subjects = [];
while ($row = mysqli_fetch_assoc($res)) {
    if ($row['subject']) {
        $subjects[] = $row['subject'];
    }
}

echo json_encode([
    'success' => true,
    'subjects' => $subjects
]);
