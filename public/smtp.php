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
        error_log("SMTP Error: Could not connect to $host:$port ($errstr)");
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
        error_log("SMTP Received: " . trim($data));
        if (substr($data, 0, 3) != $expected) {
            error_log("SMTP Error: Expected $expected, got: " . substr($data, 0, 3));
            return false;
        }
        return true;
    }

    if (!_smtp_get_lines($socket, "220")) return false;

    // EHLO
    $ehloCmd = "EHLO " . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost') . "\r\n";
    error_log("SMTP Sent: EHLO ...");
    fputs($socket, $ehloCmd);
    if (!_smtp_get_lines($socket, "250")) return false;

    // STARTTLS if port is 587
    if ($port == 587 || $port == 25) {
        error_log("SMTP Sent: STARTTLS");
        fputs($socket, "STARTTLS\r\n");
        if (_smtp_get_lines($socket, "220")) {
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            
            error_log("SMTP Sent: EHLO ... (after TLS)");
            fputs($socket, $ehloCmd);
            if (!_smtp_get_lines($socket, "250")) return false;
        }
    }

    // AUTH
    if (!empty($user) && !empty($pass)) {
        error_log("SMTP Sent: AUTH LOGIN");
        fputs($socket, "AUTH LOGIN\r\n");
        if (!_smtp_get_lines($socket, "334")) return false;

        error_log("SMTP Sent: <username base64>");
        fputs($socket, base64_encode($user) . "\r\n");
        if (!_smtp_get_lines($socket, "334")) return false;

        error_log("SMTP Sent: <password base64>");
        fputs($socket, base64_encode($pass) . "\r\n");
        if (!_smtp_get_lines($socket, "235")) return false;
    }

    // MAIL FROM
    error_log("SMTP Sent: MAIL FROM: <$from>");
    fputs($socket, "MAIL FROM: <$from>\r\n");
    if (!_smtp_get_lines($socket, "250")) return false;

    // RCPT TO
    error_log("SMTP Sent: RCPT TO: <$to>");
    fputs($socket, "RCPT TO: <$to>\r\n");
    if (!_smtp_get_lines($socket, "250") && !_smtp_get_lines($socket, "251")) return false;

    // DATA
    error_log("SMTP Sent: DATA");
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

    error_log("SMTP Sent: <message data>");
    fputs($socket, $headers);
    if (!_smtp_get_lines($socket, "250")) return false;

    error_log("SMTP Sent: QUIT");
    fputs($socket, "QUIT\r\n");
    fclose($socket);
    
    error_log("SMTP Success: email sent to $to");
    return true;
}
