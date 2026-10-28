<?php
/**
 * Dilaver PHP - Merkezi Giriş Noktası (Router)
 */

$page = isset($_GET['page']) ? $_GET['page'] : 'home';

// Güvenli sayfa listesi
$allowed_pages = ['home', 'morse', 'morse-training', 'qcodes', 'directory', 'repeaters', 'logbook', 'exams', 'exam-simulation', 'exam-guide', 'cevrim', 'privacy'];

if (!in_array($page, $allowed_pages)) {
    $page = 'home';
}

require_once 'includes/header.php';

$view_path = "views/{$page}.php";
if (file_exists($view_path)) {
    require_once $view_path;
} else {
    echo "<h2>404 - Sayfa Bulunamadı</h2>";
}

require_once 'includes/footer.php';
