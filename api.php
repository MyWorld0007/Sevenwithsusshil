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

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Connection Configurations
define('DB_HOST', '193.203.184.86');
define('DB_USER', 'u709894810_masteradmin');
define('DB_PASS', '@Masteradmin_2026');
define('DB_NAME', 'u709894810_sevenastro');
define('JSON_DB_PATH', __DIR__ . '/database.json');

// Helper to standardise options / inputs
$inputData = json_decode(file_get_contents('php://input'), true) ?? [];

// 2. Establish Database Engine (PDO MySQL with high-fidelity JSON Fallback)
$pdo = null;
$useFallback = false;

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_TIMEOUT            => 4 // Fail fast to avoid freezing the backend
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (Exception $e) {
    $useFallback = true;
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
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
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
    $uploadDir = __DIR__ . '/public/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    $filename = 'profile-' . time() . '-' . rand(1000, 9999) . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
    $targetPath = $uploadDir . $filename;
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
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
            
            if (!$useFallback) {
                // Ensure row 1 exists
                $check = $pdo->query("SELECT COUNT(*) FROM settings WHERE id = 1")->fetchColumn();
                if ($check == 0) {
                    $pdo->prepare("INSERT INTO settings (id) VALUES (1)")->execute();
                }
                
                $sql = "UPDATE settings SET 
                        whatsapp = ?, email = ?, whatsapp_message = ?, email_subject = ?, email_body = ?, 
                        gemini_api_key = ?, profile_photo = ?, about_title = ?, about_para1 = ?, about_para2 = ?
                        WHERE id = 1";
                $pdo->prepare($sql)->execute([
                    $whatsapp, $email, $whatsapp_message, $email_subject, $email_body, 
                    $gemini_api_key, $profile_photo, $about_title, $about_para1, $about_para2
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
                writeJsonDb($db);
            }
            echo json_encode(['success' => true]);
            exit();
        }
    }

    // ---- 2. SERVICES ----
    if ($resource === 'services') {
        if ($method === 'GET') {
            if (!$useFallback) {
                $stmt = $pdo->query("SELECT * FROM services ORDER BY display_order ASC, id ASC");
                $rows = $stmt->fetchAll();
                echo json_encode($rows);
            } else {
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
                $stmt = $pdo->query("SELECT * FROM testimonials ORDER BY id ASC");
                echo json_encode($stmt->fetchAll());
            } else {
                $db = readJsonDb();
                echo json_encode($db['testimonials'] ?? []);
            }
            exit();
        }

        if ($method === 'POST') {
            requireAuth();
            $text = $inputData['text'] ?? '';
            $initial = $inputData['initial'] ?? '';
            $name = $inputData['name'] ?? '';
            $loc = $inputData['loc'] ?? '';
            $date = $inputData['date'] ?? '';
            $rating = intval($inputData['rating'] ?? 5);

            if (!$useFallback) {
                $maxId = $pdo->query("SELECT IFNULL(MAX(id), 0) FROM testimonials")->fetchColumn();
                $newId = $maxId + 1;
                $stmt = $pdo->prepare("INSERT INTO testimonials (id, text, initial, name, loc, date, rating) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$newId, $text, $initial, $name, $loc, $date, $rating]);
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
                    'rating' => $rating
                ];
                writeJsonDb($db);
                echo json_encode(['id' => $newId]);
            }
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

    // Default Fallback Response if requested resource isn't matched
    http_response_code(404);
    echo json_encode(['error' => 'API endpoint not matched: ' . $resource]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
