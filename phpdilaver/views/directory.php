<div x-data="directoryController()" class="directory-page fade-in">
    <header class="page-header">
        <div class="header-top" style="display: flex; align-items: center; gap: 16px;">
            <a href="?page=home" class="back-button" style="padding: 10px; border-radius: 12px; background: rgba(255,255,255,0.05); color: #fff;">
                <i data-lucide="arrow-left" style="width: 24px;"></i>
            </a>
            <h2 style="font-size: 2.2rem; font-weight: 950; letter-spacing: -1px; color: #fff; margin: 0;">Sorgulama Merkezi <span class="beta-tag">BETA</span></h2>
        </div>
        <p style="color: var(--text-secondary); margin-top: 6px; font-weight: 500;">Çağrı İşareti, DMR ID, NXDN ve APRS Sorgulama Merkezi</p>
        
        <div class="beta-warning glass" style="margin-top: 16px; border-radius: 12px; padding: 10px 16px;">
            <i data-lucide="info" style="width: 16px;"></i>
            <span>Sistem henüz beta aşamasındadır, bazı sorgular gecikmeli çalışabilir veya sonuç vermeyebilir.</span>
        </div>
    </header>

    <div class="search-container glass" style="margin-top: 32px;">
        <div class="search-form">
            <div class="search-type-selector overflow-x">
                <button type="button" class="type-btn" :class="searchType === 'callsign' ? 'active' : ''" @click="setSearchType('callsign')">Çağrı İşareti</button>
                <button type="button" class="type-btn" :class="searchType === 'dmrid' ? 'active' : ''" @click="setSearchType('dmrid')">DMR ID</button>
                <button type="button" class="type-btn" :class="searchType === 'nxdn' ? 'active' : ''" @click="setSearchType('nxdn')">NXDN ID</button>
                <button type="button" class="type-btn" :class="searchType === 'aprs' ? 'active' : ''" @click="setSearchType('aprs')">APRS / AIS</button>
                <button type="button" class="type-btn" :class="searchType === 'address' ? 'active' : ''" @click="setSearchType('address')">Adres / Konum</button>
            </div>

            <div class="api-notice glass">
                <i data-lucide="info" style="width: 20px; color: var(--primary);"></i>
                <p><strong>Bilgi:</strong> RadioID ve BrandMeister verileri harici servislerden anlık alınmaktadır. Yoğunluk durumunda gecikme yaşanabilir.</p>
            </div>

            <div class="search-input-wrapper">
                <div class="input-icon">
                    <template x-if="searchType === 'callsign'"><i data-lucide="globe"></i></template>
                    <template x-if="['dmrid', 'nxdn'].includes(searchType)"><i data-lucide="database"></i></template>
                    <template x-if="searchType === 'aprs'"><i data-lucide="wifi"></i></template>
                    <template x-if="searchType === 'address'"><i data-lucide="map-pin"></i></template>
                </div>
                <input 
                    type="text" 
                    x-model="query" 
                    :placeholder="getPlaceholder()"
                    @keyup.enter="handleSearch"
                    @input="onInput"
                    class="search-input">
                
                <button class="search-submit-btn" @click="handleSearch" :disabled="loading">
                    <template x-if="!loading"><i data-lucide="search"></i></template>
                    <template x-if="loading"><div class="spinner"></div></template>
                </button>
            </div>
        </div>
    </div>

    <!-- Error View -->
    <template x-if="error">
        <div class="error-card glass fade-in" style="margin-top: 24px;">
            <i data-lucide="alert-circle" style="width: 32px; color: var(--error);"></i>
            <p x-text="error" style="font-weight: 600;"></p>
            <div class="fallback-actions">
                <button class="action-btn" @click="openExternalSearch">
                    Dış Kaynakta Ara <i data-lucide="external-link" style="width: 14px;"></i>
                </button>
            </div>
        </div>
    </template>

    <!-- Results List -->
    <div class="results-container" style="margin-top: 32px;">
        <template x-for="(user, idx) in results" :key="idx">
            <div class="result-card glass fade-in">
                <div class="result-header">
                    <div class="user-icon"><i data-lucide="user"></i></div>
                    <div class="callsign-info">
                        <span class="label">İstasyon / Çağrı İşareti</span>
                        <h3 class="callsign" x-text="user.callsign"></h3>
                        <template x-if="user.brandmeister?.active">
                            <span class="badge-bm active">BM Aktif</span>
                        </template>
                    </div>
                    <div class="id-info-group">
                        <template x-if="user.dmr_id">
                            <div class="id-info-item">
                                <span class="label">DMR ID</span>
                                <h3 class="dmr-id" x-text="user.dmr_id"></h3>
                            </div>
                        </template>
                        <template x-if="user.nxdn_id">
                            <div class="id-info-item">
                                <span class="label">NXDN ID</span>
                                <h3 class="nxdn-id" x-text="user.nxdn_id"></h3>
                            </div>
                        </template>
                    </div>
                </div>
                <div class="result-body">
                    <div class="info-item">
                        <i data-lucide="user" style="width: 16px;"></i>
                        <span x-text="user.name"></span>
                        <template x-if="user.remarks">
                            <small class="remarks-inline" x-text="'(' + user.remarks + ')'"></small>
                        </template>
                    </div>
                    <div class="info-item">
                        <i data-lucide="map-pin" style="width: 16px;"></i>
                        <span x-text="[user.city, user.state, user.country].filter(Boolean).join(', ')"></span>
                    </div>
                    <template x-if="user.brandmeister">
                        <div class="info-item bm-info">
                            <i data-lucide="wifi" style="width: 16px;"></i>
                            <span>BM Master: <span x-text="user.brandmeister.master || 'Network'"></span> 
                                <small class="last-seen" x-text="'(' + user.brandmeister.last_seen + ')'"></small>
                            </span>
                        </div>
                    </template>
                </div>
                <div class="result-actions">
                    <button class="action-btn aprs" @click="openAPRS(user.callsign)">
                        <i data-lucide="wifi" style="width: 16px;"></i>
                        <span>Canlı Takip</span>
                        <i data-lucide="external-link" style="width: 12px;"></i>
                    </button>
                </div>
            </div>
        </template>

        <!-- APRS Results -->
        <template x-for="(entry, idx) in aprsResults" :key="'aprs-' + idx">
            <div class="result-card glass fade-in aprs-card" style="border-left: 4px solid #34c759;">
                <div class="result-header">
                    <div class="user-icon aprs" style="background: rgba(52, 199, 89, 0.15); color: #34c759;">
                        <i data-lucide="map-pin"></i>
                    </div>
                    <div class="callsign-info">
                        <span class="label" x-text="entry.type === 'a' ? 'AIS (Gemi)' : 'APRS (İstasyon)'"></span>
                        <h3 class="callsign" x-text="entry.name"></h3>
                    </div>
                    <div class="symbol-info">
                        <span class="label">Sembol</span>
                        <div class="symbol-box" x-text="entry.symbol"></div>
                    </div>
                </div>
                <div class="result-body grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="info-item">
                        <i data-lucide="globe" style="width: 16px;"></i>
                        <div class="val-group">
                            <span class="v-label">Konum</span>
                            <span x-text="entry.lat + ', ' + entry.lng"></span>
                        </div>
                    </div>
                    <div class="info-item">
                        <i data-lucide="wifi" style="width: 16px;"></i>
                        <div class="val-group">
                            <span class="v-label">Hız</span>
                            <span x-text="(entry.speed || 0) + ' km/h'"></span>
                        </div>
                    </div>
                    <div class="info-item">
                        <i data-lucide="info" style="width: 16px;"></i>
                        <div class="val-group">
                            <span class="v-label">Son Rapor</span>
                            <span x-text="formatTime(entry.lasttime)"></span>
                        </div>
                    </div>
                    <template x-if="entry.comment">
                        <div class="info-item full remarks" style="grid-column: 1 / -1;">
                            <i data-lucide="message-square" style="width: 16px;"></i>
                            <span x-text="entry.comment"></span>
                        </div>
                    </template>
                </div>
                <div class="result-actions" style="margin-top: 16px;">
                    <button class="action-btn map" @click="openAPRS(entry.name, entry.type)" style="color: var(--primary); border-color: rgba(0, 122, 255, 0.2);">
                        <i data-lucide="map-pin" style="width: 16px;"></i>
                        <span>Haritada Gör</span>
                        <i data-lucide="external-link" style="width: 12px;"></i>
                    </button>
                </div>
            </div>
        </template>
    </div>

    <!-- Empty State -->
    <template x-if="!loading && !results.length && !aprsResults.length && !error">
        <div class="empty-state" style="padding: 100px 0;">
            <div class="empty-icon glass" style="width: 120px; height: 120px; border-radius: 40px; margin-bottom: 24px;">
                <i data-lucide="search" style="width: 48px; color: var(--text-secondary);"></i>
            </div>
            <p style="font-size: 1.1rem; color: var(--text-secondary); font-weight: 500;">Çağrı işareti veya ID girerek sorgulama yapın.</p>
        </div>
    </template>
