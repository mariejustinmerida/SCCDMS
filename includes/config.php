<?php
// Production-ready database configuration
// Use environment variables for security, fallback to live server credentials

// Load .env file if it exists (for easier configuration)
if (file_exists(__DIR__ . '/../.env')) {
    $envFile = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envFile as $line) {
        // Skip comments and empty lines
        if (strpos(trim($line), '#') === 0 || empty(trim($line))) {
            continue;
        }
        // Parse KEY=VALUE format
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            // Remove quotes if present
            $value = trim($value, '"\'');
            // Set environment variable if not already set
            if (!getenv($key)) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }
}

$db_host = getenv('DB_HOST') ?: 'db-mysql-sgp1-32814-do-user-32439537-0.f.db.ondigitalocean.com';
$db_username = getenv('DB_USERNAME') ?: 'doadmin';
$db_password = getenv('DB_PASSWORD') ?: 'AVNS_g55EEpigLGjmxn_9XJ0';
$db_name = getenv('DB_NAME') ?: 'scc_dms';
$db_port = getenv('DB_PORT') ?: '25060';

// === NO ECHO/DEBUG HERE - removed to prevent output before headers ===

$conn = null;

try {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $conn = new mysqli();
    $conn->options(MYSQLI_OPT_CONNECT_TIMEOUT, 5);
    $conn->real_connect($db_host, $db_username, $db_password, $db_name, $db_port);
    $conn->set_charset("utf8mb4");

    // Timezone sync
    $tz = (new DateTime('now', new DateTimeZone(getenv('APP_TIMEZONE') ?: 'Asia/Manila')))->format('P');
    $conn->query("SET time_zone = '$tz'");
    $conn->query("SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'");
} catch (mysqli_sql_exception $e) {
    $msg = "MySQLi connection failed: " . $e->getMessage();
    error_log($msg);
    die("<pre>$msg\nCheck: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT env vars</pre>");
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    die("<pre>Unexpected error: " . $e->getMessage() . "</pre>");
}

// Security headers for production
if (!headers_sent()) {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
}

// === INSERT DATABASE SESSION HANDLER HERE (before session_start) ===

// Custom DB session handler functions
function db_session_open($savePath, $sessionName) { return true; }
function db_session_close() { return true; }

function db_session_read($id) {
    global $conn;
    $stmt = $conn->prepare("SELECT data FROM sessions WHERE id = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $stmt->bind_result($data);
    $stmt->fetch();
    $stmt->close();
    return $data ?: '';
}

function db_session_write($id, $data) {
    global $conn;
    $stmt = $conn->prepare("REPLACE INTO sessions (id, data, last_updated) VALUES (?, ?, NOW())");
    $stmt->bind_param("ss", $id, $data);
    return $stmt->execute();
}

function db_session_destroy($id) {
    global $conn;
    $stmt = $conn->prepare("DELETE FROM sessions WHERE id = ?");
    $stmt->bind_param("s", $id);
    return $stmt->execute();
}

function db_session_gc($maxlifetime) {
    global $conn;
    $old = time() - $maxlifetime;
    $conn->query("DELETE FROM sessions WHERE UNIX_TIMESTAMP(last_updated) < $old");
    return true;
}

// Register the DB session handler
session_set_save_handler(
    'db_session_open',
    'db_session_close',
    'db_session_read',
    'db_session_write',
    'db_session_destroy',
    'db_session_gc'
);

// Ensure session is written at the end of script
register_shutdown_function('session_write_close');

// === NOW start the session (using DB storage) ===
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));
    ini_set('session.use_strict_mode', 1);
    session_start();
}
?>
