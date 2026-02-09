<?php
session_start();
/**
 * API: Get Notifications for Logged-in User
 */

// NO session_start() here — config.php already does it
ob_start();

require_once __DIR__ . '/../includes/config.php';

header('Content-Type: application/json');

// Auth check — now should work if session is properly shared
if (!isset($_SESSION['user_id']) || !is_numeric($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'User not authenticated',
        'debug' => [
            'session_exists' => session_status() === PHP_SESSION_ACTIVE ? 'YES' : 'NO',
            'session_id' => session_id() ?: '(none)',
            'user_id_isset' => isset($_SESSION['user_id']) ? 'YES' : 'NO'
        ]
    ]);
    exit;
}

$user_id = (int)$_SESSION['user_id'];

// === Optional: One-time table structure check (can be moved to migration script) ===
$table_check = $conn->query("SHOW TABLES LIKE 'notifications'");
if ($table_check->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'error'   => 'Notifications table does not exist. Contact administrator.'
    ]);
    exit;
}

// === Optional: Check for missing columns (one-time fix) ===
$column_check = $conn->query("SHOW COLUMNS FROM notifications LIKE 'document_id'");
if ($column_check->num_rows === 0) {
    // Add missing column (safe to run multiple times)
    $conn->query("ALTER TABLE notifications
                  ADD COLUMN document_id INT NULL AFTER user_id,
                  ADD FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE SET NULL");
}

// === Main query - only select existing columns ===
$query = "
    SELECT
        n.notification_id,
        n.user_id,
        n.document_id,
        n.message,
        n.is_read,
        n.created_at,
        d.title AS document_title,
        d.status AS document_status
    FROM notifications n
    LEFT JOIN documents d ON n.document_id = d.document_id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT 20
";

$stmt = $conn->prepare($query);
if (!$stmt) {
    echo json_encode([
        'success' => false,
        'error' => 'Prepare failed: ' . $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$notifications = [];
while ($row = $result->fetch_assoc()) {
    // Fallback title if missing
    if (empty($row['title'])) {
        $row['title'] = !empty($row['document_title'])
            ? 'Update: ' . $row['document_title']
            : 'System Notification';
    }
    // Clean up message
    if (empty($row['message'])) {
        $row['message'] = 'You have a new notification.';
    }
    $notifications[] = $row;
}

$stmt->close();

echo json_encode([
    'success'      => true,
    'notifications' => $notifications,
    'count'        => count($notifications),
    'user_id'      => $user_id
]);
?>
