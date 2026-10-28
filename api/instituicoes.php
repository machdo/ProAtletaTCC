<?php
// Conta de escolinhas, clubes e instituições que publicam peneiras.
// POST ?acao=cadastrar  {nome, email, senha, tipo, telefone, cidade, estado, site}
// POST ?acao=entrar     {email, senha}
// GET  ?acao=eu         (com token)
require __DIR__ . '/_base.php';

$acao = $_GET['acao'] ?? '';
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($acao === 'cadastrar' && $metodo === 'POST') {
    $d = entrada();
    $nome = texto($d, 'nome', 120, true);
    $email = strtolower(texto($d, 'email', 160, true));
    $senha = (string)($d['senha'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        responder(['success' => false, 'message' => 'Esse e-mail não parece válido.', 'campo' => 'email'], 422);
    }
    if (strlen($senha) < 8 || !preg_match('/[A-Z]/', $senha) || !preg_match('/\d/', $senha)) {
        responder(['success' => false, 'message' => 'A senha precisa de 8 caracteres, uma letra maiúscula e um número.', 'campo' => 'senha'], 422);
    }

    $existe = db()->prepare('SELECT id FROM instituicoes WHERE email = ?');
    $existe->execute([$email]);
    if ($existe->fetch()) {
        responder(['success' => false, 'message' => 'Já existe uma instituição com esse e-mail. Tente entrar.', 'campo' => 'email'], 409);
    }

    $tipos = ['escolinha', 'clube', 'instituto', 'projeto social', 'outro'];
    $tipo = in_array($d['tipo'] ?? '', $tipos, true) ? $d['tipo'] : 'escolinha';

    db()->prepare(
        'INSERT INTO instituicoes (nome, email, senha_hash, tipo, telefone, cidade, estado, site) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $nome, $email, password_hash($senha, PASSWORD_DEFAULT), $tipo,
        texto($d, 'telefone', 30), texto($d, 'cidade', 80), strtoupper(texto($d, 'estado', 2) ?? 'SP'), texto($d, 'site', 255),
    ]);
    $id = (int)db()->lastInsertId();

    responder(['success' => true, 'token' => criarToken($id), 'instituicao' => ['id' => $id, 'nome' => $nome, 'email' => $email]], 201);
}

if ($acao === 'entrar' && $metodo === 'POST') {
    $d = entrada();
    $email = strtolower(texto($d, 'email', 160, true));
    $senha = (string)($d['senha'] ?? '');

    $stmt = db()->prepare('SELECT id, nome, email, senha_hash FROM instituicoes WHERE email = ?');
    $stmt->execute([$email]);
    $inst = $stmt->fetch();
    if (!$inst || !password_verify($senha, $inst['senha_hash'])) {
        responder(['success' => false, 'message' => 'E-mail ou senha incorretos.'], 401);
    }
    unset($inst['senha_hash']);
    responder(['success' => true, 'token' => criarToken((int)$inst['id']), 'instituicao' => $inst]);
}

if ($acao === 'eu') {
    responder(['success' => true, 'instituicao' => instituicaoLogada()]);
}

responder(['success' => false, 'message' => 'Ação inválida.'], 400);
