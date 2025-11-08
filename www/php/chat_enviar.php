<?php


header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

date_default_timezone_set('America/Sao_Paulo');

$host = "localhost";
$usuario = "u339248760_proatleta1";
$senha = "Vini@#07alves";
$banco = "u339248760_proatleta";

function out($arr, $code = 200) {
  http_response_code($code);
  echo json_encode($arr, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(['sucesso' => false, 'mensagem' => 'Método inválido'], 405);

$conversa_id  = isset($_POST['conversa_id'])  ? (int)$_POST['conversa_id']  : 0;
$remetente_id = isset($_POST['remetente_id']) ? (int)$_POST['remetente_id'] : 0;
$conteudo     = isset($_POST['conteudo'])     ? trim((string)$_POST['conteudo']) : '';

if ($conversa_id <= 0 || $remetente_id <= 0 || $conteudo === '') {
  out(['sucesso' => false, 'mensagem' => 'Parâmetros inválidos'], 400);
}

$conn = @new mysqli($host, $usuario, $senha, $banco);
if ($conn->connect_error) out(['sucesso' => false, 'mensagem' => 'Erro de conexão'], 500);
$conn->set_charset('utf8mb4');
$conn->query("SET time_zone = '-03:00'");

// (Opcional) Validar se conversa existe
$ok = false;
$stmt = $conn->prepare("SELECT 1 FROM conversas WHERE id=? LIMIT 1");
$stmt->bind_param('i', $conversa_id);
$stmt->execute();
$stmt->bind_result($one);
if ($stmt->fetch()) $ok = true;
$stmt->close();
if (!$ok) {
  $conn->close();
  out(['sucesso' => false, 'mensagem' => 'Conversa inexistente'], 404);
}

// Insere mensagem
$stmt = $conn->prepare("INSERT INTO mensagens (conversa_id, remetente_id, conteudo, criado) VALUES (?, ?, ?, NOW())");
$stmt->bind_param('iis', $conversa_id, $remetente_id, $conteudo);
if (!$stmt->execute()) {
  $stmt->close();
  $conn->close();
  out(['sucesso' => false, 'mensagem' => 'Falha ao enviar mensagem'], 500);
}
$msg_id = (int)$conn->insert_id;
$stmt->close();

// Busca timestamp gerado (no fuso local configurado)
$criado = null;
$stmt = $conn->prepare("SELECT DATE_FORMAT(criado, '%Y-%m-%d %H:%i:%s') FROM mensagens WHERE id=?");
$stmt->bind_param('i', $msg_id);
$stmt->execute();
$stmt->bind_result($ts);
if ($stmt->fetch()) $criado = $ts;
$stmt->close();

// Atualiza conversa (última atividade)
$stmt = $conn->prepare("UPDATE conversas SET ultima_mensagem = NOW(), ultimo_id_msg = ? WHERE id = ?");
$stmt->bind_param('ii', $msg_id, $conversa_id);
$stmt->execute();
$stmt->close();

$conn->close();
out(['sucesso' => true, 'id' => $msg_id, 'criado' => $criado]);