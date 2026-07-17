<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) jsonResponse(['error' => 'No data'], 400);
        $stmt = $pdo->prepare("INSERT INTO orders (id, customer_name, customer_email, customer_phone, customer_whatsapp, items, total, payment, status, address, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->execute([
            $data['id'] ?? 'HORUS-' . time(),
            $data['customer']['name'] ?? '',
            $data['customer']['email'] ?? '',
            $data['customer']['phone'] ?? '',
            $data['customer']['whatsapp'] ?? '',
            json_encode($data['items'] ?? []),
            (int)($data['total'] ?? 0),
            $data['payment'] ?? '',
            $data['status'] ?? 'pending',
            $data['address'] ?? '',
            $data['notes'] ?? ''
        ]);
        jsonResponse(['message' => 'Order saved'], 201);
        break;

    case 'PUT':
        $id = $_GET['id'] ?? null;
        if (!$id) jsonResponse(['error' => 'ID required'], 400);
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'] ?? 'pending', $id]);
        jsonResponse(['message' => 'Updated']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
