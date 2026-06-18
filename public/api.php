<?php
ini_set('display_errors', 0);
error_reporting(0);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

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

// 1. Create admins table
try {
    $pdo->exec('CREATE TABLE IF NOT EXISTS `admins` (
        `id` INT PRIMARY KEY AUTO_INCREMENT,
        `email` VARCHAR(191) UNIQUE,
        `password` VARCHAR(255)
    )');
} catch (Exception $e) {}

// 2. Create settings table
try {
    $pdo->exec('CREATE TABLE IF NOT EXISTS `settings` (
        `id` INT PRIMARY KEY,
        `whatsapp` VARCHAR(255),
        `email` VARCHAR(255),
        `whatsapp_message` TEXT,
        `email_subject` VARCHAR(255),
        `email_body` TEXT,
        `gemini_api_key` VARCHAR(500) NULL,
        `about_title` VARCHAR(500) NULL,
        `about_para1` TEXT NULL,
        `about_para2` TEXT NULL,
        `profile_photo` VARCHAR(500) NULL
    )');
} catch (Exception $e) {}

// Safe upgrades to existing settings tables
try { $pdo->exec("ALTER TABLE `settings` ADD COLUMN `about_title` VARCHAR(500) NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `settings` ADD COLUMN `about_para1` TEXT NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `settings` ADD COLUMN `about_para2` TEXT NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `settings` ADD COLUMN `profile_photo` VARCHAR(500) NULL"); } catch (Exception $e) {}

// 3. Create life_paths table
try {
    $pdo->exec('CREATE TABLE IF NOT EXISTS `life_paths` (
        `id` INT PRIMARY KEY,
        `name` VARCHAR(255),
        `desc` TEXT
    )');
} catch (Exception $e) {}

// 4. Create testimonials table
try {
    $pdo->exec('CREATE TABLE IF NOT EXISTS `testimonials` (
        `id` INT PRIMARY KEY,
        `text` TEXT,
        `initial` VARCHAR(10),
        `name` VARCHAR(255),
        `loc` VARCHAR(255),
        `date` VARCHAR(255),
        `rating` INT
    )');
} catch (Exception $e) {}

// 5. Create content_pages table
try {
    $pdo->exec('CREATE TABLE IF NOT EXISTS `content_pages` (
        `slug` VARCHAR(50) PRIMARY KEY,
        `title` VARCHAR(255),
        `content` LONGTEXT
    )');
} catch (Exception $e) {}

// 6. Create faqs table
try {
    $pdo->exec('CREATE TABLE IF NOT EXISTS `faqs` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `question` VARCHAR(500),
        `answer` LONGTEXT,
        `display_order` INT DEFAULT 0
    )');
} catch (Exception $e) {}

// 7. Create services table
try {
    $pdo->exec('CREATE TABLE IF NOT EXISTS `services` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(255),
        `price` VARCHAR(255),
        `rawPrice` INT,
        `description` TEXT,
        `iconText` VARCHAR(50),
        `features` TEXT,
        `display_order` INT DEFAULT 0
    )');
} catch (Exception $e) {}

// 8. Create pathway_cards table
try {
    $pdo->exec('CREATE TABLE IF NOT EXISTS `pathway_cards` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `card_number` VARCHAR(10),
        `title` VARCHAR(255),
        `slug` VARCHAR(255),
        `short_desc` TEXT,
        `display_order` INT DEFAULT 0
    )');
} catch (Exception $e) {}

// 9. Create partners table
try {
    $pdo->exec('CREATE TABLE IF NOT EXISTS `partners` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255),
        `gratitude` VARCHAR(255) DEFAULT NULL,
        `title` VARCHAR(255),
        `description` TEXT,
        `profile_photo` VARCHAR(500),
        `display_order` INT DEFAULT 0
    )');
} catch (Exception $e) {}

try { $pdo->exec("ALTER TABLE `partners` ADD COLUMN `gratitude` VARCHAR(255) DEFAULT NULL"); } catch (Exception $e) {}

