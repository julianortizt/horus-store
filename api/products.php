<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

// Create tables on first run
$pdo->exec("CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    price INT NOT NULL,
    priceEUR DECIMAL(10,2),
    image VARCHAR(500) DEFAULT '👕',
    category VARCHAR(50),
    popular TINYINT(1) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$pdo->exec("CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_whatsapp VARCHAR(50),
    items JSON,
    total INT,
    payment VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$id]);
            $product = $stmt->fetch();
            $product ? jsonResponse($product) : jsonResponse(['error' => 'Not found'], 404);
        } else {
            $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || empty($data['name']) || empty($data['price'])) {
            jsonResponse(['error' => 'Name and price required'], 400);
        }
        $newId = $data['id'] ?? 'p' . time();
        $stmt = $pdo->prepare("INSERT INTO products (id, name, type, price, priceEUR, image, category, popular, description) VALUES (?,?,?,?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), price=VALUES(price), priceEUR=VALUES(priceEUR), image=VALUES(image), category=VALUES(category), popular=VALUES(popular), description=VALUES(description)");
        $stmt->execute([
            $newId,
            $data['name'],
            $data['type'] ?? '',
            (int)$data['price'],
            $data['priceEUR'] ?? round((int)$data['price'] / 4200, 2),
            $data['image'] ?? '👕',
            $data['category'] ?? 'personalizado',
            !empty($data['popular']) ? 1 : 0,
            $data['desc'] ?? ''
        ]);
        jsonResponse(['id' => $newId, 'message' => 'Product saved'], 201);
        break;

    case 'PUT':
        if (!$id) jsonResponse(['error' => 'ID required'], 400);
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) jsonResponse(['error' => 'No data'], 400);
        $stmt = $pdo->prepare("UPDATE products SET name=?, type=?, price=?, priceEUR=?, image=?, category=?, popular=?, description=? WHERE id=?");
        $stmt->execute([
            $data['name'] ?? '',
            $data['type'] ?? '',
            (int)($data['price'] ?? 0),
            $data['priceEUR'] ?? 0,
            $data['image'] ?? '👕',
            $data['category'] ?? '',
            !empty($data['popular']) ? 1 : 0,
            $data['desc'] ?? '',
            $id
        ]);
        jsonResponse(['message' => 'Updated']);
        break;

    case 'DELETE':
        if (!$id) jsonResponse(['error' => 'ID required'], 400);
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Deleted']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
