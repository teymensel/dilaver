<div class="logbook-page fade-in container" x-data="logbookView()">
    <header class="page-header" style="align-items: center; justify-content: space-between;">
        <div class="header-info">
            <h2 style="font-size: 2.5rem; font-weight: 950; letter-spacing: -1.5px; color: #fff; margin: 0;">Kayıt Defteri</h2>
            <p style="color: var(--text-secondary); margin-top: 4px;">Haberleşme trafiği ve temas kayıtları</p>
        </div>
        <div class="header-actions">
            <label class="action-btn secondary upload-label" style="position: relative; overflow: hidden;">
                <i data-lucide="upload" style="width: 18px;"></i>
                İçe Aktar
                <input type="file" accept=".json" @change="handleImport" style="position: absolute; top: 0; left: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;">
            </label>
            <button class="action-btn secondary" @click="handleExport" :disabled="contacts.length === 0">
                <i data-lucide="download" style="width: 18px;"></i>
                Dışa Aktar
            </button>
            <button class="action-btn primary add-trigger" @click="isAdding = true">
                <i data-lucide="plus" style="width: 20px;"></i>
                Yeni Kayıt
            </button>
        </div>
    </header>

    <div class="stats-row">
        <div class="stat-card">
            <i data-lucide="hash" class="stat-icon" style="width: 32px; height: 32px;"></i>
            <div class="stat-content">
                <span class="stat-value" x-text="contacts.length"></span>
                <span class="stat-label">Toplam Kayıt</span>
            </div>
        </div>
        <div class="stat-card">
            <i data-lucide="users" class="stat-icon" style="width: 32px; height: 32px;"></i>
            <div class="stat-content">
                <span class="stat-value" x-text="new Set(contacts.map(c => c.callSign)).size"></span>
                <span class="stat-label">Farklı İstasyon</span>
            </div>
        </div>
        <div class="stat-card" style="flex: 2;">
            <i data-lucide="search" class="stat-icon" style="width: 24px; height: 24px;"></i>
            <input 
                type="text" 
                placeholder="İstasyon, isim veya notlarda ara..." 
                x-model="searchQuery"
                style="background: transparent; border: none; color: white; flex: 1; outline: none; font-size: 1rem;"
            >
        </div>
    </div>

    <!-- Contact Form Modal -->
    <div class="modal-overlay" x-show="isAdding" x-cloak style="display: none;">
        <form class="log-form fade-up" @submit.prevent="handleAdd">
            <div class="form-header">
                <h3>Yeni Temas Kaydı</h3>
                <button type="button" class="action-btn secondary" @click="isAdding = false" style="padding: 8px;">
                    <i data-lucide="x" style="width: 24px;"></i>
                </button>
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label>Çağrı Kodu</label>
                    <input type="text" placeholder="TA1ACM" x-model="newContact.callSign" required>
                </div>
                <div class="form-group">
                    <label>İsim</label>
                    <input type="text" placeholder="Operatör ismi" x-model="newContact.name">
                </div>
                <div class="form-group">
                    <label>Mod</label>
                    <select x-model="newContact.mode">
                        <option value="DMR">DMR</option>
                        <option value="NXDN">NXDN</option>
                        <option value="FM">FM</option>
                        <option value="SSB">SSB</option>
                        <option value="CW">CW</option>
                        <option value="FT8">FT8</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>RST / Rapor</label>
                    <input type="text" placeholder="59" x-model="newContact.rst">
                </div>
            </div>

            <div class="form-group" style="margin-top: 20px;">
                <label>Notlar</label>
                <textarea placeholder="Konuşma detayı, konum veya cihaz bilgisi..." x-model="newContact.notes" rows="3"></textarea>
            </div>

            <div class="form-actions">
                <button type="button" class="action-btn secondary" @click="isAdding = false">İptal</button>
                <button type="submit" class="action-btn primary">Kaydı Ekle</button>
            </div>
        </form>
    </div>

    <!-- Log Table -->
    <div class="log-container">
        <template x-if="filteredContacts.length > 0">
            <div class="log-table-wrapper">
                <table class="log-table">
                    <thead>
                        <tr>
                            <th>Zaman</th>
                            <th>İstasyon</th>
                            <th>Operatör</th>
                            <th>Mod</th>
                            <th>RST</th>
                            <th>Notlar</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <template x-for="contact in filteredContacts" :key="contact.id">
                            <tr class="log-row">
                                <td style="color: var(--text-secondary); line-height: 1.2;">
                                    <span x-text="contact.timestamp.split(',')[0]"></span><br>
                                    <small x-text="contact.timestamp.split(',')[1]"></small>
                                </td>
                                <td class="callsign-col" x-text="contact.callSign"></td>
                                <td x-text="contact.name || '-'"></td>
                                <td>
                                    <span class="mode-badge" :class="contact.mode.toLowerCase()" x-text="contact.mode"></span>
                                </td>
                                <td x-text="contact.rst || '-'"></td>
                                <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-secondary);" x-text="contact.notes || '-'"></td>
                                <td style="text-align: right;">
                                    <button class="action-btn secondary" @click="handleDelete(contact.id)" style="padding: 8px; color: #ff453a;">
                                        <i data-lucide="trash-2" style="width: 16px;"></i>
                                    </button>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </template>

        <template x-if="filteredContacts.length === 0">
            <div class="no-results" style="padding: 80px 40px;">
                <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.03); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <i data-lucide="book-open" style="width: 40px; height: 40px; opacity: 0.3;"></i>
                </div>
                <h3 x-text="searchQuery ? 'Eşleşen kayıt bulunamadı' : 'Kayıt Defteri Boş'"></h3>
                <p x-text="searchQuery ? 'Farklı bir arama terimi deneyin.' : 'Henüz bir telsiz teması kaydetmediniz.'"></p>
            </div>
        </template>
    </div>
