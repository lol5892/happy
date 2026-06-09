<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$configPath = __DIR__ . '/rsvp-config.php';
if (!is_file($configPath)) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'error' => 'not_configured'], JSON_UNESCAPED_UNICODE);
    exit;
}

$config = require $configPath;
$token = trim((string) ($config['telegram_bot_token'] ?? ''));
$chatIds = $config['telegram_chat_ids'] ?? [];

if ($token === '' || $token === 'ВСТАВЬТЕ_ТОКЕН_БОТА' || !is_array($chatIds) || $chatIds === []) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'error' => 'not_configured'], JSON_UNESCAPED_UNICODE);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid_json'], JSON_UNESCAPED_UNICODE);
    exit;
}

$name = trim((string) ($data['name'] ?? ''));
$answer = (string) ($data['answer'] ?? '');
$guests = (int) ($data['guests'] ?? 1);

if ($name === '' || mb_strlen($name) > 100) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid_name'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!in_array($answer, ['yes', 'no'], true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid_answer'], JSON_UNESCAPED_UNICODE);
    exit;
}

$guests = max(1, min(20, $guests));

$answerText = $answer === 'yes' ? 'Буду! 🎉' : 'Не смогу 😔';
$guestsText = $answer === 'yes' ? "\nГостей: {$guests}" : '';
$time = (new DateTimeImmutable('now'))->format('d.m.Y H:i');

$message = implode("\n", [
    '🎂 RSVP · Мирон 1 годик',
    '',
    "Имя: {$name}",
    "Ответ: {$answerText}{$guestsText}",
    "Время: {$time}",
]);

$errors = [];
$sent = 0;

foreach ($chatIds as $chatId) {
    if ($chatId === '' || $chatId === null) {
        continue;
    }

    $result = telegram_send_message($token, $chatId, $message);
    if ($result['ok']) {
        $sent++;
    } else {
        $errors[] = $result['error'] ?? 'unknown';
    }
}

if ($sent === 0) {
    http_response_code(502);
    echo json_encode([
        'ok' => false,
        'error' => 'telegram_send_failed',
        'details' => $errors,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => true, 'sent' => $sent], JSON_UNESCAPED_UNICODE);

/**
 * @param string|int $chatId
 * @return array{ok: bool, error?: string}
 */
function telegram_send_message(string $token, string|int $chatId, string $message): array
{
    $url = 'https://api.telegram.org/bot' . $token . '/sendMessage';
    $payload = json_encode([
        'chat_id' => $chatId,
        'text' => $message,
    ], JSON_UNESCAPED_UNICODE);

    $response = http_post_json($url, $payload);
    if (!is_array($response)) {
        return ['ok' => false, 'error' => 'network_error'];
    }

    if (!($response['ok'] ?? false)) {
        $desc = $response['description'] ?? 'telegram_error';
        return ['ok' => false, 'error' => $desc];
    }

    return ['ok' => true];
}

/**
 * @return array<string, mixed>|null
 */
function http_post_json(string $url, string $json): ?array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => $json,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 12,
        ]);
        $body = curl_exec($ch);
        curl_close($ch);
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => $json,
                'timeout' => 12,
            ],
        ]);
        $body = @file_get_contents($url, false, $context);
    }

    if ($body === false || $body === '') {
        return null;
    }

    $decoded = json_decode($body, true);
    return is_array($decoded) ? $decoded : null;
}
