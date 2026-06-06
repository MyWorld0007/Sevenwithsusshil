<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db_user = getenv('DB_USER') ?: 'u709894810_masteradmin';
$db_pass = getenv('DB_PASSWORD') ?: '@Masteradmin_2026';
$db_name = getenv('DB_NAME') ?: 'u709894810_sevenastro';

$pdo = null;
$hosts = [getenv('DB_HOST') ?: 'localhost', '127.0.0.1', '193.203.184.86'];
$lastError = '';

foreach ($hosts as $host) {
    if (!$host) continue;
    $dsn = "mysql:host=$host;dbname=$db_name;charset=utf8mb4";
    try {
        $pdo = new PDO($dsn, $db_user, $db_pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
        break; // Connected successfully
    } catch (PDOException $e) {
        $lastError = $e->getMessage();
    }
}

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $lastError]);
    exit;
}

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS content_pages (
        slug VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255),
        content LONGTEXT
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS faqs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question VARCHAR(500),
        answer LONGTEXT,
        display_order INT DEFAULT 0
    )");

    // Seed content pages if empty
    $cnt = $pdo->query('SELECT COUNT(*) as cnt FROM content_pages')->fetch()['cnt'];
    if ($cnt == 0) {
        $stmt = $pdo->prepare("INSERT INTO content_pages (slug, title, content) VALUES (?, ?, ?)");
        $stmt->execute(['terms', 'Terms & Conditions', 'Welcome to our Terms & Conditions.']);
        $stmt->execute(['privacy', 'Privacy Policy', 'Welcome to our Privacy Policy.']);
        $stmt->execute(['faq', 'FAQ', '']);
    }
} catch (Exception $e) {
    // Ignore seeding errors
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
    elseif ($route === 'pages' && $method === 'GET') {
        $stmt = $pdo->query('SELECT * FROM content_pages');
        echo json_encode($stmt->fetchAll());
    }
    elseif (preg_match('/^pages\/([a-zA-Z0-9_-]+)$/', $route, $m) && $method === 'GET') {
        $stmt = $pdo->prepare('SELECT * FROM content_pages WHERE slug=?');
        $stmt->execute([$m[1]]);
        $row = $stmt->fetch();
        if ($row) echo json_encode($row);
        else {
            http_response_code(404);
            echo json_encode(['error' => 'Page not found']);
        }
    }
    elseif (preg_match('/^pages\/([a-zA-Z0-9_-]+)$/', $route, $m) && $method === 'PUT') {
        require_auth();
        $stmt = $pdo->prepare('UPDATE content_pages SET title=?, content=? WHERE slug=?');
        $stmt->execute([$input['title'], $input['content'], $m[1]]);
        echo json_encode(['success' => true]);
    }
    elseif ($route === 'faqs' && $method === 'GET') {
        $stmt = $pdo->query('SELECT * FROM faqs ORDER BY display_order ASC, id ASC');
        echo json_encode($stmt->fetchAll());
    }
    elseif ($route === 'faqs' && $method === 'POST') {
        require_auth();
        $stmt = $pdo->prepare('INSERT INTO faqs (question, answer) VALUES (?, ?)');
        $stmt->execute([$input['question'], $input['answer']]);
        echo json_encode(['id' => $pdo->lastInsertId()]);
    }
    elseif (preg_match('/^faqs\/([0-9]+)$/', $route, $m) && $method === 'PUT') {
        require_auth();
        $stmt = $pdo->prepare('UPDATE faqs SET question=?, answer=? WHERE id=?');
        $stmt->execute([$input['question'], $input['answer'], $m[1]]);
        echo json_encode(['success' => true]);
    }
    elseif (preg_match('/^faqs\/([0-9]+)$/', $route, $m) && $method === 'DELETE') {
        require_auth();
        $stmt = $pdo->prepare('DELETE FROM faqs WHERE id=?');
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