</div>

<script>
function logbookView() {
    return {
        contacts: [],
        isAdding: false,
        searchQuery: '',
        newContact: {
            callSign: '',
            name: '',
            notes: '',
            mode: 'DMR',
            rst: '59'
        },

        init() {
            const saved = localStorage.getItem('dilaver_logbook');
            if (saved) {
                try {
                    this.contacts = JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse logbook items", e);
                }
            }
            this.$nextTick(() => {
                lucide.createIcons();
            });
        },

        get filteredContacts() {
            if (!this.searchQuery) return this.contacts;
            const query = this.searchQuery.toLowerCase();
            return this.contacts.filter(c => 
                c.callSign.toLowerCase().includes(query) ||
                c.name.toLowerCase().includes(query) ||
                c.notes.toLowerCase().includes(query) ||
                c.mode.toLowerCase().includes(query)
            );
        },

        save() {
            localStorage.setItem('dilaver_logbook', JSON.stringify(this.contacts));
            this.$nextTick(() => lucide.createIcons());
        },

        handleAdd() {
            if (!this.newContact.callSign) return;

            const contact = {
                id: Date.now().toString(),
                callSign: this.newContact.callSign.toUpperCase(),
                name: this.newContact.name,
                timestamp: new Date().toLocaleString('tr-TR'),
                notes: this.newContact.notes,
                mode: this.newContact.mode,
                rst: this.newContact.rst
            };

            this.contacts = [contact, ...this.contacts];
            this.save();
            this.resetForm();
            this.isAdding = false;
        },

        handleDelete(id) {
            if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
                this.contacts = this.contacts.filter(c => c.id !== id);
                this.save();
            }
        },

        resetForm() {
            this.newContact = { callSign: '', name: '', notes: '', mode: 'DMR', rst: '59' };
        },

        handleExport() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.contacts, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `dilaver_logbook_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        },

        handleImport(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (Array.isArray(imported)) {
                        const combined = [...imported, ...this.contacts];
                        this.contacts = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
                        this.save();
                        alert(`${imported.length} kayıt başarıyla içe aktarıldı.`);
                    }
                } catch (err) {
                    alert('Geçersiz dosya formatı.');
                }
            };
            reader.readAsText(file);
        }
    }
}
</script>
