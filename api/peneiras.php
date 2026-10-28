<?php
// Peneiras publicadas pelas instituições.
// GET  ?cidade=&esporte=&q=&destaques=1   lista pública (só peneiras de hoje em diante)
// GET  ?id=12                              uma peneira
// GET  ?acao=minhas                        peneiras da instituição logada
// POST ?acao=criar                         publica peneira (com token)
// POST ?acao=excluir&id=12                 remove peneira da instituição logada
require __DIR__ . '/_base.php';

$acao = $_GET['acao'] ?? '';
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

const CAMPOS = 'p.id, p.titulo, p.esporte, p.categorias, p.posicoes, p.data_peneira, p.hora, p.endereco, p.cidade, p.estado,
                p.latitude, p.longitude, p.vagas, p.gratuita, p.link_inscricao, p.descricao, p.destaque, p.criado_em,
                i.nome AS instituicao, i.tipo AS instituicao_tipo, i.verificada, i.telefone, i.site';

// Nota de destaque: quanto maior, mais alto a peneira aparece em "Melhores peneiras".
// Pesa o destaque manual, instituição verificada, data próxima e informação completa.
function pontuar(array $p): int
{
    $dias = (int)floor((strtotime($p['data_peneira']) - strtotime(date('Y-m-d'))) / 86400);
    $nota = 0;
    $nota += $p['destaque'] ? 40 : 0;
    $nota += $p['verificada'] ? 20 : 0;
    $nota += $dias <= 14 ? 20 : ($dias <= 45 ? 10 : 0);
    $nota += $p['link_inscricao'] ? 8 : 0;
    $nota += $p['hora'] ? 4 : 0;
    $nota += $p['categorias'] ? 4 : 0;
    $nota += $p['gratuita'] ? 4 : 0;
    return $nota;
}

function formatar(array $p): array
{
    $p['id'] = (int)$p['id'];
    $p['categorias'] = $p['categorias'] ? array_values(array_filter(array_map('trim', explode(',', $p['categorias'])))) : [];
    $p['posicoes'] = $p['posicoes'] ? array_values(array_filter(array_map('trim', explode(',', $p['posicoes'])))) : [];
    $p['latitude'] = $p['latitude'] !== null ? (float)$p['latitude'] : null;
    $p['longitude'] = $p['longitude'] !== null ? (float)$p['longitude'] : null;
    $p['vagas'] = $p['vagas'] !== null ? (int)$p['vagas'] : null;
    $p['gratuita'] = (bool)$p['gratuita'];
    $p['verificada'] = (bool)$p['verificada'];
    $p['destaque'] = (bool)$p['destaque'];
    $p['hora'] = $p['hora'] ? substr($p['hora'], 0, 5) : null;
    $p['pontuacao'] = pontuar($p);
    return $p;
}

function lista(array $d, string $nome, int $max): ?string
{
    $valor = $d[$nome] ?? null;
    if (is_array($valor)) {
        $valor = implode(',', $valor);
    }
    $valor = trim((string)$valor);
    return $valor === '' ? null : mb_substr($valor, 0, $max);
}

