<div class="exams-page fade-in container">
    <header class="page-header" style="margin-bottom: 40px;">
        <h2 style="font-size: 2.5rem; font-weight: 950; letter-spacing: -1.5px; color: #fff; margin: 0;">Sınav Merkezi</h2>
    </header>

    <div class="exams-section-wrapper">
        <span class="exams-section-label">Sınav Hazırlık & Soru Bankası</span>
        
        <div class="exam-grid-container" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
            <!-- MEB GUIDE -->
            <div class="exam-box-card" style="background: rgba(255, 255, 255, 0.04); border-bottom: 3px solid #007aff;" @click="window.location.href = '?page=exam-guide'">
                <i data-lucide="graduation-cap" class="exam-box-icon" style="color: #007aff;"></i>
                <h3 class="exam-box-title">Sınav Başvuru Rehberi</h3>
                <p class="exam-box-desc">Sınav süreci, ücretler ve başvuru adımları.</p>
                <i data-lucide="chevron-right" class="exam-box-chevron" style="width: 16px;"></i>
            </div>

            <!-- İŞLETME -->
            <div class="exam-box-card box-isletme" @click="window.location.href = '?page=exam-simulation&category=isletme'">
                <i data-lucide="radio" class="exam-box-icon"></i>
                <h3 class="exam-box-title">İşletme Soru Bankası</h3>
                <p class="exam-box-desc">Haberleşme usülleri ve işletme kuralları.</p>
                <i data-lucide="chevron-right" class="exam-box-chevron" style="width: 16px;"></i>
            </div>

            <!-- TEKNİK -->
            <div class="exam-box-card box-teknik" @click="window.location.href = '?page=exam-simulation&category=teknik'">
                <i data-lucide="cpu" class="exam-box-icon"></i>
                <h3 class="exam-box-title">Teknik Soru Bankası</h3>
                <p class="exam-box-desc">Elektronik ve teknik telsiz bilgisi.</p>
                <i data-lucide="chevron-right" class="exam-box-chevron" style="width: 16px;"></i>
            </div>

            <!-- MEVZUAT -->
            <div class="exam-box-card box-yonetmelik" @click="window.location.href = '?page=exam-simulation&category=yonetmelik'">
                <i data-lucide="clipboard-list" class="exam-box-icon"></i>
                <h3 class="exam-box-title">Kanun & Yönetmelik</h3>
                <p class="exam-box-desc">Milli ve milletlerarası düzenlemeler.</p>
                <i data-lucide="chevron-right" class="exam-box-chevron" style="width: 16px;"></i>
            </div>

            <!-- DENEME -->
            <div class="exam-box-card box-deneme" @click="window.location.href = '?page=exam-simulation&category=all'">
                <i data-lucide="zap" class="exam-box-icon"></i>
                <h3 class="exam-box-title">Deneme Sınavı</h3>
                <p class="exam-box-desc">Karışık 50 soruluk tam simülasyon.</p>
                <i data-lucide="chevron-right" class="exam-box-chevron" style="width: 16px;"></i>
            </div>
        </div>

        <div class="exam-info-alert">
            <i data-lucide="alert-triangle" style="width: 18px; color: #f59e0b; flex-shrink: 0; margin-top: 2px;"></i>
            <p>
                <span>Bilgi:</span> Sınav başvuru rehberindeki ücretler ve tarihler KEGM/MEB tarafından güncellenebilir. Lütfen başvurudan önce rehberi dikkatlice okuyunuz.
            </p>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        lucide.createIcons();
    });
</script>
