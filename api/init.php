<?php
require_once __DIR__ . '/config.php';

$pdo = getDB();

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

// Insert default products if table is empty
$count = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
if ($count == 0) {
    $defaults = [
        ['p1', 'Yoshi Bleach', 'Bleach Art', 125000, 29.90, '☠️', 'bleach', 1, 'Camiseta decolorada con cloro. Diseño de Yoshi. Efecto único.'],
        ['p2', 'Super Mario Bleach', 'Bleach Art', 125000, 29.90, '🍄', 'bleach', 1, 'Mario Bros en bleach art. Diseño artesanal sobre tela negra.'],
        ['p3', 'Tie Dye Psicodélico', 'Tie Dye', 146000, 34.90, '🌈', 'tiedye', 0, 'Patrón psicodélico teñido a mano. Cada pieza es única.'],
        ['p4', 'Dragon Ball Pintado', 'Pintura Textil', 167000, 39.90, '🐉', 'pintura', 1, 'Goku pintado a mano con pintura textil profesional.'],
        ['p5', 'Skull Bleach', 'Bleach Art', 125000, 29.90, '💀', 'bleach', 0, 'Calavera en bleach art. Estilo rockero y agresivo.'],
        ['p6', 'Floral Tie Dye', 'Tie Dye', 146000, 34.90, '🌸', 'tiedye', 0, 'Patrón floral en tie dye. Colores vibrantes.'],
        ['p7', 'Anime Custom', 'Pintura Textil', 188000, 44.90, '🎭', 'pintura', 0, 'Tu personaje anime favorito pintado a mano.'],
        ['p8', 'Logo Personalizado', 'Personalizado', 104000, 24.90, '✨', 'personalizado', 0, 'Tu logo o marca personalizada sobre camiseta.'],
        ['p9', 'Zelda Bleach', 'Bleach Art', 138000, 32.90, '⚔️', 'bleach', 0, 'Legend of Zelda en bleach art. Trifuerza incluida.'],
        ['p10', 'Retrowave Tie Dye', 'Tie Dye', 155000, 36.90, '🌴', 'tiedye', 0, 'Estilo retrowave ochentero en tie dye.'],
        ['p11', 'One Piece Pintado', 'Pintura Textil', 188000, 44.90, '☠️', 'pintura', 1, 'One Piece pintado a mano. Straw Hat crew.'],
        ['p12', 'Tu Diseño', 'Personalizado', 104000, 24.90, '✨', 'personalizado', 0, 'Cualquier idea que tengas. La hacemos realidad.']
    ];
    $stmt = $pdo->prepare("INSERT INTO products (id, name, type, price, priceEUR, image, category, popular, description) VALUES (?,?,?,?,?,?,?,?,?)");
    foreach ($defaults as $d) {
        $stmt->execute($d);
    }
}

echo json_encode(['status' => 'ok', 'message' => 'Database initialized with ' . $count . ' existing products']);
