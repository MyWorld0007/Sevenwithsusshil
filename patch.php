<?php
$content = file_get_contents('api.php');

// 1. Fix Syntax Error at line 1227
$content = str_replace(
    '<p style="color: #a5a5a5; font-size: 14px; line-height: 1.8; margin-bottom: 30px; text-align: left; padding: 0 10px;\">',
    '<p style=\"color: #a5a5a5; font-size: 14px; line-height: 1.8; margin-bottom: 30px; text-align: left; padding: 0 10px;\">',
    $content
);

// 2. Add Bookings to the condition for Contact Submissions
$content = str_replace(
    "if (\$resource === 'contact') {",
    "if (\$resource === 'contact' || \$resource === 'bookings') {",
    $content
);

// 3. Add service title and price parsing in contact logic
$searchInputs = <<<EOT
            \$fullName = \$inputData['fullName'] ?? '';
            \$dob = \$inputData['dob'] ?? '';
            \$tob = \$inputData['tob'] ?? '';
            \$pob = \$inputData['pob'] ?? '';
            \$mobile = \$inputData['mobile'] ?? '';
            \$email = \$inputData['email'] ?? '';
            \$comments = \$inputData['comments'] ?? '';
EOT;
$replaceInputs = <<<EOT
            \$fullName = \$inputData['fullName'] ?? '';
            \$dob = \$inputData['dob'] ?? '';
            \$tob = \$inputData['tob'] ?? '';
            \$pob = \$inputData['pob'] ?? '';
            \$mobile = \$inputData['mobile'] ?? '';
            \$email = \$inputData['email'] ?? '';
            \$comments = \$inputData['comments'] ?? '';
            \$serviceTitle = \$inputData['serviceTitle'] ?? '';
            \$servicePrice = \$inputData['servicePrice'] ?? '';
EOT;
$content = str_replace($searchInputs, $replaceInputs, $content);

// 4. Inject service details into the admin notification email 
$searchAdminEmail = <<<EOT
                  <tr>
                    <td style="padding: 12px; color: #a5a5a5; vertical-align: top;">Special Comments:</td>
EOT;
$replaceAdminEmail = <<<EOT
                  " . (\$serviceTitle ? "
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5;\">Service Selected:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5;\">" . htmlspecialchars(\$serviceTitle) . " (" . htmlspecialchars(\$servicePrice) . ")</td>
                  </tr>" : "") . "
                  <tr>
                    <td style=\"padding: 12px; color: #a5a5a5; vertical-align: top;\">Special Comments:</td>
EOT;
$content = str_replace($searchAdminEmail, $replaceAdminEmail, $content);

// 5. Inject service details into the user notification email
$searchUserEmail = <<<EOT
                  <tr>
                    <td style="padding: 12px; color: #a5a5a5; vertical-align: top;">Your Question:</td>
EOT;
$replaceUserEmail = <<<EOT
                  " . (\$serviceTitle ? "
                  <tr>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #a5a5a5;\">Service Booked:</td>
                    <td style=\"padding: 12px; border-bottom: 1px solid rgba(197, 168, 128, 0.1); color: #f5f5f5;\">" . htmlspecialchars(\$serviceTitle) . " (" . htmlspecialchars(\$servicePrice) . ")</td>
                  </tr>" : "") . "
                  <tr>
                    <td style=\"padding: 12px; color: #a5a5a5; vertical-align: top;\">Your Question:</td>
EOT;
$content = str_replace($searchUserEmail, $replaceUserEmail, $content);

// 6. Ensure services table is created effectively. Add global table initialization logic.
$searchGlobalInit = <<<EOT
// Determine request method
\$method = \$_SERVER['REQUEST_METHOD'];
EOT;
$replaceGlobalInit = <<<EOT
// Determine request method
\$method = \$_SERVER['REQUEST_METHOD'];

// Ensure critical tables exist when DB connects
if (!\$useFallback && \$pdo) {
    try {
        \$pdo->exec("CREATE TABLE IF NOT EXISTS services (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255),
            price VARCHAR(255),
            rawPrice VARCHAR(255),
            description TEXT,
            iconText VARCHAR(50),
            features TEXT,
            display_order INT DEFAULT 0
        )");
    } catch(Exception \$e) {}
}
EOT;
$content = str_replace($searchGlobalInit, $replaceGlobalInit, $content);

file_put_contents('api.php', $content);
echo "Patched api.php successfully.\n";
