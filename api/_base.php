<?php
// Base compartilhada da API de peneiras do ProAtleta: conexão, JSON, CORS e autenticação.
// As credenciais NUNCA ficam no código: copie config.exemplo.php para config.php (ignorado pelo git).

declare(strict_types=1);

ini_set('display_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Token');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function config(): array
{
    static $config = null;
    if ($config === null) {
        $arquivo = getenv('PROATLETA_CONFIG') ?: __DIR__ . '/config.php';
        if (!is_file($arquivo)) {
            responder(['success' => false, 'message' => 'API sem configuração. Copie config.exemplo.php para config.php.'], 500);
        }
        $config = require $arquivo;
    }
    return $config;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $c = config();
        $pdo = new PDO($c['dsn'], $c['usuario'] ?? null, $c['senha'] ?? null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        if (str_starts_with($c['dsn'], 'sqlite:')) {
            criarTabelasSqlite($pdo);
        }
    }
    return $pdo;
}

// Só para desenvolvimento local: cria as tabelas no SQLite se ainda não existirem.
function criarTabelasSqlite(PDO $pdo): void
{
    $pdo->exec(file_get_contents(__DIR__ . '/schema.sqlite.sql'));
}

function responder(array $dados, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function entrada(): array
{
    $tipo = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($tipo, 'application/json')) {
        $json = json_decode(file_get_contents('php://input') ?: '[]', true);
        return is_array($json) ? $json : [];
    }
    return $_POST;
}

function texto(array $dados, string $campo, int $max = 255, bool $obrigatorio = false): ?string
{
    $valor = trim((string)($dados[$campo] ?? ''));
    if ($valor === '') {
        if ($obrigatorio) {
            responder(['success' => false, 'message' => "Preencha o campo \"$campo\".", 'campo' => $campo], 422);
        }
        return null;
    }
    return mb_substr($valor, 0, $max);
}

function tokenDaRequisicao(): ?string
{
    $cabecalho = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+([a-f0-9]{64})/i', $cabecalho, $m)) {
        return strtolower($m[1]);
    }
    // Algumas hospedagens removem o cabeçalho Authorization; X-Token é o plano B.
    $alternativo = $_SERVER['HTTP_X_TOKEN'] ?? '';
    return preg_match('/^[a-f0-9]{64}$/i', $alternativo) ? strtolower($alternativo) : null;
}

function instituicaoLogada(): array
{
    $token = tokenDaRequisicao();
    if (!$token) {
        responder(['success' => false, 'message' => 'Entre na conta da sua instituição para continuar.'], 401);
    }
    $stmt = db()->prepare(
        'SELECT i.id, i.nome, i.email, i.cidade, i.estado, i.telefone, i.site
           FROM tokens t JOIN instituicoes i ON i.id = t.instituicao_id
          WHERE t.token_hash = ? AND t.expira_em > ?'
    );
    $stmt->execute([hash('sha256', $token), date('Y-m-d H:i:s')]);
    $instituicao = $stmt->fetch();
    if (!$instituicao) {
        responder(['success' => false, 'message' => 'Sua sessão expirou. Entre de novo.'], 401);
    }
    return $instituicao;
}

function criarToken(int $instituicaoId): string
{
    $token = bin2hex(random_bytes(32));
    db()->prepare('INSERT INTO tokens (token_hash, instituicao_id, expira_em) VALUES (?, ?, ?)')
        ->execute([hash('sha256', $token), $instituicaoId, date('Y-m-d H:i:s', strtotime('+30 days'))]);
    return $token;
}
