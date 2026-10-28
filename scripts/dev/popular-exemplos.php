<?php
// Cria peneiras de EXEMPLO no banco local para ver o site e o app funcionando.
// Os nomes das escolinhas são fictícios; os endereços são locais públicos de São Paulo.
// Uso: php scripts/dev/popular-exemplos.php
putenv('PROATLETA_CONFIG=' . __DIR__ . '/config.php');
$_SERVER['REQUEST_METHOD'] = 'CLI';
ob_start();
require __DIR__ . '/../../api/_base.php';
ob_end_clean();

$pdo = db();
$pdo->exec('DELETE FROM peneiras; DELETE FROM tokens; DELETE FROM instituicoes;');

$instituicoes = [
    ['Escolinha Bola de Ouro (exemplo)', 'bola@exemplo.com', 'escolinha', 'São Paulo', 1],
    ['Instituto Craque do Futuro (exemplo)', 'craque@exemplo.com', 'instituto', 'São Paulo', 1],
    ['Clube Atlético Vila Nova (exemplo)', 'vilanova@exemplo.com', 'clube', 'Santo André', 0],
];
$ids = [];
foreach ($instituicoes as [$nome, $email, $tipo, $cidade, $verificada]) {
    $pdo->prepare('INSERT INTO instituicoes (nome, email, senha_hash, tipo, cidade, estado, verificada) VALUES (?,?,?,?,?,?,?)')
        ->execute([$nome, $email, password_hash('Exemplo123', PASSWORD_DEFAULT), $tipo, $cidade, 'SP', $verificada]);
    $ids[] = (int)$pdo->lastInsertId();
}

$d = fn(int $dias) => date('Y-m-d', strtotime("+$dias days"));
$peneiras = [
    [$ids[0], 'Peneira de futebol de campo Sub-13 e Sub-15', 'Futebol', 'Sub-13,Sub-15', 'Goleiro,Zagueiro,Meio-campo,Atacante', $d(5), '08:30', 'Parque Ibirapuera, Av. Pedro Álvares Cabral, Vila Mariana', 'São Paulo', -23.5874, -46.6576, 60, 1, 'https://exemplo.com/inscricao', 'Traga chuteira, caneleira, documento com foto e autorização dos responsáveis.', 1],
    [$ids[1], 'Avaliação técnica Sub-17', 'Futebol', 'Sub-17', 'Lateral,Volante,Atacante', $d(9), '14:00', 'Centro Esportivo Tietê, Av. Santos Dumont, 843, Luz', 'São Paulo', -23.5196, -46.6297, 40, 1, 'https://exemplo.com/sub17', 'Avaliação em dois dias. Os aprovados no primeiro dia voltam no sábado seguinte.', 0],
    [$ids[2], 'Seletiva de futsal Sub-11', 'Futsal', 'Sub-9,Sub-11', 'Todas', $d(12), '09:00', 'Parque Celso Daniel, Av. Dom Pedro II, 940, Jardim', 'Santo André', -23.6596, -46.5384, 30, 1, null, 'Quadra coberta. Chegue 30 minutos antes para o aquecimento.', 0],
    [$ids[1], 'Peneira feminina Sub-15 e Sub-17', 'Futebol', 'Sub-15,Sub-17', 'Todas', $d(16), '08:00', 'Parque Villa-Lobos, Av. Prof. Fonseca Rodrigues, 2001, Alto de Pinheiros', 'São Paulo', -23.5465, -46.7225, 50, 1, 'https://exemplo.com/feminino', 'Primeira seletiva do time feminino do instituto.', 1],
    [$ids[0], 'Seletiva de vôlei Sub-14', 'Vôlei', 'Sub-14', 'Levantadora,Ponteira,Central,Líbero', $d(24), '15:30', 'Centro Esportivo Ibirapuera, Rua Manuel da Nóbrega, 1361, Paraíso', 'São Paulo', -23.5795, -46.6537, 24, 0, 'https://exemplo.com/volei', 'Taxa simbólica de material. Bolsa integral para aprovadas.', 0],
    [$ids[2], 'Peneira de goleiros Sub-15 a Sub-20', 'Futebol', 'Sub-15,Sub-17,Sub-20', 'Goleiro', $d(31), '10:00', 'Estádio Bruno José Daniel, Av. Pedro Américo, Vila Guiomar', 'Santo André', -23.6646, -46.5323, 15, 1, null, 'Avaliação específica de goleiros com preparador de base.', 0],
];
$stmt = $pdo->prepare('INSERT INTO peneiras (instituicao_id, titulo, esporte, categorias, posicoes, data_peneira, hora, endereco, cidade, latitude, longitude, vagas, gratuita, link_inscricao, descricao, destaque) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
foreach ($peneiras as $p) {
    $stmt->execute($p);
}
echo count($peneiras) . " peneiras de exemplo criadas. Login de teste: bola@exemplo.com / Exemplo123\n";
