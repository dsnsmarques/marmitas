<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$host = "u567446487_marmitas.mysql.hostinger.com.br";
$db = "u567446487_marmitas";
$user = "u567446487_marmitas";
$pass = "@@d0ugl4ss3nh4MASTER";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erro na conexão: " . $e->getMessage()]);
    exit;
}

// Login
if ($method == 'POST' && $action == 'login') {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = 'admin' LIMIT 1");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($data['password'], $user['password'])) {
        echo json_encode(["status" => "success"]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Senha incorreta"]);
    }
}

// Buscar Cardápio
if ($method == 'GET' && $action == 'getMenu') {
    $stmt = $pdo->query("SELECT * FROM menu_items WHERE isActive = TRUE");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// Salvar Pedido
if ($method == 'POST' && $action == 'saveOrder') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Dados inválidos"]);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO orders (id, employeeName, selections, timestamp) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $data['id'], 
        $data['employeeName'], 
        json_encode($data['selections']), 
        $data['timestamp'] ?? (time() * 1000)
    ]);
    echo json_encode(["status" => "success"]);
}

// Buscar Pedidos
if ($method == 'GET' && $action == 'getOrders') {
    $stmt = $pdo->query("SELECT * FROM orders ORDER BY timestamp DESC");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($orders as &$o) { 
        $o['selections'] = json_decode($o['selections'], true); 
    }
    echo json_encode($orders);
}

// Limpar Pedidos
if ($method == 'DELETE' && $action == 'clearOrders') {
    $pdo->exec("DELETE FROM orders");
    echo json_encode(["status" => "success"]);
}

// Buscar Configurações
if ($method == 'GET' && $action == 'getSettings') {
    $stmt = $pdo->query("SELECT * FROM settings");
    $settings = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $settings[$row['config_key']] = $row['config_value'];
    }
    echo json_encode($settings);
}
?>