</div>

<script>
function directoryController() {
    return {
        searchType: 'callsign',
        query: '',
        results: [],
        aprsResults: [],
        loading: false,
        error: null,
        aprsApiKey: '225710.9xI9UG4DDFVhT',

        setSearchType(type) {
            this.searchType = type;
            this.query = '';
            this.results = [];
            this.aprsResults = [];
            this.error = null;
        },

        getPlaceholder() {
            const placeholders = {
                callsign: 'Örn: TA1ACM',
                dmrid: 'DMR ID girin...',
                nxdn: 'NXDN ID girin...',
                aprs: 'İşaret veya MMSI...',
                address: 'Şehir veya Adres...'
            };
            return placeholders[this.searchType];
        },

        onInput(e) {
            if (['callsign', 'aprs'].includes(this.searchType)) {
                this.query = this.query.toUpperCase();
            }
        },

        async fetchWithFallback(url) {
            const cacheBuster = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
            const proxies = [
                `https://api.allorigins.win/get?url=${encodeURIComponent(cacheBuster)}`,
                `https://corsproxy.io/?url=${encodeURIComponent(cacheBuster)}`,
                `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(cacheBuster)}`
            ];

            for (const proxy of proxies) {
                try {
                    const response = await fetch(proxy);
                    if (response.ok) {
                        const data = await response.json();
                        let contents = data.contents || data;
                        if (typeof contents === 'string') {
                            try { contents = JSON.parse(contents); } catch(e) {}
                        }
                        return contents;
                    }
                } catch (err) {
                    console.warn(`Proxy failed: ${proxy}`, err);
                }
            }
            throw new Error('Sorgulama servislerine şu an ulaşılamıyor.');
        },

        async handleSearch() {
            if (!this.query) return;

            if (this.searchType === 'address') {
                this.openAPRS(this.query, 'addr');
                return;
            }

            this.loading = true;
            this.error = null;
            this.results = [];
            this.aprsResults = [];

            try {
                if (this.searchType === 'aprs') {
                    const data = await this.fetchWithFallback(`https://api.aprs.fi/api/get?name=${this.query.toUpperCase()}&what=loc&apikey=${this.aprsApiKey}&format=json`);
                    if (data.result === 'ok' && data.entries?.length > 0) {
                        this.aprsResults = data.entries;
                    } else {
                        throw new Error('İstasyon bulunamadı.');
                    }
                } 
                else if (this.searchType === 'callsign') {
                    const q = this.query.toUpperCase();
                    // Sequential for reliability with proxies
                    const merged = [];
                    
                    try {
                        const dmr = await this.fetchWithFallback(`https://radioid.net/api/dmr/user/?callsign=${q}`);
                        if (dmr.results) dmr.results.forEach(u => merged.push({...u, dmr_id: u.id}));
                    } catch(e) {}

                    try {
                        const nxdn = await this.fetchWithFallback(`https://radioid.net/api/nxdn/user/?callsign=${q}`);
                        if (nxdn.results) nxdn.results.forEach(n => {
                            const existing = merged.find(m => m.callsign === n.callsign);
                            if (existing) existing.nxdn_id = n.id;
                            else merged.push({...n, nxdn_id: n.id});
                        });
                    } catch(e) {}

                    try {
                        const bm = await this.fetchWithFallback(`https://api.brandmeister.network/v2/user/get/${q}`);
                        if (bm && bm.callsign) {
                            const existing = merged.find(m => m.callsign === bm.callsign);
                            const bmInfo = { active: !!bm.last_seen, last_seen: bm.last_seen || '-', master: bm.master_name };
                            if (existing) existing.brandmeister = bmInfo;
                            else merged.push({ id: 0, callsign: bm.callsign, name: bm.name, city: '', state: '', country: '', brandmeister: bmInfo });
                        }
                    } catch(e) {}

                    if (merged.length > 0) this.results = merged;
                    else throw new Error('Sonuç bulunamadı.');
                }
                else if (this.searchType === 'dmrid') {
                    const data = await this.fetchWithFallback(`https://radioid.net/api/dmr/user/?id=${this.query}`);
                    if (data.results) this.results = data.results.map(u => ({...u, dmr_id: u.id}));
                    else throw new Error('DMR ID bulunamadı.');
                }
                else if (this.searchType === 'nxdn') {
                    const data = await this.fetchWithFallback(`https://radioid.net/api/nxdn/user/?id=${this.query}`);
                    if (data.results) this.results = data.results.map(n => ({...n, nxdn_id: n.id}));
                    else throw new Error('NXDN ID bulunamadı.');
                }
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
                this.$nextTick(() => lucide.createIcons());
            }
        },

        openAPRS(target, type = 'a') {
            let url = `https://aprs.fi/#!`;
            if (type === 'addr') url += `addr=${encodeURIComponent(target)}`;
            else url += `call=${type}%2F${target}`;
            url += `&tail=3600&timerange=86400`;
            window.open(url, '_blank');
        },

        openExternalSearch() {
            window.open(`https://aprs.fi/#!call=a%2F${this.query}`, '_blank');
        },

        formatTime(ts) {
            if (!ts) return '-';
            const date = new Date(parseInt(ts) * 1000);
            return date.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        }
    };
}
</script>