if ($acao === 'criar' && $metodo === 'POST') {
    $inst = instituicaoLogada();
    $d = entrada();
    $data = texto($d, 'data_peneira', 10, true);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data) || $data < date('Y-m-d')) {
        responder(['success' => false, 'message' => 'Escolha uma data de hoje em diante.', 'campo' => 'data_peneira'], 422);
    }
    $hora = texto($d, 'hora', 5);
    if ($hora && !preg_match('/^\d{2}:\d{2}$/', $hora)) {
        responder(['success' => false, 'message' => 'Use a hora no formato 09:30.', 'campo' => 'hora'], 422);
    }
    $link = texto($d, 'link_inscricao', 255);
    if ($link && !filter_var($link, FILTER_VALIDATE_URL)) {
        responder(['success' => false, 'message' => 'O link de inscrição precisa começar com https://', 'campo' => 'link_inscricao'], 422);
    }
    $lat = isset($d['latitude']) && is_numeric($d['latitude']) ? (float)$d['latitude'] : null;
    $lng = isset($d['longitude']) && is_numeric($d['longitude']) ? (float)$d['longitude'] : null;

    db()->prepare(
        'INSERT INTO peneiras (instituicao_id, titulo, esporte, categorias, posicoes, data_peneira, hora, endereco, cidade, estado,
                               latitude, longitude, vagas, gratuita, link_inscricao, descricao)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $inst['id'],
        texto($d, 'titulo', 140, true),
        texto($d, 'esporte', 40) ?? 'Futebol',
        lista($d, 'categorias', 140),
        lista($d, 'posicoes', 200),
        $data,
        $hora,
        texto($d, 'endereco', 255, true),
        texto($d, 'cidade', 80, true),
        strtoupper(texto($d, 'estado', 2) ?? 'SP'),
        $lat,
        $lng,
        isset($d['vagas']) && is_numeric($d['vagas']) ? max(0, (int)$d['vagas']) : null,
        filter_var($d['gratuita'] ?? true, FILTER_VALIDATE_BOOLEAN) ? 1 : 0,
        $link,
        texto($d, 'descricao', 2000),
    ]);
    responder(['success' => true, 'id' => (int)db()->lastInsertId()], 201);
}

if ($acao === 'excluir' && $metodo === 'POST') {
    $inst = instituicaoLogada();
    $stmt = db()->prepare('DELETE FROM peneiras WHERE id = ? AND instituicao_id = ?');
    $stmt->execute([(int)($_GET['id'] ?? 0), $inst['id']]);
    responder(['success' => $stmt->rowCount() > 0]);
}

if ($acao === 'minhas') {
    $inst = instituicaoLogada();
    $stmt = db()->prepare('SELECT ' . CAMPOS . ' FROM peneiras p JOIN instituicoes i ON i.id = p.instituicao_id
                            WHERE p.instituicao_id = ? ORDER BY p.data_peneira DESC');
    $stmt->execute([$inst['id']]);
    responder(['success' => true, 'peneiras' => array_map('formatar', $stmt->fetchAll())]);
}

if (isset($_GET['id'])) {
    $stmt = db()->prepare('SELECT ' . CAMPOS . ' FROM peneiras p JOIN instituicoes i ON i.id = p.instituicao_id
                            WHERE p.id = ? AND p.status = \'publicada\'');
    $stmt->execute([(int)$_GET['id']]);
    $p = $stmt->fetch();
    $p ? responder(['success' => true, 'peneira' => formatar($p)]) : responder(['success' => false, 'message' => 'Peneira não encontrada.'], 404);
}

// Lista pública
$where = ["p.status = 'publicada'", 'p.data_peneira >= ?'];
$params = [date('Y-m-d')];
if (!empty($_GET['cidade'])) {
    $where[] = 'p.cidade = ?';
    $params[] = $_GET['cidade'];
}
if (!empty($_GET['esporte'])) {
    $where[] = 'p.esporte = ?';
    $params[] = $_GET['esporte'];
}
if (!empty($_GET['q'])) {
    $where[] = '(p.titulo LIKE ? OR i.nome LIKE ? OR p.posicoes LIKE ? OR p.categorias LIKE ?)';
    array_push($params, ...array_fill(0, 4, '%' . $_GET['q'] . '%'));
}
$stmt = db()->prepare('SELECT ' . CAMPOS . ' FROM peneiras p JOIN instituicoes i ON i.id = p.instituicao_id
                        WHERE ' . implode(' AND ', $where) . ' ORDER BY p.data_peneira ASC LIMIT 200');
$stmt->execute($params);
$peneiras = array_map('formatar', $stmt->fetchAll());

if (!empty($_GET['destaques'])) {
    usort($peneiras, fn($a, $b) => $b['pontuacao'] <=> $a['pontuacao'] ?: strcmp($a['data_peneira'], $b['data_peneira']));
    $peneiras = array_slice($peneiras, 0, 6);
}

responder(['success' => true, 'total' => count($peneiras), 'peneiras' => $peneiras]);
