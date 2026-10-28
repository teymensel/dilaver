<?php
session_start();
$is_logged_in = isset($_SESSION['user_callsign']) || isset($_SESSION['user_name']);
$display_name = $is_logged_in ? ($_SESSION['user_callsign'] ?? $_SESSION['user_name']) : 'Misafir';
$initials = $is_logged_in ? strtoupper(substr($display_name, 0, 2)) : 'M';
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Dilaver - Profesyonel Amatör Telsiz Sistemi</title>
    <link rel="icon" type="image/png" href="assets/logo.png">
    <link rel="apple-touch-icon" href="assets/logo.png">
    <!-- Google Fonts: Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Alpine.js -->
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <!-- Custom Styles -->
    <link rel="stylesheet" href="assets/css/style.css?v=<?php echo time(); ?>">
</head>
<body>
    <div id="app-layout">
        <?php include_once 'includes/sidebar.php'; ?>
        
        <div id="main-wrapper">
            <!-- Mobile Header (Visible only on mobile/tablet) -->
            <header class="mobile-top-bar">
                <a href="?page=home" class="header-left" style="text-decoration: none; display: flex; align-items: center; gap: 10px;">
                    <img src="assets/logo.png" alt="Dilaver" style="width: 34px; height: 34px; border-radius: 9px; object-fit: cover; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                    <div>
                        <h1 style="font-size: 1.25rem; font-weight: 900; letter-spacing: -0.6px; margin: 0; color: #fff; line-height: 1;">Dilaver</h1>
                        <div class="status-indicator" style="margin-top: 3px;">
                            <div class="status-dot"></div>
                            <span style="font-size: 0.62rem; color: var(--success); font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase;">Sistem Çevrimiçi</span>
                        </div>
                    </div>
                </a>
                
                <div class="profile-section" style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 0.75rem; color: #94a3b8; background: rgba(255,255,255,0.06); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); font-weight: 600;">
                        <?php echo htmlspecialchars($display_name); ?>
                    </span>
                    <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), #5856d6); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; color: #fff; box-shadow: 0 4px 12px rgba(0, 122, 255, 0.25);">
                        <span><?php echo $initials; ?></span>
                    </div>
                </div>
            </header>

            <main id="main-content">
