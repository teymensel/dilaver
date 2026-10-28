<?php
// Q-Codes Data
$q_codes_data = [
    ['code' => 'QRA', 'meaning' => 'İstasyonunuzun ismi nedir? / İstasyonumun ismi ...dir.'],
    ['code' => 'QRB', 'meaning' => 'İstasyonumdan ne kadar uzaktasınız? / İstasyonunuzdan ... km uzaktayım.'],
    ['code' => 'QRD', 'meaning' => 'Nereye gidip nereden geliyorsunuz? / ... gidiyorum, ... den geliyorum.'],
    ['code' => 'QRH', 'meaning' => 'Frekansım değişiyor mu? / Evet, değişiyor.'],
    ['code' => 'QRI', 'meaning' => 'Göndermemin tonu nasıldır? / Göndermenizin tonu: ...'],
    ['code' => 'QRL', 'meaning' => 'Meşgul müsünüz? / Meşgulüm.'],
    ['code' => 'QRM', 'meaning' => 'Göndermemde bir karıştırma var mı? / Göndermeniz: ...'],
    ['code' => 'QRN', 'meaning' => 'Statik gürültüden (parazit) rahatsız oluyor musunuz? / Statik gürültüden rahatsız oluyorum.'],
    ['code' => 'QRO', 'meaning' => 'Verici gücünü artırayım mı? / Verici gücünü artırın.'],
    ['code' => 'QRP', 'meaning' => 'Verici gücünü azaltayım mı? / Verici gücünü azaltın.'],
    ['code' => 'QRQ', 'meaning' => 'Daha hızlı göndereyim mi? / Daha hızlı gönderin (... kelime/dakika).'],
    ['code' => 'QRS', 'meaning' => 'Daha yavaş göndereyim mi? / Daha yavaş gönderin (... kelime/dakika).'],
    ['code' => 'QRT', 'meaning' => 'Göndermeyi keseyim mi? / Göndermeyi kesin.'],
    ['code' => 'QRU', 'meaning' => 'Benim için bir mesajınız var mı? / Sizin için mesajım yok.'],
    ['code' => 'QRV', 'meaning' => 'Hazır mısınız? / Hazırım.'],
    ['code' => 'QRX', 'meaning' => 'Beni ne zaman tekrar çağıracaksınız? / Sizi tekrar saat ...da ... kHz üzerinden çağıracağım.'],
    ['code' => 'QRZ', 'meaning' => 'Beni kim çağırıyor? / Sizi ... çağırıyor.'],
    ['code' => 'QSA', 'meaning' => 'Sinyal gücüm kaçtır? / Sinyal gücünüz ...dir (1-5 arası).'],
    ['code' => 'QSB', 'meaning' => 'Göndermem sönüyor mu? / Göndermeniz sönüyor.'],
    ['code' => 'QSL', 'meaning' => 'Teyit eder misiniz? / Teyit ediyorum.'],
    ['code' => 'QSN', 'meaning' => 'Beni ... frekansında duydunuz mu? / Sizi ... frekansında duydum.'],
    ['code' => 'QSO', 'meaning' => '... ile direkt olarak konuşabilir misiniz? / ... ile direkt olarak konuşabilirim.'],
    ['code' => 'QSP', 'meaning' => '... istasyonuna ücretsiz aracılık yapar mısınız? / ... istasyonuna ücretsiz aracılık yaparım.'],
    ['code' => 'QSW', 'meaning' => 'Bu frekansta (veya ... frekansında) gönderecek misiniz? / Bu frekansta (veya ... frekansında) göndereceğim.'],
    ['code' => 'QSY', 'meaning' => 'Başka frekansa geçeyim mi? / ... frekansına geçin.'],
    ['code' => 'QTH', 'meaning' => 'Mevkiiniz (Konumunuz) nedir? / Mevkiim ...dir.'],
    ['code' => 'QTR', 'meaning' => 'Tam saat kaçtır? / Tam saat ...dır.'],
];
?>

<div class="qcodes-page fade-in container" x-data="qcodesView()">
    <header class="page-header">
        <div>
            <h2 style="font-size: 2.5rem; font-weight: 950; letter-spacing: -1.5px; color: #fff; margin: 0;">Q Kodları</h2>
            <p style="color: var(--text-secondary); margin-top: 4px;">Telsiz Kısaltmaları ve Anlamları</p>
        </div>
    </header>

    <div class="search-bar">
        <i data-lucide="search" class="search-icon"></i>
        <input 
            type="text" 
            placeholder="Kod veya anlam ara..." 
            x-model="searchTerm"
            @input="filterCodes()"
        >
    </div>

    <div class="qcodes-list">
        <template x-for="item in filteredCodes" :key="item.code">
            <div class="qcode-item">
                <div class="qcode-header">
                    <span class="qcode-label" x-text="item.code"></span>
                </div>
                <div class="qcode-meaning" x-text="item.meaning"></div>
            </div>
        </template>
        
        <div x-show="filteredCodes.length === 0" class="no-results" style="display: none;">
            <i data-lucide="info" style="margin-bottom: 12px; opacity: 0.5;"></i>
            <p>Aradığınız kriterlere uygun sonuç bulunamadı.</p>
        </div>
    </div>
</div>

<script>
function qcodesView() {
    return {
        searchTerm: '',
        allCodes: <?php echo json_encode($q_codes_data); ?>,
        filteredCodes: [],

        init() {
            this.filteredCodes = this.allCodes;
            this.$nextTick(() => {
                lucide.createIcons();
            });
        },

        filterCodes() {
            const term = this.searchTerm.toLowerCase();
            this.filteredCodes = this.allCodes.filter(item => 
                item.code.toLowerCase().includes(term) || 
                item.meaning.toLowerCase().includes(term)
            );
            
            // Re-initialize icons if necessary (though not needed for text content)
            this.$nextTick(() => {
                lucide.createIcons();
            });
        }
    }
}
</script>
