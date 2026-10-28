<?php
$is_logged_in = isset($_SESSION['user_callsign']) || isset($_SESSION['user_name']);
$user_title = $is_logged_in ? ($_SESSION['user_callsign'] ?? $_SESSION['user_name']) : "Misafir Operatör";
?>
<div class="home-page fade-in" x-data="homeView()">
    <!-- Hero Brand Card -->
    <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 24px; margin-bottom: 24px; position: relative; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.35);">
        <div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap;">
            <div style="width: 68px; height: 68px; border-radius: 18px; overflow: hidden; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 8px 24px rgba(0, 122, 255, 0.25); flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                <img src="assets/logo.png" alt="Dilaver" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="flex: 1; min-width: 220px;">
                <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 3px 10px; border-radius: 8px; margin-bottom: 6px;">
                    <i data-lucide="sparkles" style="width: 13px; height: 13px;"></i>
                    <span>Profesyonel Amatör Telsiz Sistemi</span>
                </div>
                <h2 style="font-size: 1.8rem; font-weight: 900; letter-spacing: -0.8px; margin: 0 0 6px 0; color: #fff; line-height: 1.1;">
                    Hoş Geldiniz, <span style="background: linear-gradient(135deg, #007AFF, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"><?php echo htmlspecialchars($user_title); ?></span>
                </h2>
                <p style="font-size: 0.88rem; color: #94a3b8; margin: 0; line-height: 1.4;">
                    Giriş yapma zorunluluğu olmadan tüm sınav sorularını, mors eğitimini, röleleri ve sorgulama araçlarını serbestçe kullanabilirsiniz.
                </p>
            </div>
        </div>
    </div>

    <!-- Quick Stats -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 24px;">
        <a href="?page=exams" style="text-decoration: none; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 14px 10px; border-radius: 14px; text-align: center; display: block; transition: all 0.2s;">
            <div style="font-size: 1.3rem; font-weight: 900; color: #007AFF;">730+</div>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">Sınav Sorusu</div>
        </a>
        <a href="?page=repeaters" style="text-decoration: none; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 14px 10px; border-radius: 14px; text-align: center; display: block; transition: all 0.2s;">
            <div style="font-size: 1.3rem; font-weight: 900; color: #30B0C7;">Canlı</div>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">Röle Frekansları</div>
        </a>
        <a href="?page=morse" style="text-decoration: none; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 14px 10px; border-radius: 14px; text-align: center; display: block; transition: all 0.2s;">
            <div style="font-size: 1.3rem; font-weight: 900; color: #AF52DE;">Sesli</div>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">Mors Pratik</div>
        </a>
    </div>

    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
        <h3 style="font-size: 1.05rem; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.3px;">Operasyon & Eğitim Modülleri</h3>
        <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.12); padding: 2px 8px; border-radius: 6px;">Tam Erişim Açık</span>
    </div>

    <!-- Home Menu Grid -->
    <div class="home-menu-wrapper">
        <template x-for="item in menuItems" :key="item.id">
            <a :href="'?page=' + item.id" class="list-item">
                <div class="item-icon" :style="`background-color: ${item.color}18; color: ${item.color}`">
                    <i :data-lucide="item.icon" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="item-content">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <h3 x-text="item.title" style="margin: 0; font-size: 0.95rem; font-weight: 700;"></h3>
                        <template x-if="item.badge">
                            <span :style="`font-size: 0.65rem; font-weight: 700; padding: 1px 6px; border-radius: 6px; background-color: ${item.color}25; color: ${item.color}`" x-text="item.badge"></span>
                        </template>
                    </div>
                    <p x-text="item.subtitle" style="margin: 2px 0 0 0; font-size: 0.78rem; color: #94a3b8;"></p>
                </div>
                <i data-lucide="chevron-right" style="width: 20px; height: 20px; opacity: 0.3; color: #fff;"></i>
            </a>
        </template>
    </div>
</div>

<script>
function homeView() {
    return {
        menuItems: [
            { id: 'exams', title: 'Sınav Hazırlık ve Sorular', subtitle: 'Amatör Telsizcilik güncel soru bankası', icon: 'graduation-cap', color: '#AF52DE', badge: 'Popüler' },
            { id: 'exam-simulation', title: 'Sınav Simülasyonu', subtitle: 'Gerçek zamanlı deneme ve puanlama', icon: 'radio-tower', color: '#FF2D55', badge: 'Yeni' },
            { id: 'exam-guide', title: 'Sınav Başvuru & Bilgi', subtitle: 'Kıyı Emniyeti başvuru adımları ve mevzuat', icon: 'clipboard-list', color: '#FF9500' },
            { id: 'morse', title: 'Mors Alfabesi & Sesli Pratik', subtitle: 'Sesli dinleme, kod çözücü ve pratik', icon: 'radio', color: '#007AFF' },
            { id: 'qcodes', title: 'Q-Kodları & Kısaltmalar', subtitle: 'Standart haberleşme terimleri ve fonetik alfabe', icon: 'message-square', color: '#5856D6' },
            { id: 'directory', title: 'Sorgulama Merkezi', subtitle: 'Çağrı İşareti, DMR ID ve APRS sorgu', icon: 'search', color: '#34C759' },
            { id: 'repeaters', title: 'Röle & Frekanslar', subtitle: 'Türkiye VHF/UHF röle haritası ve tonlar', icon: 'wifi', color: '#30B0C7' },
            { id: 'cevrim', title: 'Çevrim (Net) Operasyon Modu', subtitle: 'Afet ve tatbikat canlı çevrim kayıt masası', icon: 'activity', color: '#00C7BE' },
            { id: 'logbook', title: 'Elektronik Kayıt Defteri', subtitle: 'QSO görüşme geçmişi ve kayıt arşivi', icon: 'book-open', color: '#E056FD' }
        ],
        init() {
            this.$nextTick(() => {
                if (window.lucide) {
                    lucide.createIcons();
                }
            });
        }
    }
}
</script>