try { $pdo->exec("ALTER TABLE `pathway_cards` ADD COLUMN `display_order` INT DEFAULT 0"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `pathway_cards` ADD COLUMN `slug` VARCHAR(255)"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `pathway_cards` ADD COLUMN `short_desc` TEXT"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `pathway_cards` ADD COLUMN `card_number` VARCHAR(10)"); } catch (Exception $e) {}

try { $pdo->exec("ALTER TABLE `services` ADD COLUMN `display_order` INT DEFAULT 0"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `services` ADD COLUMN `iconText` VARCHAR(50)"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `services` ADD COLUMN `features` TEXT"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `services` ADD COLUMN `rawPrice` INT"); } catch (Exception $e) {}


// --- SEED SECTIONS ---

// Seed admin if empty
try {
    $cntAdmin = $pdo->query('SELECT COUNT(*) as cnt FROM admins')->fetch()['cnt'];
    if ($cntAdmin == 0) {
        $stmt = $pdo->prepare('INSERT INTO admins (email, password) VALUES (?, ?)');
        $stmt->execute(['masteradmin@sevenastro.com', '@Masteradmin_2026']);
    }
} catch (Exception $e) {}

// Seed settings if empty
try {
    $cntSettings = $pdo->query('SELECT COUNT(*) as cnt FROM settings')->fetch()['cnt'];
    if ($cntSettings == 0) {
        $stmt = $pdo->prepare('INSERT INTO settings (id, whatsapp, email, whatsapp_message, email_subject, email_body, gemini_api_key, about_title, about_para1, about_para2, profile_photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            1, 
            '917039516551', 
            '7s.evolve@gmail.com', 
            'Hello! I would like to book a session.', 
            'Book a Session', 
            "Hi Team Seven,\n\nI want to book a session.", 
            null,
            "Bridging ancient wisdom with modern life guidance",
            "I am a Seeker, Intuitive, Healer, and Mentor with 15 years of dedicated experience guiding individuals through life’s most complex challenges. Drawing from my personal life experiences and challenges, I have transformed lessons into wisdom — and now help others navigate their paths with clarity, confidence, and purpose.",
            "By combining astro-numerology, spirituality, and Divine’s wisdom, I evaluate, identify, inspire, encourage, and empower individuals to overcome obstacles and discover their true potential. My approach is holistic: I help people balance emotions, embrace their uniqueness, and live authentically.",
            "/profile.jpeg"
        ]);
    } else {
        // Upgrade existing settings table rows with pristine defaults if currently null/empty
        $stmtCheck = $pdo->query('SELECT about_para1 FROM settings WHERE id = 1');
        $resCheck = $stmtCheck->fetch();
        if (!$resCheck || empty($resCheck['about_para1'])) {
            $stmtUpdate = $pdo->prepare('UPDATE settings SET 
                about_title = COALESCE(about_title, ?),
                about_para1 = ?,
                about_para2 = ?,
                profile_photo = COALESCE(profile_photo, ?)
                WHERE id = 1');
            $stmtUpdate->execute([
                "Bridging ancient wisdom with modern life guidance",
                "I am a Seeker, Intuitive, Healer, and Mentor with 15 years of dedicated experience guiding individuals through life’s most complex challenges. Drawing from my personal life experiences and challenges, I have transformed lessons into wisdom — and now help others navigate their paths with clarity, confidence, and purpose.",
                "By combining astro-numerology, spirituality, and Divine’s wisdom, I evaluate, identify, inspire, encourage, and empower individuals to overcome obstacles and discover their true potential. My approach is holistic: I help people balance emotions, embrace their uniqueness, and live authentically.",
                "/profile.jpeg"
            ]);
        }
    }
} catch (Exception $e) {}

// Seed life_paths if empty
try {
    $cntLP = $pdo->query('SELECT COUNT(*) as cnt FROM life_paths')->fetch()['cnt'];
    if ($cntLP == 0) {
        $lps = [
            [1, 'The Leader', 'Born to lead, Life Path 1 individuals are independent, ambitious, and determined.'],
            [2, 'The Peacemaker', 'Gifted with sensitivity, intuition, and creativity, Life Path 2 individuals are natural harmonizers.'],
            [3, 'The Creator', 'Life Path 3 individuals are naturally creative, expressive, and charismatic.'],
            [4, 'The Builder', 'Life Path 4 individuals are practical, disciplined, and hardworking.'],
            [5, 'The Explorer', 'Life Path 5 individuals are adventurous, versatile, and freedom-loving.'],
            [6, 'The Nurturer', 'Life Path 6 individuals are compassionate, responsible, and deeply caring.'],
            [7, 'The Seeker', 'Life Path 7 individuals are analytical, intuitive, and deeply spiritual.'],
            [8, 'The Achiever', 'Life Path 8 individuals are ambitious, powerful, and naturally gifted in leadership.'],
            [9, 'The Humanitarian', 'Life Path 9 individuals are compassionate, idealistic, and driven by a desire to make a positive impact on the world.'],
            [11, 'The Visionary', 'Life Path 11 is a Master Number associated with intuition, inspiration, and spiritual insight.'],
            [13, 'The Disciplined Builder', 'Life Path 13/4 is a Karmic Debt number that emphasizes hard work, discipline, and perseverance.'],
            [14, 'The Freedom Seeker', 'Life Path 14/5 is a Karmic Debt number that emphasizes freedom, adaptability, and personal growth through experience.'],
            [16, 'The Spiritual Seeker', 'Life Path 16/7 is a Karmic Debt number associated with wisdom, introspection, and spiritual growth.'],
            [19, 'The Independent Leader', 'Life Path 19/1 is a Karmic Debt number associated with leadership, independence, and self-reliance.'],
            [22, 'The Master Builder', 'Life Path 22 is the most powerful Master Number, combining vision, leadership, and practicality.'],
            [33, 'The Master Teacher', 'Life Path 33 is the Master Teacher, representing unconditional love, compassion, and selfless service.']
        ];
        $stmt = $pdo->prepare('INSERT INTO life_paths (id, name, `desc`) VALUES (?, ?, ?)');
        foreach ($lps as $lp) {
            $stmt->execute($lp);
        }
    }
} catch (Exception $e) {}

// Seed testimonials if empty
try {
    $cntTest = $pdo->query('SELECT COUNT(*) as cnt FROM testimonials')->fetch()['cnt'];
    if ($cntTest == 0) {
        $tests = [
            [1, '"My session was nothing short of revelatory. The accuracy with which the numbers reflected my life\'s patterns left me speechless. I finally understand why certain things kept repeating."', 'P', 'Priya Malhotra', 'Mumbai, India', 'October 2023', 5],
            [2, '"I was at a complete crossroads in my career. The reading gave me the courage and clarity to make a decision I\'d been avoiding for two years. Genuinely life-changing."', 'R', 'Rohan Kapoor', 'Bangalore, India', 'November 2023', 5],
            [3, '"The relationship compatibility reading transformed how my partner and I communicate. Understanding our numbers made everything feel less like conflict and more like growth."', 'A', 'Anjali Singh', 'Delhi, India', 'January 2024', 5],
            [4, '"Simply incredible. The insights into my personal year cycle explained exactly what I was feeling."', 'S', 'Sarah T.', 'London, UK', 'March 2024', 5]
        ];
        $stmt = $pdo->prepare('INSERT INTO testimonials (id, text, initial, name, loc, date, rating) VALUES (?, ?, ?, ?, ?, ?, ?)');
        foreach ($tests as $t) {
            $stmt->execute($t);
        }
    }
} catch (Exception $e) {}

// Seed content pages if empty
try {
    $cntPages = $pdo->query('SELECT COUNT(*) as cnt FROM content_pages')->fetch()['cnt'];
    if ($cntPages == 0) {
        $stmt = $pdo->prepare('INSERT INTO content_pages (slug, title, content) VALUES (?, ?, ?)');
        $stmt->execute(['terms', 'Terms & Conditions', 'Welcome to our Terms & Conditions.']);
        $stmt->execute(['privacy', 'Privacy Policy', 'Welcome to our Privacy Policy.']);
        $stmt->execute(['faq', 'FAQ', '']);
    }
} catch (Exception $e) {}

// Seed FAQs if empty
try {
    $cntFaqs = $pdo->query('SELECT COUNT(*) as cnt FROM faqs')->fetch()['cnt'];
    if ($cntFaqs == 0) {
        $stmt = $pdo->prepare('INSERT INTO faqs (question, answer) VALUES (?, ?)');
        $stmt->execute(['What is Numerology?', 'Numerology is the study of numbers and their influence on our lives.']);
        $stmt->execute(['How can I book a reading?', 'You can book a reading by visiting the Booking section on our homepage.']);
    }
} catch (Exception $e) {}

// Seed pathway cards if empty
try {
    $cntCards = $pdo->query('SELECT COUNT(*) as cnt FROM pathway_cards')->fetch()['cnt'];
    if ($cntCards == 0) {
        $initialCards = [
          ['01', 'Child Birth Date & Name Alignment Analysis', 'child-name-alignment', "Discover the optimal name vibration and cosmic alignment for your child's birth energy."],
          ['02', 'Career Path & Success Guidance', 'career-success-guidance', "Explore your professional potential, ideal sectors, and key timing for career breakthroughs or transitions."],
          ['03', 'Relationship Compatibility Analysis', 'relationship-compatibility', "Decipher the numerical resonance between partners to nourish harmony and conscious relationship growth."],
          ['04', 'Birth Date, Name Analysis & Name Correction', 'birth-name-analysis', "A comprehensive analysis of your birth energy and full name correction for lifetime cosmic harmony."],
          ['05', 'Business Numerology & Prosperity Blueprint', 'business-numerology', "Optimize corporate/brand alignment, choose lucky launch dates, and blueprint your business success."],
          ['06', 'Lucky Numbers, Alphabets & Colour Alignment', 'lucky-alignment', "Elevate your daily frequency by aligning with your supportive numbers, letters, and visual energies."],
          ['07', 'Focused Insight Session', 'focused-insight', "Directly target a single query or burning question for swift, clear metaphysical clarity (Single Question)."],
          ['08', 'Gemstone, Crystal, Rudraksha & Yantra Recommendation', 'gemstone-crystal-rudraksha-recommendation', "Receive personalized astronomical cosmic prescription of specific crystals, powerful Rudrakshas, and precious gemstones to amplify protective fields and lucky energy bands."],
          ['09', 'Mobile Number Numerology', 'mobile-number-numerology', "Analyze and optimize your mobile number vibrations to enhance communication, opportunities, prosperity, and overall life harmony."],
          ['10', 'Expert-Led Reiki Healing Sessions', 'reiki-healings', "Experience energy healing through our Expert Reiki Healers to promote emotional balance, stress relief, inner peace, and overall well-being."],
          ['11', 'Expert-Led Tarot Card Readings', 'tarot-readings', "Gain intuitive guidance and deeper insights into life's questions, challenges, opportunities, and future possibilities through Tarot."],
          ['12', 'Expert-Led Guided Meditation', 'guided-meditation', "Experience guided meditation sessions designed to reduce stress, improve focus, enhance self-awareness, and foster inner harmony."],
          ['13', 'Expert-Led Aura & Chakra Healing', 'chakra-healings', "Restore balance and harmony to your energy centers through chakra healing for improved emotional, mental, physical, and spiritual well-being."]
        ];
        
        $stmt = $pdo->prepare('INSERT INTO pathway_cards (card_number, title, slug, short_desc, display_order) VALUES (?, ?, ?, ?, ?)');
        foreach ($initialCards as $i => $card) {
            $stmt->execute([$card[0], $card[1], $card[2], $card[3], $i]);
        }
    }
} catch (Exception $e) {}

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
    if ($route === 'db-diagnostic' && $method === 'GET') {
        $tables = ['admins', 'settings', 'life_paths', 'testimonials', 'content_pages', 'faqs'];
        $status = [];
        foreach ($tables as $tbl) {
            try {
                $count = $pdo->query("SELECT COUNT(*) as cnt FROM `$tbl`")->fetch()['cnt'];
                $status[$tbl] = [
                    'exists' => true,
                    'rows' => $count
                ];
            } catch (Exception $e) {
                $status[$tbl] = [
                    'exists' => false,
                    'error' => $e->getMessage()
                ];
            }
        }
        echo json_encode([
            'database' => $db_name,
            'tables' => $status
        ]);
        exit;
    }
    elseif ($route === 'db-rebuild' && $method === 'POST') {
        $results = [];
        $queries = [
            'drop_admins' => 'DROP TABLE IF EXISTS `admins`',
            'create_admins' => 'CREATE TABLE `admins` (
                `id` INT PRIMARY KEY AUTO_INCREMENT,
                `email` VARCHAR(191) UNIQUE,
                `password` VARCHAR(255)
            )',
            'seed_admins' => "INSERT INTO admins (email, password) VALUES ('masteradmin@sevenastro.com', '@Masteradmin_2026')",
            
            'drop_settings' => 'DROP TABLE IF EXISTS `settings`',
            'create_settings' => 'CREATE TABLE `settings` (
                `id` INT PRIMARY KEY,
                `whatsapp` VARCHAR(255),
                `email` VARCHAR(255),
                `whatsapp_message` TEXT,
                `email_subject` VARCHAR(255),
                `email_body` TEXT,
                `gemini_api_key` VARCHAR(500) NULL
            )',
            'seed_settings' => "INSERT INTO settings (id, whatsapp, email, whatsapp_message, email_subject, email_body, gemini_api_key) VALUES (1, '917039516551', '7s.evolve@gmail.com', 'Hello! I would like to book a session.', 'Book a Session', 'Hi Team Seven,\\n\\nI want to book a session.', null)",
            
            'drop_life_paths' => 'DROP TABLE IF EXISTS `life_paths`',
            'create_life_paths' => 'CREATE TABLE `life_paths` (
                `id` INT PRIMARY KEY,
                `name` VARCHAR(255),
                `desc` TEXT
            )',
            
            'drop_testimonials' => 'DROP TABLE IF EXISTS `testimonials`',
            'create_testimonials' => 'CREATE TABLE `testimonials` (
                `id` INT PRIMARY KEY,
                `text` TEXT,
                `initial` VARCHAR(10),
                `name` VARCHAR(255),
                `loc` VARCHAR(255),
                `date` VARCHAR(255),
                `rating` INT
            )',
            
            'drop_content_pages' => 'DROP TABLE IF EXISTS `content_pages`',
            'create_content_pages' => 'CREATE TABLE `content_pages` (
                `slug` VARCHAR(50) PRIMARY KEY,
                `title` VARCHAR(255),
                `content` LONGTEXT
            )',
            
            'drop_faqs' => 'DROP TABLE IF EXISTS `faqs`',
            'create_faqs' => 'CREATE TABLE `faqs` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `question` VARCHAR(500),
                `answer` LONGTEXT,
                `display_order` INT DEFAULT 0
            )',
            
            'drop_services' => 'DROP TABLE IF EXISTS `services`',
            'create_services' => 'CREATE TABLE `services` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `title` VARCHAR(255),
                `price` VARCHAR(255),
                `rawPrice` INT,
                `description` TEXT,
                `iconText` VARCHAR(50),
                `features` TEXT,
                `operator_id` INT DEFAULT NULL,
                `display_order` INT DEFAULT 0
            )',
            
            'drop_pathways' => 'DROP TABLE IF EXISTS `pathway_cards`',
            'create_pathways' => 'CREATE TABLE `pathway_cards` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `card_number` VARCHAR(10),
                `title` VARCHAR(255),
                `slug` VARCHAR(255),
                `short_desc` TEXT,
                `display_order` INT DEFAULT 0
            )',
            
            'drop_partners' => 'DROP TABLE IF EXISTS `partners`',
            'create_partners' => 'CREATE TABLE `partners` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `name` VARCHAR(255),
                `gratitude` VARCHAR(255) DEFAULT NULL,
                `title` VARCHAR(255),
                `description` TEXT,
                `profile_photo` VARCHAR(500),
                `whatsapp` VARCHAR(255) DEFAULT NULL,
                `display_order` INT DEFAULT 0
            )'
        ];
        
        foreach ($queries as $name => $sql) {
            try {
                $pdo->exec($sql);
                $results[$name] = 'Success';
            } catch (Exception $e) {
                $results[$name] = 'Error: ' . $e->getMessage();
            }
        }
        
        // Detailed seeding for lists
        try {
            $lps = [
                [1, 'The Leader', 'Born to lead, Life Path 1 individuals are independent, ambitious, and determined.'],
                [2, 'The Peacemaker', 'Gifted with sensitivity, intuition, and creativity, Life Path 2 individuals are natural harmonizers.'],
                [3, 'The Creator', 'Life Path 3 individuals are naturally creative, expressive, and charismatic.'],
                [4, 'The Builder', 'Life Path 4 individuals are practical, disciplined, and hardworking.'],
                [5, 'The Explorer', 'Life Path 5 individuals are adventurous, versatile, and freedom-loving.'],
                [6, 'The Nurturer', 'Life Path 6 individuals are compassionate, responsible, and deeply caring.'],
                [7, 'The Seeker', 'Life Path 7 individuals are analytical, intuitive, and deeply spiritual.'],
                [8, 'The Achiever', 'Life Path 8 individuals are ambitious, powerful, and naturally gifted in leadership.'],
                [9, 'The Humanitarian', 'Life Path 9 individuals are compassionate, idealistic, and driven by a desire to make a positive impact on the world.'],
                [11, 'The Visionary', 'Life Path 11 is a Master Number associated with intuition, inspiration, and spiritual insight.'],
                [13, 'The Disciplined Builder', 'Life Path 13/4 is a Karmic Debt number that emphasizes hard work, discipline, and perseverance.'],
                [14, 'The Freedom Seeker', 'Life Path 14/5 is a Karmic Debt number that emphasizes freedom, adaptability, and personal growth through experience.'],
                [16, 'The Spiritual Seeker', 'Life Path 16/7 is a Karmic Debt number associated with wisdom, introspection, and spiritual growth.'],
                [19, 'The Independent Leader', 'Life Path 19/1 is a Karmic Debt number associated with leadership, independence, and self-reliance.'],
                [22, 'The Master Builder', 'Life Path 22 is the most powerful Master Number, combining vision, leadership, and practicality.'],
                [33, 'The Master Teacher', 'Life Path 33 is the Master Teacher, representing unconditional love, compassion, and selfless service.']
            ];
            $stmt = $pdo->prepare('INSERT INTO life_paths (id, name, `desc`) VALUES (?, ?, ?)');
            foreach ($lps as $lp) {
                $stmt->execute($lp);
            }
            $results['seed_life_paths'] = 'Success';
        } catch (Exception $e) {
            $results['seed_life_paths'] = 'Error: ' . $e->getMessage();
        }
        
        try {
            $tests = [
                [1, '"My session was nothing short of revelatory. The accuracy with which the numbers reflected my life\'s patterns left me speechless. I finally understand why certain things kept repeating."', 'P', 'Priya Malhotra', 'Mumbai, India', 'October 2023', 5],
                [2, '"I was at a complete crossroads in my career. The reading gave me the courage and clarity to make a decision I\'d been avoiding for two years. Genuinely life-changing."', 'R', 'Rohan Kapoor', 'Bangalore, India', 'November 2023', 5],
                [3, '"The relationship compatibility reading transformed how my partner and I communicate. Understanding our numbers made everything feel less like conflict and more like growth."', 'A', 'Anjali Singh', 'Delhi, India', 'January 2024', 5],
                [4, '"Simply incredible. The insights into my personal year cycle explained exactly what I was feeling."', 'S', 'Sarah T.', 'London, UK', 'March 2024', 5]
            ];
            $stmt = $pdo->prepare('INSERT INTO testimonials (id, text, initial, name, loc, date, rating) VALUES (?, ?, ?, ?, ?, ?, ?)');
            foreach ($tests as $t) {
                $stmt->execute($t);
            }
            $results['seed_testimonials'] = 'Success';
        } catch (Exception $e) {
            $results['seed_testimonials'] = 'Error: ' . $e->getMessage();
        }
        
        try {
            $stmt = $pdo->prepare('INSERT INTO content_pages (slug, title, content) VALUES (?, ?, ?)');
            $stmt->execute(['terms', 'Terms & Conditions', 'Welcome to our Terms & Conditions.']);
            $stmt->execute(['privacy', 'Privacy Policy', 'Welcome to our Privacy Policy.']);
            $stmt->execute(['faq', 'FAQ', '']);
            $results['seed_content_pages'] = 'Success';
        } catch (Exception $e) {
            $results['seed_content_pages'] = 'Error: ' . $e->getMessage();
        }
        
        try {
            $stmt = $pdo->prepare('INSERT INTO faqs (question, answer) VALUES (?, ?)');
            $stmt->execute(['What is Numerology?', 'Numerology is the study of numbers and their influence on our lives.']);
            $stmt->execute(['How can I book a reading?', 'You can book a reading by visiting the Booking section on our homepage.']);
            $results['seed_faqs'] = 'Success';
        } catch (Exception $e) {
            $results['seed_faqs'] = 'Error: ' . $e->getMessage();
        }
        
        try {
            $initialCards = [
                ['01', 'Child Birth Date & Name Alignment Analysis', 'child-name-alignment', "Discover the optimal name vibration and cosmic alignment for your child's birth energy."],
                ['02', 'Career Path & Success Guidance', 'career-success-guidance', "Explore your professional potential, ideal sectors, and key timing for career breakthroughs or transitions."],
                ['03', 'Relationship Compatibility Analysis', 'relationship-compatibility', "Decipher the numerical resonance between partners to nourish harmony and conscious relationship growth."],
                ['04', 'Birth Date, Name Analysis & Name Correction', 'birth-name-analysis', "A comprehensive analysis of your birth energy and full name correction for lifetime cosmic harmony."],
                ['05', 'Business Numerology & Prosperity Blueprint', 'business-numerology', "Optimize corporate/brand alignment, choose lucky launch dates, and blueprint your business success."],
                ['06', 'Lucky Numbers, Alphabets & Colour Alignment', 'lucky-alignment', "Elevate your daily frequency by aligning with your supportive numbers, letters, and visual energies."],
                ['07', 'Focused Insight Session', 'focused-insight', "Directly target a single query or burning question for swift, clear metaphysical clarity (Single Question)."],
                ['08', 'Gemstone, Crystal, Rudraksha & Yantra Recommendation', 'gemstone-crystal-rudraksha-recommendation', "Receive personalized astronomical cosmic prescription of specific crystals, powerful Rudrakshas, and precious gemstones to amplify protective fields and lucky energy bands."],
                ['09', 'Mobile Number Numerology', 'mobile-number-numerology', "Analyze and optimize your mobile number vibrations to enhance communication, opportunities, prosperity, and overall life harmony."],
                ['10', 'Expert-Led Reiki Healing Sessions', 'reiki-healings', "Experience energy healing through our Expert Reiki Healers to promote emotional balance, stress relief, inner peace, and overall well-being."],
                ['11', 'Expert-Led Tarot Card Readings', 'tarot-readings', "Gain intuitive guidance and deeper insights into life's questions, challenges, opportunities, and future possibilities through Tarot."],
                ['12', 'Expert-Led Guided Meditation', 'guided-meditation', "Experience guided meditation sessions designed to reduce stress, improve focus, enhance self-awareness, and foster inner harmony."],
                ['13', 'Expert-Led Aura & Chakra Healing', 'chakra-healings', "Restore balance and harmony to your energy centers through chakra healing for improved emotional, mental, physical, and spiritual well-being."]
            ];
            
            $stmt = $pdo->prepare('INSERT INTO pathway_cards (card_number, title, slug, short_desc, display_order) VALUES (?, ?, ?, ?, ?)');
            foreach ($initialCards as $i => $card) {
                $stmt->execute([$card[0], $card[1], $card[2], $card[3], $i]);
            }
            $results['seed_pathway_cards'] = 'Success';
        } catch (Exception $e) {
            $results['seed_pathway_cards'] = 'Error: ' . $e->getMessage();
        }
        
        echo json_encode($results);
        exit;
    }

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
    elseif ($route === 'admin/testimonials' && $method === 'GET') {
        require_auth();
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
        $gemini_key = isset($input['gemini_api_key']) ? $input['gemini_api_key'] : null;

        $current = $pdo->query('SELECT * FROM settings WHERE id = 1')->fetch();
        $about_title = isset($input['about_title']) ? $input['about_title'] : ($current['about_title'] ?? "Bridging ancient wisdom with modern life guidance");
        $about_para1 = isset($input['about_para1']) ? $input['about_para1'] : ($current['about_para1'] ?? "");
        $about_para2 = isset($input['about_para2']) ? $input['about_para2'] : ($current['about_para2'] ?? "");
        $profile_photo = isset($input['profile_photo']) ? $input['profile_photo'] : ($current['profile_photo'] ?? "/profile.jpeg");

        $stmt = $pdo->prepare('UPDATE settings SET whatsapp=?, email=?, whatsapp_message=?, email_subject=?, email_body=?, gemini_api_key=?, about_title=?, about_para1=?, about_para2=?, profile_photo=? WHERE id=1');
        $stmt->execute([
            $input['whatsapp'], 
            $input['email'], 
            $input['whatsapp_message'], 
            $input['email_subject'], 
            $input['email_body'], 
            $gemini_key,
            $about_title,
            $about_para1,
            $about_para2,
            $profile_photo
        ]);
        echo json_encode(['success' => true]);
    }
    elseif ($route === 'notify_expert_booking' && $method === 'POST') {
        $stmt = $pdo->query('SELECT email FROM settings WHERE id = 1');
        $settings = $stmt->fetch();
        $adminEmail = $settings ? $settings['email'] : 'info@sevenastro.com';
        $serviceTitle = isset($input['serviceTitle']) ? $input['serviceTitle'] : '';
        $servicePrice = isset($input['servicePrice']) ? $input['servicePrice'] : '';
        $operatorName = isset($input['operatorName']) ? $input['operatorName'] : '';
        $operatorWhatsapp = isset($input['operatorWhatsapp']) ? $input['operatorWhatsapp'] : '';
        $fullName = isset($input['fullName']) ? $input['fullName'] : '';
        $dob = isset($input['dob']) ? $input['dob'] : '';
        $tob = isset($input['tob']) ? $input['tob'] : '';
        $pob = isset($input['pob']) ? $input['pob'] : '';
        $mobile = isset($input['mobile']) ? $input['mobile'] : '';
        $email = isset($input['email']) ? $input['email'] : '';
        
        $subject = "Expert Booking via WhatsApp: " . $serviceTitle . " with " . $operatorName;
        $message = "New Expert Booking Selected via WhatsApp\n\n";
        $message .= "A user has initiated a WhatsApp booking for " . $serviceTitle . " - " . $servicePrice . " with Partner " . $operatorName . ".\n\n";
        
        if ($fullName) {
            $message .= "User Details:\n";
            $message .= "- Name: " . $fullName . "\n";
            $message .= "- DOB: " . $dob . "\n";
            $message .= "- TOB: " . $tob . "\n";
            $message .= "- Location: " . $pob . "\n";
            $message .= "- Phone: " . $mobile . "\n";
            $message .= "- Email: " . $email . "\n\n";
        }

        $message .= "The user has clicked 'Book Now' and been redirected to the Partner's WhatsApp (" . $operatorWhatsapp . ").";
        
        $headers = "From: no-reply@" . $_SERVER['HTTP_HOST'] . "\r\n";
        mail($adminEmail, $subject, $message, $headers);
        echo json_encode(['success' => true]);
    }
    elseif ($route === 'upload' && $method === 'POST') {
        require_auth();
        if (!isset($_FILES['photo'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            exit;
        }
        $file = $_FILES['photo'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'Upload error code: ' . $file['error']]);
            exit;
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Only image uploads are allowed.']);
            exit;
        }

        $targetDir = __DIR__ . '/uploads/';
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'profile-' . time() . '-' . rand(1000, 9999) . '.' . $ext;
        $targetPath = $targetDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            echo json_encode(['success' => true, 'url' => '/uploads/' . $filename]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save uploaded file on server.']);
        }
        exit;
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
    elseif ($route === 'services' && $method === 'GET') {
        $stmt = $pdo->query('SELECT s.*, p.name as operator_name, p.whatsapp as operator_whatsapp FROM services s LEFT JOIN partners p ON s.operator_id = p.id ORDER BY s.display_order ASC, s.id ASC');
        echo json_encode($stmt->fetchAll());
    }
    elseif ($route === 'services' && $method === 'POST') {
        require_auth();
        $stmt = $pdo->query('SELECT COUNT(*) as cnt FROM services');
        $order = $stmt->fetch()['cnt'];
        $stmt = $pdo->prepare('INSERT INTO services (title, price, rawPrice, description, iconText, features, operator_id, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $features = is_array($input['features']) ? json_encode($input['features']) : $input['features'];
        $operator_id = isset($input['operator_id']) ? $input['operator_id'] : null;
        $stmt->execute([$input['title'], $input['price'], $input['rawPrice'], $input['description'], $input['iconText'], $features, $operator_id, $order]);
        echo json_encode(['id' => $pdo->lastInsertId()]);
    }
    elseif ($route === 'services/reorder' && $method === 'POST') {
        require_auth();
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('UPDATE services SET display_order=? WHERE id=?');
        foreach ($input['orderIds'] as $i => $id) {
            $stmt->execute([$i, $id]);
        }
        $pdo->commit();
        echo json_encode(['success' => true]);
    }
    elseif (preg_match('/^services\/([0-9]+)$/', $route, $m) && $method === 'PUT') {
        require_auth();
        $stmt = $pdo->prepare('UPDATE services SET title=?, price=?, rawPrice=?, description=?, iconText=?, features=?, operator_id=? WHERE id=?');
        $features = is_array($input['features']) ? json_encode($input['features']) : $input['features'];
        $operator_id = isset($input['operator_id']) ? $input['operator_id'] : null;
        $stmt->execute([$input['title'], $input['price'], $input['rawPrice'], $input['description'], $input['iconText'], $features, $operator_id, $m[1]]);
        echo json_encode(['success' => true]);
    }
    elseif (preg_match('/^services\/([0-9]+)$/', $route, $m) && $method === 'DELETE') {
        require_auth();
        $stmt = $pdo->prepare('DELETE FROM services WHERE id=?');
        $stmt->execute([$m[1]]);
        echo json_encode(['success' => true]);
    }
    elseif ($route === 'pathway_cards' && $method === 'GET') {
        $stmt = $pdo->query('SELECT * FROM pathway_cards ORDER BY display_order ASC, id ASC');
        echo json_encode($stmt->fetchAll());
    }
    elseif ($route === 'pathway_cards' && $method === 'POST') {
        require_auth();
        $stmt = $pdo->query('SELECT COUNT(*) as cnt FROM pathway_cards');
        $order = $stmt->fetch()['cnt'];
        $stmt = $pdo->prepare('INSERT INTO pathway_cards (card_number, title, slug, short_desc, display_order) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$input['card_number'], $input['title'], $input['slug'], $input['short_desc'], $order]);
        echo json_encode(['id' => $pdo->lastInsertId()]);
    }
    elseif ($route === 'pathway_cards/reorder' && $method === 'POST') {
        require_auth();
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('UPDATE pathway_cards SET display_order=? WHERE id=?');
        foreach ($input['orderIds'] as $i => $id) {
            $stmt->execute([$i, $id]);
        }
        $pdo->commit();
        echo json_encode(['success' => true]);
    }
    elseif (preg_match('/^pathway_cards\/([0-9]+)$/', $route, $m) && $method === 'PUT') {
        require_auth();
        $stmt = $pdo->prepare('UPDATE pathway_cards SET card_number=?, title=?, slug=?, short_desc=? WHERE id=?');
        $stmt->execute([$input['card_number'], $input['title'], $input['slug'], $input['short_desc'], $m[1]]);
        echo json_encode(['success' => true]);
    }
    elseif (preg_match('/^pathway_cards\/([0-9]+)$/', $route, $m) && $method === 'DELETE') {
        require_auth();
        $stmt = $pdo->prepare('DELETE FROM pathway_cards WHERE id=?');
        $stmt->execute([$m[1]]);
        echo json_encode(['success' => true]);
    }
    elseif ($route === 'partners' && $method === 'GET') {
        $stmt = $pdo->query('SELECT * FROM partners ORDER BY display_order ASC, id ASC');
        echo json_encode($stmt->fetchAll());
    }
    elseif ($route === 'partners' && $method === 'POST') {
        require_auth();
        $stmt = $pdo->query('SELECT COUNT(*) as cnt FROM partners');
        $order = $stmt->fetch()['cnt'];
        $stmt = $pdo->prepare('INSERT INTO partners (name, gratitude, title, description, profile_photo, whatsapp, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $gratitude = isset($input['gratitude']) ? $input['gratitude'] : '';
        $whatsapp = isset($input['whatsapp']) ? $input['whatsapp'] : '';
        $stmt->execute([$input['name'], $gratitude, $input['title'], $input['description'], $input['profile_photo'], $whatsapp, $order]);
        echo json_encode(['id' => $pdo->lastInsertId()]);
    }
    elseif ($route === 'partners/reorder' && $method === 'POST') {
        require_auth();
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('UPDATE partners SET display_order=? WHERE id=?');
        foreach ($input['orderIds'] as $i => $id) {
            $stmt->execute([$i, $id]);
        }
        $pdo->commit();
        echo json_encode(['success' => true]);
    }
    elseif (preg_match('/^partners\/([0-9]+)$/', $route, $m) && $method === 'PUT') {
        require_auth();
        $stmt = $pdo->prepare('UPDATE partners SET name=?, gratitude=?, title=?, description=?, profile_photo=?, whatsapp=? WHERE id=?');
        $gratitude = isset($input['gratitude']) ? $input['gratitude'] : '';
        $whatsapp = isset($input['whatsapp']) ? $input['whatsapp'] : '';
        $stmt->execute([$input['name'], $gratitude, $input['title'], $input['description'], $input['profile_photo'], $whatsapp, $m[1]]);
        echo json_encode(['success' => true]);
    }
    elseif (preg_match('/^partners\/([0-9]+)$/', $route, $m) && $method === 'DELETE') {
        require_auth();
        $stmt = $pdo->prepare('DELETE FROM partners WHERE id=?');
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
