<?php
$current_page = isset($_GET['page']) ? $_GET['page'] : 'home';
$is_logged_in = isset($_SESSION['user_callsign']) || isset($_SESSION['user_name']);
$display_name = $is_logged_in ? ($_SESSION['user_callsign'] ?? $_SESSION['user_name']) : 'Misafir Operatör';
$display_sub = $is_logged_in ? 'Kayıtlı Profil' : 'Doğrudan Kullanım Modu';
$initials = $is_logged_in ? strtoupper(substr($display_name, 0, 2)) : 'MO';
?>
<aside class="sidebar">
    <a href="?page=home" style="display: flex; align-items: center; gap: 12px; text-decoration: none; padding: 0 8px; margin-bottom: 24px;">
        <img src="assets/logo.png" alt="Dilaver" style="width: 42px; height: 42px; border-radius: 12px; object-fit: cover; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);">
        <div>
            <h1 style="font-size: 1.45rem; font-weight: 900; letter-spacing: -0.8px; margin: 0; color: #fff; line-height: 1;">Dilaver</h1>
            <span style="font-size: 0.68rem; color: #38bdf8; font-weight: 700; letter-spacing: 0.3px;">TELSİZ SİSTEMİ</span>
        </div>
    </a>

    <nav class="sidebar-nav">
        <a href="?page=home" class="sidebar-item <?php echo $current_page == 'home' ? 'active' : ''; ?>">
            <i data-lucide="home"></i>
            <span>Ana Sayfa</span>
        </a>
        <a href="?page=exams" class="sidebar-item <?php echo $current_page == 'exams' ? 'active' : ''; ?>">
            <i data-lucide="graduation-cap"></i>
            <span>Sınav Hazırlık</span>
        </a>
        <a href="?page=exam-simulation" class="sidebar-item <?php echo $current_page == 'exam-simulation' ? 'active' : ''; ?>">
            <i data-lucide="radio-tower"></i>
            <span>Sınav Simülasyonu</span>
        </a>
        <a href="?page=exam-guide" class="sidebar-item <?php echo $current_page == 'exam-guide' ? 'active' : ''; ?>">
            <i data-lucide="clipboard-list"></i>
            <span>Sınav Başvuru & Rehber</span>
        </a>
        <a href="?page=morse" class="sidebar-item <?php echo $current_page == 'morse' ? 'active' : ''; ?>">
            <i data-lucide="zap"></i>
            <span>Mors Alfabesi</span>
        </a>
        <a href="?page=qcodes" class="sidebar-item <?php echo $current_page == 'qcodes' ? 'active' : ''; ?>">
            <i data-lucide="message-square"></i>
            <span>Q-Kodları & Kısaltmalar</span>
        </a>
        <a href="?page=directory" class="sidebar-item <?php echo $current_page == 'directory' ? 'active' : ''; ?>">
            <i data-lucide="search"></i>
            <span>Sorgulama Merkezi</span>
        </a>
        <a href="?page=repeaters" class="sidebar-item <?php echo $current_page == 'repeaters' ? 'active' : ''; ?>">
            <i data-lucide="wifi"></i>
            <span>Röle & Frekanslar</span>
        </a>
        <a href="?page=cevrim" class="sidebar-item <?php echo $current_page == 'cevrim' ? 'active' : ''; ?>">
            <i data-lucide="activity"></i>
            <span>Çevrim (Net) Modu</span>
        </a>
        <a href="?page=logbook" class="sidebar-item <?php echo $current_page == 'logbook' ? 'active' : ''; ?>">
            <i data-lucide="book-open"></i>
            <span>Kayıt Defteri</span>
        </a>
    </nav>

    <!-- Sidebar Profile Bar -->
    <div style="margin-top: auto; margin-bottom: 24px; padding: 12px 14px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s;">
        <div style="width: 36px; height: 36px; min-width: 36px; border-radius: 10px; background: linear-gradient(135deg, <?php echo $is_logged_in ? '#007aff, #5856d6' : '#64748b, #475569'; ?>); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; color: #fff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);">
            <span><?php echo $initials; ?></span>
        </div>
        <div style="overflow: hidden; flex: 1;">
            <p style="font-size: 0.85rem; font-weight: 800; color: #fff; margin: 0; letter-spacing: 0.2px;"><?php echo htmlspecialchars($display_name); ?></p>
            <p style="font-size: 0.68rem; color: #94a3b8; margin: 0; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;"><?php echo htmlspecialchars($display_sub); ?></p>
        </div>
    </div>
</aside>
