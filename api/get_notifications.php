<?php
/**
 * API: Get Notifications for Logged-in User
 * Returns latest notifications with document context
 */

// === MUST BE FIRST - no output before this ===
session_start();

// Load config (DB connection + session handler)
require_once '../includes/config.php';

// Optional: re-check auth (in case config.php doesn't enforce it)
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'User not authenticated'
    ]);
    exit;
}

$user_id = (int)$_SESSION['user_id'];

// Set JSON header
header('Content-Type: application/json');

// === Optional: One-time table structure check (can be moved to migration script) ===
$table_check = $conn->query("SHOW TABLES LIKE 'notifications'");
if ($table_check->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'error' => 'Notifications table does not exist. Contact administrator.'
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

// Return response
echo json_encode([
    'success' => true,
    'notifications' => $notifications,
    'count' => count($notifications),
    'user_id' => $user_id  // optional debug
]);
?>
