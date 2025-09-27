<?php
// Inicia buffer de saída para evitar qualquer saída indesejada
ob_start();

// Cabeçalhos
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Configura log de erros sem exibir no navegador
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', '/home/usuario/php_error.log'); // coloque caminho válido no servidor
error_reporting(E_ALL);

// Conexão com o banco
$servername = "localhost";
$username = "u339248760_proatleta1";
$password = "Vini@#07alves";
$dbname = "u339248760_proatleta";

$conn = mysqli_connect($servername, $username, $password, $dbname);
if (!$conn) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Erro na conexão: ' . mysqli_connect_error()]);
    exit;
}

// Captura parâmetros do POST
$busca_email  = $_POST['busca_email'] ?? null;
$id_professor = $_POST['id_professor'] ?? null;

// Valida parâmetros
if (!$busca_email || !$id_professor) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Parâmetros incompletos.']);
    exit;
}

if (!filter_var($id_professor, FILTER_VALIDATE_INT)) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'ID do professor inválido.']);
    exit;
}

// Busca aluno pelo email
$sql = "SELECT id FROM usuarios WHERE email = ?";
$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Erro no prepare da consulta: ' . mysqli_error($conn)]);
    exit;
}

mysqli_stmt_bind_param($stmt, "s", $busca_email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if ($row = mysqli_fetch_assoc($result)) {
    $id_aluno = $row['id'];

    // Insere solicitação
    $sql_insert = "INSERT INTO solicitacoes_professor (ID_aluno, ID_professor) VALUES (?, ?)";
    $stmt_insert = mysqli_prepare($conn, $sql_insert);

    if (!$stmt_insert) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Erro no prepare do INSERT: ' . mysqli_error($conn)]);
        exit;
    }

    mysqli_stmt_bind_param($stmt_insert, "ii", $id_aluno, $id_professor);

    if (mysqli_stmt_execute($stmt_insert)) {
        ob_end_clean();
        echo json_encode(['success' => true, 'message' => 'Solicitação enviada com sucesso!']);
    } else {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Erro ao enviar solicitação: ' . mysqli_error($conn)]);
    }

} else {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Aluno não encontrado.']);
}

// Fecha conexão
mysqli_close($conn);
?>
