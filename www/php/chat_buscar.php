<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

date_default_timezone_set('America/Sao_Paulo');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$host    = "localhost";
$usuario = "u339248760_proatleta1";
$senha   = "Vini@#07alves";
$banco   = "u339248760_proatleta";

function out($arr, $code = 200) {
  http_response_code($code);
  echo json_encode($arr, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

try {
  $conversa_id = isset($_GET['conversa_id']) ? (int)$_GET['conversa_id'] : 0;
  $apos_id = 0;
  if (isset($_GET['apos_id'])) $apos_id = (int)$_GET['apos_id'];
  elseif (isset($_GET['after'])) $apos_id = (int)$_GET['after'];
  elseif (isset($_GET['after_id'])) $apos_id = (int)$_GET['after_id'];
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 200;
  if ($limit <= 0 || $limit > 1000) $limit = 200;

  if ($conversa_id <= 0) out(['sucesso'=>false,'mensagens'=>[],'mensagem'=>'Parâmetros inválidos'],400);

  $conn = new mysqli($host, $usuario, $senha, $banco);
  $conn->set_charset('utf8mb4');
  $conn->query("SET time_zone = '-03:00'");

  if ($apos_id > 0) {
    $stmt = $conn->prepare("SELECT id, conversa_id, remetente_id, conteudo, DATE_FORMAT(criado, '%Y-%m-%d %H:%i:%s') AS criado FROM mensagens WHERE conversa_id=? AND id>? ORDER BY id ASC LIMIT ?");
    $stmt->bind_param('iii', $conversa_id, $apos_id, $limit);
  } else {
    $stmt = $conn->prepare("SELECT id, conversa_id, remetente_id, conteudo, DATE_FORMAT(criado, '%Y-%m-%d %H:%i:%s') AS criado FROM mensagens WHERE conversa_id=? ORDER BY id ASC LIMIT ?");
    $stmt->bind_param('ii', $conversa_id, $limit);
  }

  $stmt->execute();
  $stmt->bind_result($id,$cid,$rid,$conteudo,$criado);
  $mensagens = [];
  while ($stmt->fetch()) {
    $mensagens[] = [
      'id' => (int)$id,
      'conversa_id' => (int)$cid,
      'remetente_id' => (int)$rid,
      'conteudo' => (string)$conteudo,
      'criado' => (string)$criado,
    ];
  }
  $stmt->close();
  $conn->close();

  out(['sucesso'=>true,'mensagens'=>$mensagens]);
} catch (Throwable $e) {
  out(['sucesso'=>false,'mensagem'=>'Erro interno','detalhe'=>$e->getMessage()], 500);
}