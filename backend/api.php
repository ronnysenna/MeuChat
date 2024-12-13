<?php
header("Content-Type: application/json");

// ==========================
// ** Carrega Variáveis do .env **
// ==========================
require_once __DIR__ . '/../vendor/autoload.php'; // Carrega o autoloader do Composer

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();


// ==========================
// ** CONFIGURAÇÕES **
// ==========================
$apiKey = $_ENV['OPENAI_API_KEY'] ?? null; // Carrega a chave da API
$apiUrl = "https://api.openai.com/v1/chat/completions";

// ==========================
// ** LÊ OS DADOS ENVIADOS **
// ==========================
$data = json_decode(file_get_contents("php://input"), true);
$messages = $data['messages'] ?? [];

// ==========================
// ** VALIDAÇÃO DOS DADOS **
// ==========================
if (!$apiKey) {
    echo json_encode(["error" => "Chave da API ausente. Verifique o arquivo .env."]);
    exit;
}

if (empty($messages)) {
    echo json_encode(["error" => "Histórico de mensagens vazio."]);
    exit;
}

// ==========================
// ** PREPARA A REQUISIÇÃO **
// ==========================
$postData = [
    "model" => "gpt-3.5-turbo",
    "messages" => $messages,
    "max_tokens" => 500,
    "temperature" => 0.7
];

$options = [
    "http" => [
        "header" => "Content-Type: application/json\r\n" .
                    "Authorization: Bearer $apiKey\r\n",
        "method" => "POST",
        "content" => json_encode($postData)
    ]
];

// ==========================
// ** ENVIA A REQUISIÇÃO **
// ==========================
$context = stream_context_create($options);
$response = @file_get_contents($apiUrl, false, $context);

// ==========================
// ** TRATAMENTO DE ERROS **
// ==========================
if ($response === FALSE) {
    $error = error_get_last();
    echo json_encode(["error" => "Erro ao acessar a API OpenAI: {$error['message']}"]);
    exit;
}

// ==========================
// ** RETORNA A RESPOSTA **
// ==========================
$responseData = json_decode($response, true);

if (isset($responseData['error'])) {
    echo json_encode(["error" => "Erro da API OpenAI: " . $responseData['error']['message']]);
    exit;
}

$botMessage = $responseData['choices'][0]['message']['content'] ?? 'Desculpe, não consegui gerar uma resposta.';

echo json_encode(["answer" => $botMessage]);
?>
