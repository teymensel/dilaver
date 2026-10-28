<div x-data="repeatersPage" x-init="load()" class="repeaters-page fade-in">
    <header class="page-header">
        <div>
            <h2>Röle & Frekanslar</h2>
            <p>Telsiz Röle Frekans ve Ton Listesi (Canlı Kaynak)</p>
        </div>
        <a href="index.php" class="call-sign-badge" style="text-decoration: none;">Geri Dön</a>
    </header>

    <div class="repeaters-toolbar" style="display: flex; gap: 12px; margin-bottom: 24px;">
        <div class="search-bar glass" style="flex: 1; display: flex; align-items: center; padding: 0 16px; border-radius: 16px;">
            <i data-lucide="search" style="width: 20px; height: 20px; opacity: 0.5; margin-right: 12px;"></i>
            <input type="text" placeholder="Şehir, konum veya frekans ara..." x-model="search" 
                   style="background: none; border: none; color: #fff; flex: 1; padding: 14px 0; outline: none; font-size: 1rem;">
        </div>
        <button class="call-sign-badge" @click="load()" :disabled="loading" style="padding: 0 20px; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="refresh-cw" :class="loading ? 'spin' : ''" style="width: 18px; height: 18px;"></i>
            <span class="hide-mobile">Yenile</span>
        </button>
    </div>

    <!-- Stats summary matching React logic if needed, but keeping it clean for now -->
    
    <div x-show="loading" style="text-align: center; padding: 60px;">
        <div class="pulse" style="width: 50px; height: 50px; background: var(--primary); border-radius: 50%; margin: 0 auto; opacity: 0.6;"></div>
        <p style="margin-top: 16px; opacity: 0.5; font-size: 0.9rem;">Canlı veriler güncelleniyor...</p>
    </div>

    <div class="repeater-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;">
        <template x-for="(item, index) in filtered" :key="index">
            <div class="repeater-card glass" style="padding: 24px; border-radius: 24px; display: flex; flex-direction: column; gap: 16px; transition: all 0.3s ease;">
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="map-pin" style="width: 16px; height: 16px; color: var(--primary);"></i>
                        <span style="font-weight: 800; font-size: 1.1rem; letter-spacing: -0.5px;" x-text="item.city"></span>
                    </div>
                    <span class="status-badge" :style="getStatusStyle(item.status)" x-text="item.status"></span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: rgba(255,255,255,0.03); padding: 16px; border-radius: 16px;">
                    <div>
                        <div style="font-size: 0.75rem; opacity: 0.5; margin-bottom: 2px;">Frekans</div>
                        <div style="font-weight: 800; font-size: 1.2rem; color: var(--primary);" x-text="item.frequency"></div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; opacity: 0.5; margin-bottom: 2px;">Ton / SQL</div>
                        <div style="font-weight: 700;" x-text="item.tone || item.sql || '-'"></div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; opacity: 0.5; margin-bottom: 2px;">Bant</div>
                        <div style="font-weight: 700;" x-text="item.band"></div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; opacity: 0.5; margin-bottom: 2px;">Konum</div>
                        <div style="font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="item.location" x-text="item.location"></div>
                    </div>
                </div>

                <!-- Advanced Details -->
                <div x-show="expanded === index" x-collapse x-cloak style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.85rem;">
                    <template x-for="detail in getDetails(item)">
                        <div>
                            <span style="opacity: 0.5;" x-text="detail.label + ': '"></span>
                            <span style="font-weight: 600;" x-text="detail.value"></span>
                        </div>
                    </template>
                </div>

                <button class="call-sign-badge" style="width: 100%; justify-content: center; font-size: 0.85rem; border-color: rgba(255,255,255,0.05);" 
                        @click="expanded = (expanded === index ? -1 : index)">
                    <span x-text="expanded === index ? 'Detayları Gizle' : 'Detayları Gör'"></span>
                    <i data-lucide="chevron-down" style="width: 16px; height: 16px; margin-left: 6px; transition: transform 0.3s;" :style="expanded === index ? 'transform: rotate(180deg)' : ''"></i>
                </button>
            </div>
        </template>
    </div>

    <template x-if="filtered.length === 0 && !loading">
        <div class="empty-state glass" style="padding: 80px; text-align: center; border-radius: 32px; margin-top: 20px;">
            <i data-lucide="wifi-off" style="width: 48px; height: 48px; margin: 0 auto 16px; opacity: 0.2;"></i>
            <h3 style="opacity: 0.8;">Sonuç bulunamadı</h3>
            <p style="opacity: 0.4; font-size: 0.9rem; margin-top: 8px;">Farklı bir arama terimi deneyebilir veya listeyi yenileyebilirsiniz.</p>
        </div>
    </template>
</div>

<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('repeatersPage', () => ({
        search: '',
        loading: false,
        expanded: -1,
        list: [],
        get filtered() {
            if (!this.search) return this.list;
            const s = this.search.toLowerCase();
            return this.list.filter(i => 
                i.city.toLowerCase().includes(s) || 
                i.location.toLowerCase().includes(s) ||
                i.frequency.includes(s) ||
                i.band.toLowerCase().includes(s)
            );
        },
        async load() {
            this.loading = true;
            this.expanded = -1;
            try {
                const response = await fetch('api/repeaters.php');
                const data = await response.json();
                if (Array.isArray(data)) {
                    this.list = data;
                } else if (data.error) {
                    alert(data.error);
                }
            } catch (e) { 
                console.error("API Error", e);
                // Fallback to local data if needed, but we want live
            } finally { 
                this.loading = false; 
                setTimeout(() => lucide.createIcons(), 50);
            }
        },
        getStatusStyle(status) {
            if (!status) return '';
            const s = status.toLowerCase();
            if (s.includes('çalışıyor')) return 'background: rgba(52, 199, 89, 0.1); color: #34c759; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;';
            if (s.includes('çalışmıyor')) return 'background: rgba(255, 69, 58, 0.1); color: #ff453a; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;';
            return 'background: rgba(255, 179, 64, 0.1); color: #ffb340; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;';
        },
        getDetails(item) {
            return [
                { label: 'TA Bölge', value: item.taRegion },
                { label: 'Coğrafi', value: item.geoRegion },
                { label: 'Yükseklik', value: item.altitude },
                { label: 'Güç', value: item.power },
                { label: 'Kanal', value: item.channel },
                { label: 'Ruhsat', value: item.license },
                { label: 'Locator', value: item.locator },
                { label: 'Güncelleme', value: item.updatedAt }
            ];
        }
    }));
});
</script>
