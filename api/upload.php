<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

if (!isset($_FILES['file'])) {
    jsonResponse(['error' => 'No file uploaded'], 400);
}

$file = $_FILES['file'];
$allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];

if (!in_array($file['type'], $allowed)) {
    jsonResponse(['error' => 'Invalid file type. Allowed: JPG, PNG, WEBP, GIF, MP4, WEBM'], 400);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = time() . '_' . uniqid() . '.' . $ext;
$uploadDir = __DIR__ . '/../uploads/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$dest = $uploadDir . $filename;
if (!move_uploaded_file($file['tmp_name'], $dest)) {
    jsonResponse(['error' => 'Upload failed'], 500);
}

$url = '/uploads/' . $filename;
jsonResponse(['url' => $url, 'message' => 'Uploaded'], 201);
