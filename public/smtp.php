<?php
/**
 * Simple PHP SMTP client without dependencies
 */
function send_custom_smtp($host, $port, $user, $pass, $from, $to, $subject, $message) {
    if (!$port) $port = 587;
    $timeout = 15;
    
    // Automatically use ssl wrapper for port 465
    if ($port == 465 && strpos($host, 'ssl://') === false) {
        $host = 'ssl://' . $host;
    }
    
    $socket = fsockopen($host, $port, $errno, $errstr, $timeout);
    if (!$socket) {
        echo "SMTP Error: Could not connect to $host:$port ($errstr)\n";
        return false;
    }
    
    stream_set_timeout($socket, $timeout);

    function _smtp_get_lines($socket, $expected) {
        $data = "";
        while($line = fgets($socket, 515)) {
            $data .= $line;
            if(substr($line, 3, 1) == " ") {
                break;
            }
        }
        echo "SMTP Received: " . trim($data) . "\n";
        if (substr($data, 0, 3) != $expected) {
            echo "SMTP Error: Expected $expected, got: " . substr($data, 0, 3) . "\n";
            return false;
        }
        return true;
    }

    if (!_smtp_get_lines($socket, "220")) return false;

    // EHLO
    $ehloCmd = "EHLO " . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost') . "\r\n";
    echo "SMTP Sent: EHLO ...\n";
    fputs($socket, $ehloCmd);
    if (!_smtp_get_lines($socket, "250")) return false;

    // STARTTLS if port is 587
    if ($port == 587 || $port == 25) {
        echo "SMTP Sent: STARTTLS\n";
        fputs($socket, "STARTTLS\r\n");
        if (_smtp_get_lines($socket, "220")) {
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            
            echo "SMTP Sent: EHLO ... (after TLS)\n";
            fputs($socket, $ehloCmd);
            if (!_smtp_get_lines($socket, "250")) return false;
        }
    }

    // AUTH
    if (!empty($user) && !empty($pass)) {
        echo "SMTP Sent: AUTH LOGIN\n";
        fputs($socket, "AUTH LOGIN\r\n");
        if (!_smtp_get_lines($socket, "334")) return false;

        echo "SMTP Sent: <username base64>\n";
        fputs($socket, base64_encode($user) . "\r\n");
        if (!_smtp_get_lines($socket, "334")) return false;

        echo "SMTP Sent: <password base64>\n";
        fputs($socket, base64_encode($pass) . "\r\n");
        if (!_smtp_get_lines($socket, "235")) return false;
    }

    // MAIL FROM
    echo "SMTP Sent: MAIL FROM: <$from>\n";
    fputs($socket, "MAIL FROM: <$from>\r\n");
    if (!_smtp_get_lines($socket, "250")) return false;

    // RCPT TO
    echo "SMTP Sent: RCPT TO: <$to>\n";
    fputs($socket, "RCPT TO: <$to>\r\n");
    if (!_smtp_get_lines($socket, "250") && !_smtp_get_lines($socket, "251")) return false;

    // DATA
    echo "SMTP Sent: DATA\n";
    fputs($socket, "DATA\r\n");
    if (!_smtp_get_lines($socket, "354")) return false;

    // Message Headers
    $headers  = "From: SevenAstro <$from>\r\n";
    $headers .= "To: <$to>\r\n";
    $headers .= "Subject: $subject\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "\r\n";
    $headers .= $message;
    $headers .= "\r\n.\r\n";

    echo "SMTP Sent: <message data>\n";
    fputs($socket, $headers);
    if (!_smtp_get_lines($socket, "250")) return false;

    echo "SMTP Sent: QUIT\n";
    fputs($socket, "QUIT\r\n");
    fclose($socket);
    
    echo "SMTP Success: email sent to $to\n";
    return true;
}
