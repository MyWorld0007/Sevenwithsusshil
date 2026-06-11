<?php
/**
 * api.php - PHP Backend API Router for Seven Astro-Numerology (Hostinger Deployments)
 * 
 * Supports dynamic PDO database connection with local fallback to database.json 
 * and maps all standard endpoints required by the Seven App frontend.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Connection Configurations
$env = [];
$envPath = __DIR__ . '/.env';
if (!file_exists($envPath)) {
    $envPath = __DIR__ . '/.env.example';
}
if (file_exists($envPath)) {
    $content = file_get_contents($envPath);
    $lines = explode("\n", $content);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val);
            $val = preg_replace('/^[\'"]|[\'"]$/', '', $val);
            $env[$key] = $val;
        }
    }
}

// Merge with getenv system environment variables
foreach (['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'] as $key) {
    $sysVal = getenv($key);
    if ($sysVal !== false && $sysVal !== '') {
        $env[$key] = $sysVal;
    }
}

$envHost = isset($env['DB_HOST']) ? trim($env['DB_HOST']) : '';
if (strpos($envHost, 'sevenastro') !== false || $envHost === 'MY_APP_URL') {
    $envHost = '193.203.184.86';
}

$envUser = isset($env['DB_USER']) ? trim($env['DB_USER']) : '';
if ($envUser === 'masteradmin') {
    $envUser = 'u709894810_masteradmin';
}

$envPass = isset($env['DB_PASSWORD']) ? trim($env['DB_PASSWORD']) : '';
$envName = isset($env['DB_NAME']) ? trim($env['DB_NAME']) : '';
if ($envName === 'sevenastro') {
    $envName = 'u709894810_sevenastro';
}

$envPort = isset($env['DB_PORT']) ? intval($env['DB_PORT']) : 3306;

$finalHostLocal = 'localhost';
$finalHostRemote = !empty($envHost) ? $envHost : '193.203.184.86';
$finalUser = !empty($envUser) ? $envUser : 'u709894810_masteradmin';
$finalPass = !empty($envPass) ? $envPass : '@Masteradmin_2026';
$finalName = !empty($envName) ? $envName : 'u709894810_sevenastro';

define('DB_HOST_LOCAL', $finalHostLocal);
define('DB_HOST_REMOTE', $finalHostRemote);
define('DB_USER', $finalUser);
define('DB_PASS', $finalPass);
define('DB_NAME', $finalName);
define('JSON_DB_PATH', __DIR__ . '/database.json');

// Helper to standardise options / inputs
$inputData = json_decode(file_get_contents('php://input'), true) ?? [];

// 2. Establish Database Engine (PDO MySQL with high-fidelity JSON Fallback)
$pdo = null;
$useFallback = false;

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::ATTR_TIMEOUT            => 2
];

try {
    // Attempt 1: Connect using the configured DB_HOST from system/environmental variables
    // Omit explicit port parameter for 'localhost' / '127.0.0.1' to allow native Unix Socket fallback (much more robust on shared hostings)
    if (!empty($envHost) && $envHost !== 'localhost' && $envHost !== '127.0.0.1') {
        $dsn = "mysql:host=" . $envHost . ";port=" . $envPort . ";dbname=" . $finalName . ";charset=utf8mb4";
        $options[PDO::ATTR_TIMEOUT] = 3;
        $pdo = new PDO($dsn, $finalUser, $finalPass, $options);
        $pdo->exec("SET NAMES utf8mb4");
    } else {
        throw new Exception("Localhost or default host is fallback");
    }
} catch (Exception $eExternal) {
    try {
        // Attempt 2: Connect using local socket 'localhost' directly (standard database protocol on Hostinger live site)
        $dsn = "mysql:host=" . DB_HOST_LOCAL . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options[PDO::ATTR_TIMEOUT] = 2;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        $pdo->exec("SET NAMES utf8mb4");
    } catch (Exception $e) {
        try {
            // Attempt 3: Connect using the remote fallback IP
            $dsn = "mysql:host=" . DB_HOST_REMOTE . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options[PDO::ATTR_TIMEOUT] = 4;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            $pdo->exec("SET NAMES utf8mb4");
        } catch (Exception $e2) {
            $useFallback = true;
        }
    }
}

// 3. Helper Functions for JSON Engine Fallback
function readJsonDb() {
    if (!file_exists(JSON_DB_PATH)) {
        return ['settings' => [], 'life_paths' => [], 'testimonials' => [], 'content_pages' => [], 'faqs' => [], 'services' => []];
    }
    $content = file_get_contents(JSON_DB_PATH);
    $data = json_decode($content, true);
    return is_array($data) ? $data : ['settings' => [], 'life_paths' => [], 'testimonials' => [], 'content_pages' => [], 'faqs' => [], 'services' => []];
}

function writeJsonDb($data) {
    file_put_contents(JSON_DB_PATH, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
}

// 4. Admin Auth Token Verification
function requireAuth() {
    $authHeader = '';
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } else if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = trim($_SERVER["REDIRECT_HTTP_AUTHORIZATION"]);
    } else if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $authHeader = trim($requestHeaders['Authorization']);
        }
    } else if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        if ($token === 'supersecret123') {
            return true;
        }
    }
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized admin session']);
    exit();
}

function updateEnvFile($smtpHost, $smtpPort, $smtpUser, $smtpPass, $geminiKey = null) {
    try {
        $envPath = __DIR__ . '/.env';
        $examplePath = __DIR__ . '/.env.example';
        $content = "";
        
        if (file_exists($envPath)) {
            $content = file_get_contents($envPath);
        } elseif (file_exists($examplePath)) {
            $content = file_get_contents($examplePath);
        }
        
        $lines = explode("\n", $content);
        $variables = [];
        foreach ($lines as $line) {
            if (preg_match('/^([^#\s][^=]*)=(.*)$/', $line, $matches)) {
                $key = trim($matches[1]);
                $val = trim($matches[2]);
                $val = preg_replace('/^[\'"]|[\'"]$/', '', $val);
                $val = preg_replace('/^[\'"]|[\'"]$/', '', trim($val));
                $variables[$key] = trim($val);
            }
        }
        
        if ($smtpHost) $variables['SMTP_HOST'] = trim($smtpHost);
        if ($smtpPort) $variables['SMTP_PORT'] = trim($smtpPort);
        if ($smtpUser) {
            $variables['SMTP_USER'] = trim($smtpUser);
            $variables['SMTP_FROM'] = 'Seven Astro Sanctuary <' . trim($smtpUser) . '>';
        }
        if ($smtpPass) $variables['SMTP_PASS'] = trim($smtpPass);
        if ($geminiKey) $variables['GEMINI_API_KEY'] = trim($geminiKey);
        
        $newContent = "";
        foreach ($variables as $key => $val) {
            $cleanVal = preg_replace('/^[\'"]|[\'"]$/', '', trim($val));
            $cleanVal = preg_replace('/^[\'"]|[\'"]$/', '', trim($cleanVal));
            if (strpos($cleanVal, ' ') !== false || strpos($cleanVal, '<') !== false || strpos($cleanVal, '>') !== false) {
                $newContent .= $key . '="' . $cleanVal . "\"\n";
            } else {
                $newContent .= $key . '=' . $cleanVal . "\n";
            }
        }
        
        file_put_contents($envPath, $newContent);
        file_put_contents($examplePath, $newContent);
    } catch (Exception $e) {
        // Suppress writing errors
    }
}

function sendSmartSmtpEmail($to, $subject, $htmlContent, $settings) {
    if (!is_array($settings)) {
        $settings = [];
    }

    // Load local .env values if settings doesn't have them
    $envVars = [];
    $envPath = __DIR__ . '/.env';
    if (!file_exists($envPath)) {
        $envPath = __DIR__ . '/.env.example';
    }
    if (file_exists($envPath)) {
        $content = file_get_contents($envPath);
        $lines = explode("\n", $content);
        foreach ($lines as $line) {
            if (preg_match('/^([^#\s][^=]*)=(.*)$/', $line, $matches)) {
                $k = trim($matches[1]);
                $v = trim($matches[2]);
                $v = preg_replace('/^[\'"]|[\'"]$/', '', $v);
                $envVars[$k] = trim($v);
            }
        }
    }

    $smtp_host = trim($settings['smtp_host'] ?? $envVars['SMTP_HOST'] ?? '');
    $smtp_port = intval($settings['smtp_port'] ?? $envVars['SMTP_PORT'] ?? 465);
    $smtp_user = trim($settings['smtp_user'] ?? $envVars['SMTP_USER'] ?? '');
    $smtp_pass = trim($settings['smtp_pass'] ?? $envVars['SMTP_PASS'] ?? '');

    if (empty($smtp_host) || empty($smtp_user) || empty($smtp_pass)) {
        // Fallback to PHP mail()
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: Seven Astro Sanctuary <7s.evolve@gmail.com>" . "\r\n";
        return @mail($to, $subject, $htmlContent, $headers);
    }

    $host = $smtp_host;
    if ($smtp_port === 465 && strpos($host, 'ssl://') === false) {
        $host = 'ssl://' . $host;
    }

    $socket = @fsockopen($host, $smtp_port, $errno, $errstr, 15);
    if (!$socket) {
        // Fallback to php mail()
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: Seven Astro Sanctuary <$smtp_user>" . "\r\n";
        return @mail($to, $subject, $htmlContent, $headers);
    }

    $getResponse = function($socket) {
        $response = "";
        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;
            if (substr($line, 3, 1) == " ") {
                break;
            }
        }
        return $response;
    };

    $sendCmd = function($socket, $cmd) use ($getResponse) {
        fputs($socket, $cmd . "\r\n");
        return $getResponse($socket);
    };

    $getResponse($socket);

    $sendCmd($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
    
    $res = $sendCmd($socket, "AUTH LOGIN");
    if (strpos($res, '334') === false) {
        fclose($socket);
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: Seven Astro Sanctuary <$smtp_user>" . "\r\n";
        return @mail($to, $subject, $htmlContent, $headers);
    }

    $sendCmd($socket, base64_encode($smtp_user));
    $sendCmd($socket, base64_encode($smtp_pass));

    $sendCmd($socket, "MAIL FROM: <" . $smtp_user . ">");

    $recipients = array_map('trim', explode(',', $to));
    foreach ($recipients as $rcpt) {
        if (!empty($rcpt)) {
            $sendCmd($socket, "RCPT TO: <" . $rcpt . ">");
        }
    }

    $sendCmd($socket, "DATA");

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Seven Astro Sanctuary <" . $smtp_user . ">\r\n";
    $headers .= "To: " . $to . "\r\n";
    $headers .= "Subject: " . $subject . "\r\n";
    $headers .= "Date: " . date('r') . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

    $mailBody = $headers . "\r\n" . $htmlContent . "\r\n.";
    $sendCmd($socket, $mailBody);

    $sendCmd($socket, "QUIT");
    fclose($socket);

    return true;
}

// 5. Parse route mapping
$route = $_GET['route'] ?? '';
$parts = explode('/', trim($route, '/'));
$resource = $parts[0] ?? '';
$subResource = $parts[1] ?? null;

// Determine request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle upload specifically if requested
if ($resource === 'upload') {
    requireAuth();
    if (!isset($_FILES['photo'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No photo uploaded']);
        exit();
    }
    $file = $_FILES['photo'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(500);
        echo json_encode(['error' => 'Upload failed on server']);
        exit();
    }
    
    $filename = 'profile-' . time() . '-' . rand(1000, 9999) . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
    
    // Save to target production uploads directory (relative to api.php)
    $prodUploadDir = __DIR__ . '/uploads/';
    if (!is_dir($prodUploadDir)) {
        mkdir($prodUploadDir, 0755, true);
    }
    $targetPathProd = $prodUploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetPathProd)) {
        // Synchronize with local /public/uploads/ directory if it exists
        $devUploadDir = __DIR__ . '/public/uploads/';
        if (is_dir(__DIR__ . '/public/')) {
            if (!is_dir($devUploadDir)) {
                mkdir($devUploadDir, 0755, true);
            }
            copy($targetPathProd, $devUploadDir . $filename);
        }
        
        echo json_encode(['url' => '/uploads/' . $filename]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save uploaded file']);
    }
    exit();
}

// Handle Admin Login Specifically
if ($resource === 'admin' && $subResource === 'login') {
    $email = $inputData['email'] ?? '';
    $password = $inputData['password'] ?? '';
    
    $authenticated = false;
    if (!$useFallback) {
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = ? AND password = ?");
        $stmt->execute([$email, $password]);
        if ($stmt->fetch()) {
            $authenticated = true;
        }
    } else {
        $db = readJsonDb();
        foreach ($db['admins'] ?? [] as $admin) {
            if ($admin['email'] === $email && $admin['password'] === $password) {
                $authenticated = true;
                break;
            }
        }
    }
    
    if ($authenticated) {
        echo json_encode(['token' => 'supersecret123']);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
    }
    exit();
}

// ROUTING MATRIX
try {
    // ---- 1. SETTINGS ----
    if ($resource === 'settings') {
        if ($method === 'GET') {
            if (!$useFallback) {
                $stmt = $pdo->query("SELECT * FROM settings LIMIT 1");
                $row = $stmt->fetch();
                if ($row) {
                    echo json_encode($row);
                } else {
                    echo json_encode([
                        'id' => 1,
                        'whatsapp' => '917039516551',
                        'email' => '7s.evolve@gmail.com',
                        'whatsapp_message' => 'Hello! I would like to book a session.',
                        'email_subject' => 'Book a Session',
                        'email_body' => "Hi Team Seven,\n\nI want to book a session."
                    ]);
                }
            } else {
                $db = readJsonDb();
                $row = $db['settings'][0] ?? [
                    'id' => 1,
                    'whatsapp' => '917039516551',
                    'email' => '7s.evolve@gmail.com',
                    'whatsapp_message' => 'Hello! I would like to book a session.',
                    'email_subject' => 'Book a Session',
                    'email_body' => "Hi Team Seven,\n\nI want to book a session."
                ];
                echo json_encode($row);
            }
            exit();
        }
        
        if ($method === 'PUT') {
            requireAuth();
            $whatsapp = $inputData['whatsapp'] ?? '';
            $email = $inputData['email'] ?? '';
            $whatsapp_message = $inputData['whatsapp_message'] ?? '';
            $email_subject = $inputData['email_subject'] ?? '';
            $email_body = $inputData['email_body'] ?? '';
            $gemini_api_key = $inputData['gemini_api_key'] ?? '';
            $profile_photo = $inputData['profile_photo'] ?? '';
            $about_title = $inputData['about_title'] ?? '';
            $about_para1 = $inputData['about_para1'] ?? '';
            $about_para2 = $inputData['about_para2'] ?? '';
            $smtp_host = $inputData['smtp_host'] ?? '';
            $smtp_port = $inputData['smtp_port'] ?? '';
            $smtp_user = $inputData['smtp_user'] ?? '';
            $smtp_pass = $inputData['smtp_pass'] ?? '';
            
            if (!$useFallback) {
                // Ensure row 1 exists
                $check = $pdo->query("SELECT COUNT(*) FROM settings WHERE id = 1")->fetchColumn();
                if ($check == 0) {
                    $pdo->prepare("INSERT INTO settings (id) VALUES (1)")->execute();
                }

                // Make sure all required columns exist dynamically
                $columnsToAdd = [
                    'gemini_api_key' => 'VARCHAR(255)',
                    'profile_photo' => 'VARCHAR(255)',
                    'about_title' => 'VARCHAR(255)',
                    'about_para1' => 'TEXT',
                    'about_para2' => 'TEXT',
                    'smtp_host' => 'VARCHAR(255)',
                    'smtp_port' => 'VARCHAR(10)',
                    'smtp_user' => 'VARCHAR(255)',
                    'smtp_pass' => 'VARCHAR(255)'
                ];
                
                foreach ($columnsToAdd as $col => $type) {
                    try {
                        $pdo->exec("ALTER TABLE settings ADD COLUMN $col $type");
                    } catch (\Exception $e) {
                        // Ignore if column already exists
                    }
                }
                
                $sql = "UPDATE settings SET 
                        whatsapp = ?, email = ?, whatsapp_message = ?, email_subject = ?, email_body = ?, 
                        gemini_api_key = ?, profile_photo = ?, about_title = ?, about_para1 = ?, about_para2 = ?,
                        smtp_host = ?, smtp_port = ?, smtp_user = ?, smtp_pass = ?
                        WHERE id = 1";
                $pdo->prepare($sql)->execute([
                    $whatsapp, $email, $whatsapp_message, $email_subject, $email_body, 
                    $gemini_api_key, $profile_photo, $about_title, $about_para1, $about_para2,
                    $smtp_host, $smtp_port, $smtp_user, $smtp_pass
                ]);
            } else {
                $db = readJsonDb();
                if (empty($db['settings'])) {
                    $db['settings'] = [['id' => 1]];
                }
                $db['settings'][0]['whatsapp'] = $whatsapp;
                $db['settings'][0]['email'] = $email;
                $db['settings'][0]['whatsapp_message'] = $whatsapp_message;
                $db['settings'][0]['email_subject'] = $email_subject;
                $db['settings'][0]['email_body'] = $email_body;
                $db['settings'][0]['gemini_api_key'] = $gemini_api_key;
                $db['settings'][0]['profile_photo'] = $profile_photo;
                $db['settings'][0]['about_title'] = $about_title;
                $db['settings'][0]['about_para1'] = $about_para1;
                $db['settings'][0]['about_para2'] = $about_para2;
                $db['settings'][0]['smtp_host'] = $smtp_host;
                $db['settings'][0]['smtp_port'] = $smtp_port;
                $db['settings'][0]['smtp_user'] = $smtp_user;
                $db['settings'][0]['smtp_pass'] = $smtp_pass;
                writeJsonDb($db);
            }
            
            updateEnvFile($smtp_host, $smtp_port, $smtp_user, $smtp_pass, $gemini_api_key);
            
            echo json_encode(['success' => true]);
            exit();
        }
    }

    // ---- 2. SERVICES ----
    if ($resource === 'services') {
        if ($method === 'GET') {
            $fetched = false;
            if (!$useFallback) {
                try {
                    $stmt = $pdo->query("SELECT * FROM services ORDER BY display_order ASC, id ASC");
                    $rows = $stmt->fetchAll();
                    echo json_encode($rows);
                    $fetched = true;
                } catch (Exception $e) {
                    // Fall back to JSON DB
                }
            }
            if (!$fetched) {
                $db = readJsonDb();
                $rows = $db['services'] ?? [];
                usort($rows, function($a, $b) {
                    return (($a['display_order'] ?? 0) - ($b['display_order'] ?? 0)) ?: (($a['id'] ?? 0) - ($b['id'] ?? 0));
                });
                echo json_encode($rows);
            }
            exit();
        }

        if ($method === 'POST') {
            requireAuth();
            if ($subResource === 'reorder') {
                $orderIds = $inputData['orderIds'] ?? [];
                if (!$useFallback) {
                    $stmt = $pdo->prepare("UPDATE services SET display_order = ? WHERE id = ?");
                    foreach ($orderIds as $idx => $id) {
                        $stmt->execute([$idx, $id]);
                    }
                } else {
                    $db = readJsonDb();
                    foreach ($db['services'] as &$s) {
                        $idx = array_search($s['id'], $orderIds);
                        if ($idx !== false) {
                            $s['display_order'] = $idx;
                        }
                    }
                    writeJsonDb($db);
                }
                echo json_encode(['success' => true]);
                exit();
            } else {
                $title = $inputData['title'] ?? '';
                $price = $inputData['price'] ?? '';
                $rawPrice = $inputData['rawPrice'] ?? '';
                $description = $inputData['description'] ?? '';
                $iconText = $inputData['iconText'] ?? '';
                $features = is_array($inputData['features'] ?? null) ? json_encode($inputData['features']) : ($inputData['features'] ?? '[]');

                if (!$useFallback) {
                    $order = $pdo->query("SELECT COUNT(*) FROM services")->fetchColumn();
                    $stmt = $pdo->prepare("INSERT INTO services (title, price, rawPrice, description, iconText, features, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$title, $price, $rawPrice, $description, $iconText, $features, $order]);
                    echo json_encode(['id' => $pdo->lastInsertId()]);
                } else {
                    $db = readJsonDb();
                    if (!isset($db['services'])) $db['services'] = [];
                    $maxId = 0;
                    foreach ($db['services'] as $s) {
                        if ($s['id'] > $maxId) $maxId = $s['id'];
                    }
                    $newId = $maxId + 1;
                    $db['services'][] = [
                        'id' => $newId,
                        'title' => $title,
                        'price' => $price,
                        'rawPrice' => $rawPrice,
                        'description' => $description,
                        'iconText' => $iconText,
                        'features' => $features,
                        'display_order' => count($db['services'])
                    ];
                    writeJsonDb($db);
                    echo json_encode(['id' => $newId]);
                }
                exit();
            }
        }

        if ($method === 'PUT') {
            requireAuth();
            $id = intval($subResource);
            $title = $inputData['title'] ?? '';
            $price = $inputData['price'] ?? '';
            $rawPrice = $inputData['rawPrice'] ?? '';
            $description = $inputData['description'] ?? '';
            $iconText = $inputData['iconText'] ?? '';
            $features = is_array($inputData['features'] ?? null) ? json_encode($inputData['features']) : ($inputData['features'] ?? '[]');

            if (!$useFallback) {
                $stmt = $pdo->prepare("UPDATE services SET title = ?, price = ?, rawPrice = ?, description = ?, iconText = ?, features = ? WHERE id = ?");
                $stmt->execute([$title, $price, $rawPrice, $description, $iconText, $features, $id]);
            } else {
                $db = readJsonDb();
                foreach ($db['services'] as &$s) {
                    if ($s['id'] === $id) {
                        $s['title'] = $title;
                        $s['price'] = $price;
                        $s['rawPrice'] = $rawPrice;
                        $s['description'] = $description;
                        $s['iconText'] = $iconText;
                        $s['features'] = $features;
                    }
                }
                writeJsonDb($db);
            }
            echo json_encode(['success' => true]);
            exit();
        }

        if ($method === 'DELETE') {
            requireAuth();
            $id = intval($subResource);
            if (!$useFallback) {
                $stmt = $pdo->prepare("DELETE FROM services WHERE id = ?");
                $stmt->execute([$id]);
            } else {
                $db = readJsonDb();
                $db['services'] = array_filter($db['services'] ?? [], function($s) use ($id) {
                    return $s['id'] !== $id;
                });
                $db['services'] = array_values($db['services']);
                writeJsonDb($db);
            }
            echo json_encode(['success' => true]);
            exit();
        }
    }

    // ---- 3. FAQs ----
    if ($resource === 'faqs') {
        if ($method === 'GET') {
            if (!$useFallback) {
                $stmt = $pdo->query("SELECT * FROM faqs ORDER BY display_order ASC, id ASC");
                echo json_encode($stmt->fetchAll());
            } else {
                $db = readJsonDb();
                $rows = $db['faqs'] ?? [];
                usort($rows, function($a, $b) {
                    return (($a['display_order'] ?? 0) - ($b['display_order'] ?? 0)) ?: (($a['id'] ?? 0) - ($b['id'] ?? 0));
                });
                echo json_encode($rows);
            }
            exit();
        }

        if ($method === 'POST') {
            requireAuth();
            if ($subResource === 'reorder') {
                $orderIds = $inputData['orderIds'] ?? [];
                if (!$useFallback) {
                    $stmt = $pdo->prepare("UPDATE faqs SET display_order = ? WHERE id = ?");
                    foreach ($orderIds as $idx => $id) {
                        $stmt->execute([$idx, $id]);
                    }
                } else {
                    $db = readJsonDb();
                    foreach ($db['faqs'] as &$f) {
                        $idx = array_search($f['id'], $orderIds);
                        if ($idx !== false) {
                            $f['display_order'] = $idx;
                        }
                    }
                    writeJsonDb($db);
                }
                echo json_encode(['success' => true]);
                exit();
            } else {
                $question = $inputData['question'] ?? '';
                $answer = $inputData['answer'] ?? '';
                if (!$useFallback) {
                    $stmt = $pdo->prepare("INSERT INTO faqs (question, answer) VALUES (?, ?)");
                    $stmt->execute([$question, $answer]);
                    echo json_encode(['id' => $pdo->lastInsertId()]);
                } else {
                    $db = readJsonDb();
                    if (!isset($db['faqs'])) $db['faqs'] = [];
                    $maxId = 0;
                    foreach ($db['faqs'] as $f) {
                        if ($f['id'] > $maxId) $maxId = $f['id'];
                    }
                    $newId = $maxId + 1;
                    $db['faqs'][] = [
                        'id' => $newId,
                        'question' => $question,
                        'answer' => $answer,
                        'display_order' => 0
                    ];
                    writeJsonDb($db);
                    echo json_encode(['id' => $newId]);
                }
                exit();
            }
        }

        if ($method === 'PUT') {
            requireAuth();
            $id = intval($subResource);
            $question = $inputData['question'] ?? '';
            $answer = $inputData['answer'] ?? '';
            if (!$useFallback) {
                $stmt = $pdo->prepare("UPDATE faqs SET question = ?, answer = ? WHERE id = ?");
                $stmt->execute([$question, $answer, $id]);
            } else {
                $db = readJsonDb();
                foreach ($db['faqs'] as &$f) {
                    if ($f['id'] === $id) {
                        $f['question'] = $question;
                        $f['answer'] = $answer;
                    }
                }
                writeJsonDb($db);
            }
            echo json_encode(['success' => true]);
            exit();
        }

        if ($method === 'DELETE') {
            requireAuth();
            $id = intval($subResource);
            if (!$useFallback) {
                $stmt = $pdo->prepare("DELETE FROM faqs WHERE id = ?");
                $stmt->execute([$id]);
            } else {
                $db = readJsonDb();
                $db['faqs'] = array_filter($db['faqs'] ?? [], function($f) use ($id) {
                    return $f['id'] !== $id;
                });
                $db['faqs'] = array_values($db['faqs']);
                writeJsonDb($db);
            }
            echo json_encode(['success' => true]);
            exit();
        }
    }

    // ---- 4. TESTIMONIALS ----
    if ($resource === 'testimonials') {
        if ($method === 'GET') {
            if (!$useFallback) {
                try {
                    $stmt = $pdo->query("SELECT * FROM testimonials");
                    $checkRows = $stmt->fetchAll();
                    if (count($checkRows) === 0) {
                        $tests = [
                            [1, '"My session was nothing short of revelatory. The accuracy with which the numbers reflected my life\'s patterns left me speechless. I finally understand why certain things kept repeating."', 'P', 'Priya Malhotra', 'Mumbai, India', 'October 2023', 5, 'approved'],
                            [2, '"I was at a complete crossroads in my career. The reading gave me the courage and clarity to make a decision I\'d been avoiding for two years. Genuinely life-changing."', 'R', 'Rohan Kapoor', 'Bangalore, India', 'November 2023', 5, 'approved'],
                            [3, '"The relationship compatibility reading transformed how my partner and I communicate. Understanding our numbers made everything feel less like conflict and more like growth."', 'A', 'Anjali Singh', 'Delhi, India', 'January 2024', 5, 'approved'],
                            [4, '"Simply incredible. The insights into my personal year cycle explained exactly what I was feeling."', 'S', 'Sarah T.', 'London, UK', 'March 2024', 5, 'approved']
                        ];
                        $insertStmt = $pdo->prepare("INSERT INTO testimonials (id, text, initial, name, loc, date, rating, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                        foreach ($tests as $t) {
                            $insertStmt->execute($t);
                        }
                    }
                } catch (\Exception $e) {}

                try {
                    $stmt = $pdo->query("SELECT * FROM testimonials WHERE status = 'approved' OR status IS NULL ORDER BY id ASC");
                    echo json_encode($stmt->fetchAll());
                } catch(PDOException $e) {
                    $stmt = $pdo->query("SELECT * FROM testimonials ORDER BY id ASC");
                    echo json_encode($stmt->fetchAll());
                }
            } else {
                $db = readJsonDb();
                $rows = array_filter($db['testimonials'] ?? [], function($t) {
                    return !isset($t['status']) || $t['status'] === 'approved';
                });
                echo json_encode(array_values($rows));
            }
            exit();
        }

        if ($method === 'POST' && empty($subResource)) {
            requireAuth();
            $text = $inputData['text'] ?? '';
            $initial = $inputData['initial'] ?? '';
            $name = $inputData['name'] ?? '';
            $loc = $inputData['loc'] ?? '';
            $date = $inputData['date'] ?? '';
            $rating = intval($inputData['rating'] ?? 5);
            $status = $inputData['status'] ?? 'approved';

            if (!$useFallback) {
                $maxId = $pdo->query("SELECT IFNULL(MAX(id), 0) FROM testimonials")->fetchColumn();
                $newId = $maxId + 1;
                try {
                    $stmt = $pdo->prepare("INSERT INTO testimonials (id, text, initial, name, loc, date, rating, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$newId, $text, $initial, $name, $loc, $date, $rating, $status]);
                } catch(PDOException $e) {
                    if (strpos($e->getMessage(), 'Unknown column') !== false) {
                        $pdo->exec("ALTER TABLE testimonials ADD COLUMN status VARCHAR(20) DEFAULT 'approved'");
                        $stmt = $pdo->prepare("INSERT INTO testimonials (id, text, initial, name, loc, date, rating, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                        $stmt->execute([$newId, $text, $initial, $name, $loc, $date, $rating, $status]);
                    } else {
                        throw $e;
                    }
                }
                echo json_encode(['id' => $newId]);
            } else {
                $db = readJsonDb();
                if (!isset($db['testimonials'])) $db['testimonials'] = [];
                $maxId = 0;
                foreach ($db['testimonials'] as $t) {
                    if ($t['id'] > $maxId) $maxId = $t['id'];
                }
                $newId = $maxId + 1;
                $db['testimonials'][] = [
                    'id' => $newId,
                    'text' => $text,
                    'initial' => $initial,
                    'name' => $name,
                    'loc' => $loc,
                    'date' => $date,
                    'rating' => $rating,
                    'status' => $status
                ];
                writeJsonDb($db);
                echo json_encode(['id' => $newId]);
            }
            exit();
        }

        if ($method === 'PUT') {
            requireAuth();
            $id = intval($subResource);
            $status = $inputData['status'] ?? 'approved';
            
            if (!$useFallback) {
                try {
                    $stmt = $pdo->prepare("UPDATE testimonials SET status = ? WHERE id = ?");
                    $stmt->execute([$status, $id]);
                } catch(PDOException $e) {
                    if (strpos($e->getMessage(), 'Unknown column') !== false) {
                        $pdo->exec("ALTER TABLE testimonials ADD COLUMN status VARCHAR(20) DEFAULT 'approved'");
                        $stmt = $pdo->prepare("UPDATE testimonials SET status = ? WHERE id = ?");
                        $stmt->execute([$status, $id]);
                    } else {
                        throw $e;
                    }
                }
            } else {
                $db = readJsonDb();
                foreach ($db['testimonials'] as &$t) {
                    if ($t['id'] === $id) {
                        $t['status'] = $status;
                        break;
                    }
                }
                writeJsonDb($db);
            }
            echo json_encode(['success' => true]);
            exit();
        }

        if ($method === 'POST' && $subResource && preg_match('/^testimonials\/\d+\/helpful$/', $route)) {
            $parts = explode('/', trim($route, '/'));
            $id = intval($parts[1]);
            $increment = $inputData['increment'] ?? false;
            
            if (!$useFallback) {
                try {
                    $sql = $increment ? "UPDATE testimonials SET helpful_count = IFNULL(helpful_count, 0) + 1 WHERE id = ?" : "UPDATE testimonials SET helpful_count = GREATEST(0, IFNULL(helpful_count, 0) - 1) WHERE id = ?";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$id]);
                } catch(PDOException $e) {
                    if (strpos($e->getMessage(), 'Unknown column') !== false) {
                        $pdo->exec("ALTER TABLE testimonials ADD COLUMN helpful_count INT DEFAULT 0");
                        $sql = $increment ? "UPDATE testimonials SET helpful_count = IFNULL(helpful_count, 0) + 1 WHERE id = ?" : "UPDATE testimonials SET helpful_count = GREATEST(0, IFNULL(helpful_count, 0) - 1) WHERE id = ?";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute([$id]);
                    } else {
                        throw $e;
                    }
                }
            } else {
                $db = readJsonDb();
                foreach ($db['testimonials'] as &$t) {
                    if ($t['id'] === $id) {
                        $t['helpful_count'] = isset($t['helpful_count']) ? $t['helpful_count'] : 0;
                        if ($increment) {
                            $t['helpful_count']++;
                        } else {
                            $t['helpful_count'] = max(0, $t['helpful_count'] - 1);
                        }
                        break;
                    }
                }
                writeJsonDb($db);
            }
            echo json_encode(['success' => true]);
            exit();
        }

        if ($method === 'DELETE') {
            requireAuth();
            $id = intval($subResource);
            if (!$useFallback) {
                $stmt = $pdo->prepare("DELETE FROM testimonials WHERE id = ?");
                $stmt->execute([$id]);
            } else {
                $db = readJsonDb();
                $db['testimonials'] = array_filter($db['testimonials'] ?? [], function($t) use ($id) {
                    return $t['id'] !== $id;
                });
                $db['testimonials'] = array_values($db['testimonials']);
                writeJsonDb($db);
            }
            echo json_encode(['success' => true]);
            exit();
        }
    }

    // ---- 4.1 ADMIN TESTIMONIALS ----
    if ($resource === 'admin' && $subResource === 'testimonials') {
        if ($method === 'GET') {
            requireAuth();
            if (!$useFallback) {
                try {
                    $stmt = $pdo->query("SELECT * FROM testimonials");
                    $checkRows = $stmt->fetchAll();
                    if (count($checkRows) === 0) {
                        $tests = [
                            [1, '"My session was nothing short of revelatory. The accuracy with which the numbers reflected my life\'s patterns left me speechless. I finally understand why certain things kept repeating."', 'P', 'Priya Malhotra', 'Mumbai, India', 'October 2023', 5, 'approved'],
                            [2, '"I was at a complete crossroads in my career. The reading gave me the courage and clarity to make a decision I\'d been avoiding for two years. Genuinely life-changing."', 'R', 'Rohan Kapoor', 'Bangalore, India', 'November 2023', 5, 'approved'],
                            [3, '"The relationship compatibility reading transformed how my partner and I communicate. Understanding our numbers made everything feel less like conflict and more like growth."', 'A', 'Anjali Singh', 'Delhi, India', 'January 2024', 5, 'approved'],
                            [4, '"Simply incredible. The insights into my personal year cycle explained exactly what I was feeling."', 'S', 'Sarah T.', 'London, UK', 'March 2024', 5, 'approved']
                        ];
                        $insertStmt = $pdo->prepare("INSERT INTO testimonials (id, text, initial, name, loc, date, rating, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                        foreach ($tests as $t) {
                            $insertStmt->execute($t);
                        }
                    }
                } catch (\Exception $e) {}

                try {
                   $stmt = $pdo->query("SELECT * FROM testimonials ORDER BY id ASC");
                   echo json_encode($stmt->fetchAll());
                } catch(PDOException $e) {
                   if (strpos($e->getMessage(), 'Unknown column') !== false) {
                       $pdo->exec("ALTER TABLE testimonials ADD COLUMN status VARCHAR(20) DEFAULT 'approved'");
                       $stmt = $pdo->query("SELECT * FROM testimonials ORDER BY id ASC");
                       echo json_encode($stmt->fetchAll());
                   } else {
                       throw $e;
                   }
                }
            } else {
                $db = readJsonDb();
                echo json_encode($db['testimonials'] ?? []);
            }
            exit();
        }
    }

    // ---- 4.2 USER SUBMIT TESTIMONIALS ----
    if ($resource === 'user-testimonials') {
        if ($method === 'POST') {
            $text = $inputData['text'] ?? '';
            $initial = $inputData['initial'] ?? '';
            $name = $inputData['name'] ?? '';
            $loc = $inputData['loc'] ?? '';
            $date = $inputData['date'] ?? date('F j, Y');
            $rating = intval($inputData['rating'] ?? 5);
            $status = 'pending';

            if (!$useFallback) {
                $maxId = $pdo->query("SELECT IFNULL(MAX(id), 0) FROM testimonials")->fetchColumn();
                $newId = $maxId + 1;
                try {
                    $stmt = $pdo->prepare("INSERT INTO testimonials (id, text, initial, name, loc, date, rating, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$newId, $text, $initial, $name, $loc, $date, $rating, $status]);
                } catch(PDOException $e) {
                    if (strpos($e->getMessage(), 'Unknown column') !== false) {
                        $pdo->exec("ALTER TABLE testimonials ADD COLUMN status VARCHAR(20) DEFAULT 'approved'");
                        $stmt = $pdo->prepare("INSERT INTO testimonials (id, text, initial, name, loc, date, rating, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                        $stmt->execute([$newId, $text, $initial, $name, $loc, $date, $rating, $status]);
                    } else {
                        throw $e;
                    }
                }
            } else {
                $db = readJsonDb();
                if (!isset($db['testimonials'])) $db['testimonials'] = [];
                $maxId = 0;
                foreach ($db['testimonials'] as $t) {
                    if ($t['id'] > $maxId) $maxId = $t['id'];
                }
                $newId = $maxId + 1;
                $db['testimonials'][] = [
                    'id' => $newId,
                    'text' => $text,
                    'initial' => $initial,
                    'name' => $name,
                    'loc' => $loc,
                    'date' => $date,
                    'rating' => $rating,
                    'status' => $status
                ];
                writeJsonDb($db);
            }

            // Load settings for email delivery
            if (!$useFallback) {
                $stmt = $pdo->query("SELECT * FROM settings LIMIT 1");
                $settings = $stmt->fetch();
            } else {
                $db = readJsonDb();
                $settings = $db['settings'][0] ?? null;
            }

            if (!$settings || !is_array($settings)) {
                $settings = [];
            }

            $adminEmail = !empty($settings['email']) ? trim($settings['email']) : "info@sevenastro.com";
            $adminRecipient = strtolower(trim($adminEmail));

            // Generate customized gold-layered approval email structure
            $adminSubject = "✨ [Story Approval Required] New Story submitted by " . $name;
            $stars = str_repeat('★', $rating) . str_repeat('☆', 5 - $rating);
            $adminEmailHtml = "
            <div style=\"background-color: #0b0c10; color: #c5a880; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; max-width: 600px; margin: 0 auto; border: 1px solid #c5a880; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);\">
              <div style=\"font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #c5a880; margin-bottom: 10px;\">Divine Sanctuary Stories Journal</div>
              <div style=\"width: 50px; height: 1px; background-color: #c5a880; margin: 15px auto;\"></div>
              
              <h1 style=\"font-size: 26px; font-weight: 300; margin: 15px 0; color: #f5f5f5; font-family: 'Georgia', serif;\">Story Approval Request</h1>
              
              <p style=\"color: #a5a5a5; font-size: 14px; line-height: 1.8; margin-bottom: 25px; text-align: left; padding: 0 10px;\">
                Greetings Master Numerologist,<br/><br/>
                A traveler has shared their journey. Please review this story and approve it in the admin dashboard so it may shine on the sanctuary walls for other seekers:
              </p>

              <div style=\"background-color: rgba(197, 168, 128, 0.08); border: 1px solid #c5a880; padding: 18px; margin-bottom: 25px; text-align: left; border-radius: 2px;\">
                <div style=\"font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #888888; margin-bottom: 4px;\">Submitted Content</div>
                <div style=\"font-size: 15px; font-family: 'Georgia', serif; color: #f5f5f5; font-style: italic; font-weight: 300; margin-bottom: 15px; line-height: 1.6;\">
                  \"" . htmlspecialchars($text) . "\"
                </div>
                <div style=\"border-t: 1px solid rgba(197, 168, 128, 0.2); pt-2; font-size: 12px; color: #c5a880;\">
                  <strong>Seeker Name:</strong> " . htmlspecialchars($name) . " &bull; (" . htmlspecialchars($initial) . ")<br/>
                  <strong>Location:</strong> " . htmlspecialchars($loc) . "<br/>
                  <strong>Rating:</strong> " . $stars . "<br/>
                  <strong>Submitted On:</strong> " . htmlspecialchars($date) . "
                </div>
              </div>

              <div style=\"margin: 30px auto;\">
                <a href=\"https://sevenastro.com/admin\" style=\"background-color: #c5a880; color: #0b0c10; padding: 12px 30px; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 2px; box-shadow: 0 4px 10px rgba(197, 168, 128, 0.35); display: inline-block;\">Go to Admin Dashboard</a>
              </div>
              
              <div style=\"width: 50px; height: 1px; background-color: rgba(197, 168, 128, 0.2); margin: 20px auto;\"></div>
              
              <p style=\"color: #888888; font-size: 11px; line-height: 1.6; max-width: 450px; margin: 0 auto;\">
                Seven Astro © " . date('Y') . " • Stories Approval Dispatch Layer
              </p>
            </div>
            ";

            $emailSent = sendSmartSmtpEmail($adminRecipient, $adminSubject, $adminEmailHtml, $settings);

            echo json_encode(['id' => $newId, 'success' => true, 'emailSent' => $emailSent]);
            exit();
        }
    }

    // ---- 5. LIFE PATHS ----
    if ($resource === 'life_paths') {
        if ($method === 'GET') {
            if ($subResource !== null) {
                $id = intval($subResource);
                if (!$useFallback) {
                    $stmt = $pdo->prepare("SELECT * FROM life_paths WHERE id = ?");
                    $stmt->execute([$id]);
                    $row = $stmt->fetch();
                    if ($row) echo json_encode($row);
                    else {
                        http_response_code(404);
                        echo json_encode(['error' => 'Not found']);
                    }
                } else {
                    $db = readJsonDb();
                    $found = null;
                    foreach ($db['life_paths'] ?? [] as $lp) {
                        if ($lp['id'] == $id) {
                            $found = $lp;
                            break;
                        }
                    }
                    if ($found) echo json_encode($found);
                    else {
                        http_response_code(404);
                        echo json_encode(['error' => 'Not found']);
                    }
                }
            } else {
                if (!$useFallback) {
                    $stmt = $pdo->query("SELECT * FROM life_paths ORDER BY id ASC");
                    echo json_encode($stmt->fetchAll());
                } else {
                    $db = readJsonDb();
                    $rows = $db['life_paths'] ?? [];
                    usort($rows, function($a, $b) { return $a['id'] - $b['id']; });
                    echo json_encode($rows);
                }
            }
            exit();
        }

        if ($method === 'PUT') {
            requireAuth();
            $id = intval($subResource);
            $name = $inputData['name'] ?? '';
            $desc = $inputData['desc'] ?? '';
            if (!$useFallback) {
                $stmt = $pdo->prepare("UPDATE life_paths SET name = ?, `desc` = ? WHERE id = ?");
                $stmt->execute([$name, $desc, $id]);
            } else {
                $db = readJsonDb();
                foreach ($db['life_paths'] as &$lp) {
                    if ($lp['id'] === $id) {
                        $lp['name'] = $name;
                        $lp['desc'] = $desc;
                    }
                }
                writeJsonDb($db);
            }
            echo json_encode(['success' => true]);
            exit();
        }

        if ($method === 'POST') {
            requireAuth();
            $id = intval($inputData['id']);
            $name = $inputData['name'] ?? '';
            $desc = $inputData['desc'] ?? '';
            if (!$useFallback) {
                $stmt = $pdo->prepare("INSERT INTO life_paths (id, name, `desc`) VALUES (?, ?, ?)");
                $stmt->execute([$id, $name, $desc]);
            } else {
                $db = readJsonDb();
                if (!isset($db['life_paths'])) $db['life_paths'] = [];
                $db['life_paths'][] = ['id' => $id, 'name' => $name, 'desc' => $desc];
                writeJsonDb($db);
            }
            echo json_encode(['success' => true]);
            exit();
        }

        if ($method === 'DELETE') {
            requireAuth();
            $id = intval($subResource);
            if (!$useFallback) {
                $stmt = $pdo->prepare("DELETE FROM life_paths WHERE id = ?");
                $stmt->execute([$id]);
            } else {
                $db = readJsonDb();
                $db['life_paths'] = array_filter($db['life_paths'] ?? [], function($lp) use ($id) {
                    return $lp['id'] !== $id;
                });
                $db['life_paths'] = array_values($db['life_paths']);
                writeJsonDb($db);
            }
            echo json_encode(['success' => true]);
            exit();
        }
    }

    // ---- 6. CONTENT PAGES ----
    if ($resource === 'pages') {
        if ($method === 'GET') {
            if ($subResource !== null) {
                $slug = strval($subResource);
                if (!$useFallback) {
                    $stmt = $pdo->prepare("SELECT * FROM content_pages WHERE slug = ?");
                    $stmt->execute([$slug]);
                    $row = $stmt->fetch();
                    if ($row) echo json_encode($row);
                    else {
                        http_response_code(404);
                        echo json_encode(['error' => 'Page not found']);
                    }
                } else {
                    $db = readJsonDb();
                    $found = null;
                    foreach ($db['content_pages'] ?? [] as $cp) {
                        if ($cp['slug'] === $slug) {
                            $found = $cp;
                            break;
                        }
                    }
                    if ($found) echo json_encode($found);
                    else {
                        http_response_code(404);
                        echo json_encode(['error' => 'Page not found']);
                    }
                }
            } else {
                if (!$useFallback) {
                    $stmt = $pdo->query("SELECT * FROM content_pages");
                    echo json_encode($stmt->fetchAll());
                } else {
                    $db = readJsonDb();
                    echo json_encode($db['content_pages'] ?? []);
                }
            }
            exit();
        }

        if ($method === 'PUT') {
            requireAuth();
            $slug = strval($subResource);
            $title = $inputData['title'] ?? '';
            $content = $inputData['content'] ?? '';
            if (!$useFallback) {
                $stmt = $pdo->prepare("UPDATE content_pages SET title = ?, content = ? WHERE slug = ?");
                $stmt->execute([$title, $content, $slug]);
            } else {
                $db = readJsonDb();
                foreach ($db['content_pages'] as &$cp) {
                    if ($cp['slug'] === $slug) {
                        $cp['title'] = $title;
                        $cp['content'] = $content;
                    }
                }
                writeJsonDb($db);
            }
            echo json_encode(['success' => true]);
            exit();
        }
    }

    // ---- 7. CONTACT SUBMISSIONS ----
    if ($resource === 'contact') {
        if ($method === 'POST') {
            $fullName = $inputData['fullName'] ?? '';
            $dob = $inputData['dob'] ?? '';
            $tob = $inputData['tob'] ?? '';
            $pob = $inputData['pob'] ?? '';
            $mobile = $inputData['mobile'] ?? '';
            $email = $inputData['email'] ?? '';
            $comments = $inputData['comments'] ?? '';

            // Get settings for email details
            if (!$useFallback) {
                $stmt = $pdo->query("SELECT * FROM settings LIMIT 1");
                $settings = $stmt->fetch();
            } else {
                $db = readJsonDb();
                $settings = $db['settings'][0] ?? null;
            }

            $adminEmail = !empty($settings['email']) ? trim($settings['email']) : "info@sevenastro.com";
            $smtpUser = !empty($settings['smtp_user']) ? trim($settings['smtp_user']) : "";

            // Save to DB or JSON
            try {
                if (!$useFallback) {
                    $pdo->exec("CREATE TABLE IF NOT EXISTS contact_submissions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        full_name VARCHAR(255),
                        dob VARCHAR(255),
                        tob VARCHAR(255),
                        pob VARCHAR(255),
                        mobile VARCHAR(255),
                        email VARCHAR(255),
                        comments TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )");
                    $stmt = $pdo->prepare("INSERT INTO contact_submissions (full_name, dob, tob, pob, mobile, email, comments) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$fullName, $dob, $tob, $pob, $mobile, $email, $comments]);
                } else {
                    $db = readJsonDb();
                    if (!isset($db['contact_submissions'])) {
                        $db['contact_submissions'] = [];
                    }
                    $nextId = 1;
                    foreach ($db['contact_submissions'] as $cs) {
                        if ($cs['id'] >= $nextId) {
                            $nextId = $cs['id'] + 1;
                        }
                    }
                    $db['contact_submissions'][] = [
                        'id' => $nextId,
                        'full_name' => $fullName,
                        'dob' => $dob,
                        'tob' => $tob,
                        'pob' => $pob,
                        'mobile' => $mobile,
                        'email' => $email,
                        'comments' => $comments,
                        'created_at' => date('c')
                    ];
                    writeJsonDb($db);
                }
            } catch (Exception $dbErr) {
                // Keep moving
            }

            // Construct recipients
            $adminRecipient = !empty($adminEmail) ? strtolower(trim($adminEmail)) : "info@sevenastro.com";
            $visitorEmailLower = !empty($email) ? strtolower(trim($email)) : "";

            // Separate tailored emails for Admin and Inquirer as requested

            // 1. Admin Email HTML
            $adminSubject = "✨ [Seven Astro] Celestial Consultation Request – " . $fullName;
            $adminEmailHtml = "
            <div style=\"background-color: #0b0c10; color: #c5a880; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; max-width: 600px; margin: 0 auto; border: 1px solid #c5a880; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);\">
              <div style=\"font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #c5a880; margin-bottom: 10px;\">Divine Sanctuary Registry</div>
              <div style=\"width: 50px; height: 1px; background-color: #c5a880; margin: 15px auto;\"></div>
              
              <h1 style=\"font-size: 26px; font-weight: 300; margin: 20px 0; color: #f5f5f5; font-family: 'Georgia', serif;\">Celestial Inquiry Registered</h1>
              
              <p style=\"color: #a5a5a5; font-size: 14px; line-height: 1.8; margin-bottom: 30px; text-align: left; padding: 0 10px;\">
                Greetings Master Numerologist,<br/><br/>
                A traveler's details and celestial coordinates have been successfully synchronized with the Seven Astro. Below are the inquiry's registration details:
              </p>
              
              <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; text-align: left; border: 1px solid rgba(197, 168, 128, 0.2);\">
                <thead>
                  <tr style=\"background-color: rgba(197, 168, 128, 0.1);\">
                    <th colspan=\"2\" style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.2); color: #c5a880; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em; font-family: 'Georgia', serif;\">Visitor Coordinates</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5; width: 33%;\">Full Name:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5; font-weight: bold;\">" . htmlspecialchars($fullName) . "</td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5;\">Date of Birth:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5;\">" . htmlspecialchars($dob) . "</td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5;\">Time of Birth:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5;\">" . htmlspecialchars($tob) . "</td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5;\">Place of Birth:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5;\">" . htmlspecialchars($pob) . "</td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5;\">Mobile Number:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5;\">" . htmlspecialchars($mobile) . "</td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5;\">Inquirer Email:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5;\">" . htmlspecialchars($email) . "</td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px; color: #a5a5a5; vertical-align: top;\">Special Comments:</td>
                    <td style=\"padding: 12px; color: #f5f5f5; line-height: 1.6;\">" . nl2br(htmlspecialchars($comments)) . "</td>
                  </tr>
                </tbody>
              </table>
              
              <div style=\"width: 50px; height: 1px; background-color: rgba(197, 168, 128, 0.2); margin: 20px auto;\"></div>
              
              <p style=\"color: #888888; font-size: 11px; line-height: 1.6; max-width: 450px; margin: 0 auto;\">
                Seven Astro Sanctuary Premium Registry Alerts
              </p>
            </div>
            ";

            // 2. User/Inquirer Email HTML
            $userSubject = "✨ [Seven Astro] Inquiry Received – " . $fullName;
            $userEmailHtml = "
            <div style=\"background-color: #0b0c10; color: #c5a880; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; max-width: 600px; margin: 0 auto; border: 1px solid #c5a880; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);\">
              <div style=\"font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #c5a880; margin-bottom: 10px;\">Divine Sanctuary Registry</div>
              <div style=\"width: 50px; height: 1px; background-color: #c5a880; margin: 15px auto;\"></div>
              
              <h1 style=\"font-size: 24px; font-weight: 300; margin: 20px 0; color: #f5f5f5; font-family: 'Georgia', serif;\">Inquiry Received</h1>
              
              <p style="color: #a5a5a5; font-size: 14px; line-height: 1.8; margin-bottom: 30px; text-align: left; padding: 0 10px;\">
                Dear <strong>" . htmlspecialchars($fullName) . "</strong>,<br/><br/>
                Thank you for providing details, We have received your inquiry. Please allow us 24 to 72 hours to give accurate guidance. Thank you for your patience.
              </p>
              
              <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; text-align: left; border: 1px solid rgba(197, 168, 128, 0.2);\">
                <thead>
                  <tr style=\"background-color: rgba(197, 168, 128, 0.1);\">
                    <th colspan=\"2\" style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.2); color: #c5a880; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em; font-family: 'Georgia', serif;\">Your Submitted Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5; width: 35%;\">Birth Name:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5; font-weight: bold;\">" . htmlspecialchars($fullName) . "</td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5;\">Date of Birth:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5;\">" . htmlspecialchars($dob) . "</td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5;\">Time of Birth:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5;\">" . htmlspecialchars($tob) . "</td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5;\">Place of Birth:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5;\">" . htmlspecialchars($pob) . "</td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5;\">Mobile Number:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5;\">" . htmlspecialchars($mobile) . "</td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5;\">Inquirer Email:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5;\">" . htmlspecialchars($email) . "</td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px; color: #a5a5a5; vertical-align: top;\">Your Question:</td>
                    <td style=\"padding: 12px; color: #f5f5f5; line-height: 1.6;\">" . nl2br(htmlspecialchars($comments)) . "</td>
                  </tr>
                </tbody>
              </table>
              
              <div style=\"width: 50px; height: 1px; background-color: rgba(197, 168, 128, 0.2); margin: 20px auto;\"></div>
              
              <p style=\"color: #888888; font-size: 11px; line-height: 1.6; max-width: 450px; margin: 0 auto;\">
                Seven Astro © " . date('Y') . " • All spiritual alignments reserved.
              </p>
            </div>
            ";

            $adminMailSent = sendSmartSmtpEmail($adminRecipient, $adminSubject, $adminEmailHtml, $settings);

            $userMailSent = false;
            if (!empty($visitorEmailLower)) {
                $userMailSent = sendSmartSmtpEmail($visitorEmailLower, $userSubject, $userEmailHtml, $settings);
            }

            echo json_encode(['success' => true, 'emailSent' => ($adminMailSent || $userMailSent)]);
            exit();
        }
    }

    // Default Fallback Response if requested resource isn't matched
    http_response_code(404);
    echo json_encode(['error' => 'API endpoint not matched: ' . $resource]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
