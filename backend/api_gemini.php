<?php
// Configura o cabeçalho para JSON
header("Content-Type: application/json");

// Permite requisições de outros domínios (CORS, ajuste conforme necessário)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Verifica se é um método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método não permitido. Use POST."]);
    exit();
}

// Lê os dados enviados pelo frontend
$data = json_decode(file_get_contents("php://input"), true);

// Valida os parâmetros
if (!isset($data['userMessage']) || !isset($data['context'])) {
    http_response_code(400);
    echo json_encode(["error" => "Parâmetros 'userMessage' e 'context' são obrigatórios."]);
    exit();
}

// Variáveis
$apiKey = ""; // Substitua pela sua chave da API do Google
$userMessage = $data['userMessage'];
$context = $data['context'];

// Prepara os dados para a API do Google
$googleApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={$apiKey}";
$postData = json_encode([
    "contents" => [
        ["parts" => [["text" => "{$context}\nPergunta: {$userMessage}"]]]
    ]
]);

// Faz a requisição à API do Google
$options = [
    "http" => [
        "header"  => "Content-Type: application/json",
        "method"  => "POST",
        "content" => $postData
    ]
];
$contexto = stream_context_create($options);
$response = file_get_contents($googleApiUrl, false, $contexto);

// Verifica se a resposta foi bem-sucedida
if ($response === FALSE) {
    http_response_code(500);
    echo json_encode(["error" => "Falha ao conectar com a API."]);
    exit();
}

// Converte e retorna o resultado
$result = json_decode($response, true);
$botResponse = $result['candidates'][0]['content']['parts'][0]['text'] ?? "Desculpe, não encontrei uma resposta.";

echo json_encode(["answer" => $botResponse]);
?>
