<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db_host = getenv('DB_HOST') ?: '193.203.184.86';
$db_user = getenv('DB_USER') ?: 'u709894810_masteradmin';
$db_pass = getenv('DB_PASSWORD') ?: 'Master@Admin_2026';
$db_name = getenv('DB_NAME') ?: 'u709894810_sevenastro';

$dsn = "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4";
try {
    $pdo = new PDO($dsn, $db_user, $db_pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$jwt_secret = 'supersecret123';

function create_jwt($payload, $secret) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verify_jwt($jwt, $secret) {
    $tokenParts = explode('.', $jwt);
    if (count($tokenParts) != 3) return false;
    
    $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
    $signatureProvided = $tokenParts[2];

    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    if (hash_equals($base64UrlSignature, $signatureProvided)) {
        return json_decode($payload, true);
    }
    return false;
}

function require_auth() {
    global $jwt_secret;
    $headers = apache_request_headers();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    if (!$authHeader) {
        $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    }
    
    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = $matches[1];
    $payload = verify_jwt($token, $jwt_secret);
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
}

$route = isset($_GET['route']) ? $_GET['route'] : '';
$method = $_SERVER['REQUEST_METHOD'];

$input = json_decode(file_get_contents('php://input'), true) ?: [];

try {
    if ($route === 'settings' && $method === 'GET') {
        $stmt = $pdo->query('SELECT * FROM settings WHERE id = 1');
        $row = $stmt->fetch();
        echo json_encode($row ?: new stdClass());
    }
    elseif ($route === 'life_paths' && $method === 'GET') {
        $stmt = $pdo->query('SELECT * FROM life_paths ORDER BY id ASC');
        echo json_encode($stmt->fetchAll());
    }
    elseif ($route === 'testimonials' && $method === 'GET') {
        $stmt = $pdo->query('SELECT * FROM testimonials ORDER BY id ASC');
        echo json_encode($stmt->fetchAll());
    }
    elseif ($route === 'admin/login' && $method === 'POST') {
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        $stmt = $pdo->prepare('SELECT * FROM admins WHERE email = ? AND password = ?');
        $stmt->execute([$email, $password]);
        if ($stmt->fetch()) {
            $token = create_jwt(['admin' => true, 'iat' => time(), 'exp' => time() + 36000], $jwt_secret);
            echo json_encode(['token' => $token]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
        }
    }
    elseif ($route === 'settings' && $method === 'PUT') {
        require_auth();
        $stmt = $pdo->prepare('UPDATE settings SET whatsapp=?, email=?, whatsapp_message=?, email_subject=?, email_body=? WHERE id=1');
        $stmt->execute([$input['whatsapp'], $input['email'], $input['whatsapp_message'], $input['email_subject'], $input['email_body']]);
        echo json_encode(['success' => true]);
    }
    elseif (preg_match('/^life_paths\/(\d+)$/', $route, $m) && $method === 'PUT') {
        require_auth();
        $stmt = $pdo->prepare('UPDATE life_paths SET name=?, `desc`=? WHERE id=?');
        $stmt->execute([$input['name'], $input['desc'], $m[1]]);
        echo json_encode(['success' => true]);
    }
    elseif ($route === 'life_paths' && $method === 'POST') {
        require_auth();
        $stmt = $pdo->prepare('SELECT * FROM life_paths WHERE id=?');
        $stmt->execute([$input['id']]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'ID already exists']);
        } else {
            $stmt = $pdo->prepare('INSERT INTO life_paths (id, name, `desc`) VALUES (?, ?, ?)');
            $stmt->execute([$input['id'], $input['name'], $input['desc']]);
            echo json_encode(['success' => true]);
        }
    }
    elseif (preg_match('/^life_paths\/(\d+)$/', $route, $m) && $method === 'DELETE') {
        require_auth();
        $stmt = $pdo->prepare('DELETE FROM life_paths WHERE id=?');
        $stmt->execute([$m[1]]);
        echo json_encode(['success' => true]);
    }
    elseif ($route === 'testimonials' && $method === 'POST') {
        require_auth();
        $cnt = $pdo->query('SELECT COUNT(*) as cnt FROM testimonials')->fetch()['cnt'];
        if ($cnt >= 7) {
            http_response_code(400);
            echo json_encode(['error' => 'Maximum 7 testimonials allowed.']);
        } else {
            $stmt = $pdo->query('SELECT MAX(id) as maxId FROM testimonials');
            $maxId = $stmt->fetch()['maxId'];
            $newId = ($maxId !== null) ? $maxId + 1 : 1;
            
            $stmt = $pdo->prepare('INSERT INTO testimonials (id, text, initial, name, loc, date, rating) VALUES (?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$newId, $input['text'], $input['initial'], $input['name'], $input['loc'], $input['date'], $input['rating']]);
            echo json_encode(['success' => true]);
        }
    }
    elseif (preg_match('/^testimonials\/(\d+)$/', $route, $m) && $method === 'DELETE') {
        require_auth();
        $stmt = $pdo->prepare('DELETE FROM testimonials WHERE id=?');
        $stmt->execute([$m[1]]);
        echo json_encode(['success' => true]);
    }
    else {
        http_response_code(404);
        echo json_encode(['error' => 'API Not Found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
