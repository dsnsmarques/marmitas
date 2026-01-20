<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$host = "localhost";
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

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

header('Content-Type: application/json');

// LOG PARA DEBUG (Opcional: remova se não quiser logs no servidor)
// file_put_contents('log.txt', date('Y-m-d H:i:s') . " - Action: $action, Method: $method\n", FILE_APPEND);

// Buscar Cardápio
if ($action == 'getMenu') {
    $stmt = $pdo->query("SELECT * FROM menu_items");
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($items as &$item) {
        $item['isActive'] = (bool)$item['isActive'];
    }
    echo json_encode($items);
    exit;
}

// Buscar Pedidos
if ($action == 'getOrders') {
    $stmt = $pdo->query("SELECT * FROM orders ORDER BY timestamp DESC");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($orders as &$o) { 
        $o['selections'] = json_decode($o['selections'], true); 
    }
    echo json_encode($orders);
    exit;
}

// Buscar Funcionários
if ($action == 'getEmployees') {
    $stmt = $pdo->query("SELECT * FROM employees ORDER BY name ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// Buscar Configurações
if ($action == 'getSettings') {
    $stmt = $pdo->query("SELECT * FROM settings");
    $settings = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $settings[$row['config_key']] = $row['config_value'];
    }
    echo json_encode($settings);
    exit;
}

// Salvar Configuração de Categoria (Máx Seleções e Obrigatório)
if ($method == 'POST' && $action == 'saveCategoryConfig') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data['category'])) {
        http_response_code(400);
        echo json_encode(["error" => "Dados inválidos"]);
        exit;
    }
    $key = "category_config_" . $data['category'];
    $value = json_encode([
        "maxSelections" => $data['maxSelections'],
        "isRequired" => $data['isRequired']
    ]);
    $stmt = $pdo->prepare("INSERT INTO settings (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)");
    $stmt->execute([$key, $value]);
    echo json_encode(["status" => "success"]);
    exit;
}

// Login
if ($method == 'POST' && $action == 'login') {
    $data = json_decode(file_get_contents("php://input"), true);
    $username = $data['username'] ?? 'admin';
    $password = $data['password'] ?? '';
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        echo json_encode(["status" => "success"]);
    } else {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(["error" => "Senha incorreta"]);
    }
    exit;
}

// Salvar/Atualizar Item do Cardápio
if ($method == 'POST' && $action == 'saveMenuItem') {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("INSERT INTO menu_items (id, name, category, isActive) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category), isActive = VALUES(isActive)");
    $isActive = (isset($data['isActive']) && ($data['isActive'] === true || $data['isActive'] == 1 || $data['isActive'] == "1")) ? 1 : 0;
    $stmt->execute([$data['id'], $data['name'], $data['category'], $isActive]);
    echo json_encode(["status" => "success"]);
    exit;
}

// Salvar Funcionário
if ($method == 'POST' && $action == 'saveEmployee') {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("INSERT INTO employees (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)");
    $stmt->execute([$data['id'], $data['name']]);
    echo json_encode(["status" => "success"]);
    exit;
}

// Salvar Configuração (Nome da Empresa)
if ($method == 'POST' && $action == 'saveSetting') {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("INSERT INTO settings (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)");
    $stmt->execute([$data['key'], $data['value']]);
    echo json_encode(["status" => "success"]);
    exit;
}

// Salvar Pedido
if ($method == 'POST' && $action == 'saveOrder') {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("INSERT INTO orders (id, employeeName, selections, timestamp) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $data['id'], 
        $data['employeeName'], 
        json_encode($data['selections']), 
        $data['timestamp'] ?? (time() * 1000)
    ]);
    echo json_encode(["status" => "success"]);
    exit;
}

// Deletar Funcionário
if ($method == 'DELETE' && $action == 'deleteEmployee') {
    $id = $_GET['id'] ?? '';
    $stmt = $pdo->prepare("DELETE FROM employees WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["status" => "success"]);
    exit;
}

// Deletar Item do Cardápio
if ($method == 'DELETE' && $action == 'deleteMenuItem') {
    $id = $_GET['id'] ?? '';
    $stmt = $pdo->prepare("DELETE FROM menu_items WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["status" => "success"]);
    exit;
}

// Limpar Pedidos
if ($method == 'DELETE' && $action == 'clearOrders') {
    $pdo->exec("DELETE FROM orders");
    echo json_encode(["status" => "success"]);
    exit;
}
?>
?>