<div class="cevrim-page fade-in" x-data="cevrimController()">
    <header class="page-header">
        <h2 style="font-size: 2.5rem; font-weight: 950; letter-spacing: -1.5px; color: #fff; margin: 0;">Çevrim Modu</h2>
        <p style="color: var(--text-secondary); font-weight: 500;">Net Control & Katılımcı Takibi</p>
    </header>

    <!-- SETUP VIEW -->
    <template x-if="!isActive">
        <div class="setup-card glass">
            <h3 style="margin-bottom: 24px; font-weight: 900; color: #fff;">Yeni Çevrim Başlat</h3>
            
            <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 700; color: var(--text-secondary);">Çevrim Adı <span style="color: var(--primary);">*</span></label>
                <input type="text" x-model="sessionName" placeholder="Örn: Akdeniz Net" class="glass-input" style="width: 100%; padding: 14px; border-radius: 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff;">
            </div>

            <div class="form-group" style="margin-bottom: 24px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 700; color: var(--text-secondary);">Operatör Çağrı İşareti <span style="color: var(--primary);">*</span></label>
                <input type="text" x-model="operator" @input="operator = operator.toUpperCase()" placeholder="Örn: TA1ABC" class="glass-input" style="width: 100%; padding: 14px; border-radius: 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff;">
            </div>

            <div class="planner-group glass" style="padding: 20px; border-radius: 20px; margin-bottom: 32px; background: rgba(0, 122, 255, 0.03); border: 1px solid rgba(0, 122, 255, 0.1);">
                <label style="display: block; margin-bottom: 12px; font-weight: 800; color: var(--primary);">Çevrim Planla (Opsiyonel)</label>
                <input type="datetime-local" x-model="plannedStartAt" class="glass-input" style="width: 100%; padding: 12px; border-radius: 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); color: #fff; margin-bottom: 16px;">
                
                <div class="planner-actions" style="display: flex; gap: 12px;">
                    <button class="action-btn" @click="scheduleSession" :disabled="!sessionName || !operator || !plannedStartAt" style="background: var(--primary); color: #fff; flex: 1; justify-content: center; font-weight: 800;">
                        <i data-lucide="calendar-clock" style="width: 18px;"></i>
                        PLANLA
                    </button>
                    <template x-if="scheduledSession">
                        <button class="action-btn secondary" @click="cancelScheduledSession" style="background: rgba(255,69,58,0.1); color: #ff453a; border-color: rgba(255,69,58,0.2);">
                            İPTAL
                        </button>
                    </template>
                </div>
                
                <template x-if="scheduledSession">
                    <p style="margin-top: 16px; font-size: 0.9rem; color: var(--text-secondary);">
                        Planlandı: <strong x-text="scheduledSession.sessionName"></strong> - <span x-text="formatDateTime(scheduledSession.startsAt)"></span>
                    </p>
                </template>
            </div>

            <button class="start-btn" @click="startSession" :disabled="!sessionName || !operator" style="width: 100%; padding: 18px; border-radius: 20px; background: var(--primary); color: #fff; font-size: 1.1rem; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 8px 24px var(--primary-glow); border: none; cursor: pointer;">
                <i data-lucide="play" style="width: 24px;"></i>
                ÇEVRİMİ BAŞLAT
            </button>
        </div>
    </template>

    <!-- ACTIVE SESSION VIEW -->
    <template x-if="isActive">
        <div class="active-session">
            <div class="session-stats glass" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; padding: 24px; border-radius: 24px; margin-bottom: 24px; align-items: center;">
                <div class="stat">
                    <span class="label" style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">Operatör</span>
                    <span class="value" style="font-size: 1.25rem; font-weight: 900; color: var(--primary);" x-text="operator"></span>
                </div>
                <div class="stat">
                    <span class="label" style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">Katılımcı</span>
                    <span class="value" style="font-size: 1.25rem; font-weight: 900; color: #fff;" x-text="participants.length"></span>
                </div>
                <div class="stat">
                    <span class="label" style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">Başlangıç</span>
                    <span class="value" style="font-size: 1rem; font-weight: 600; color: #fff;" x-text="formatTimeOnly(sessionStartedAt)"></span>
                </div>
                <button class="stop-btn" @click="endSession" style="background: #ff453a; color: #fff; border: none; padding: 14px; border-radius: 14px; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 12px rgba(255,69,58,0.3);">
                    <i data-lucide="square" style="width: 18px; fill: currentColor;"></i>
                    BİTİR
                </button>
            </div>

            <form class="quick-entry glass" @submit.prevent="addParticipant" style="display: flex; gap: 12px; padding: 16px; border-radius: 20px; margin-bottom: 24px; background: rgba(255,255,255,0.05);">
                <input placeholder="Çağrı Kodu" x-model="newEntry.callSign" @input="newEntry.callSign = newEntry.callSign.toUpperCase()" required style="flex: 1; padding: 14px; border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #fff;">
                <input placeholder="İsim" x-model="newEntry.name" @input="newEntry.name = newEntry.name.toUpperCase()" style="flex: 1; padding: 14px; border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #fff;">
                <input placeholder="Konum" x-model="newEntry.qth" @input="newEntry.qth = newEntry.qth.toUpperCase()" style="flex: 1; padding: 14px; border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #fff;">
                <button type="submit" class="add-p-btn" style="background: var(--primary); color: #fff; border: none; width: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <i data-lucide="user-plus" style="width: 20px;"></i>
                </button>
            </form>

            <div class="participant-table-wrapper glass" style="padding: 0; border-radius: 24px; overflow: hidden; background: rgba(255,255,255,0.02); margin-bottom: 24px;">
                <table class="participant-table" style="width: 100%; border-collapse: collapse;">
                    <thead style="background: rgba(255,255,255,0.03);">
                        <tr>
                            <th style="padding: 16px; text-align: left; color: var(--text-secondary); font-size: 0.8rem; font-weight: 800;">#</th>
                            <th style="padding: 16px; text-align: left; color: var(--primary); font-size: 0.8rem; font-weight: 800;">ÇAĞRI İŞARETİ</th>
                            <th style="padding: 16px; text-align: left; color: var(--text-secondary); font-size: 0.8rem; font-weight: 800;">İSİM</th>
                            <th style="padding: 16px; text-align: left; color: var(--text-secondary); font-size: 0.8rem; font-weight: 800;">QTH</th>
                            <th style="padding: 16px; text-align: left; color: var(--text-secondary); font-size: 0.8rem; font-weight: 800;">SAAT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template x-for="(p, index) in participants" :key="p.id">
                            <tr style="border-top: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 16px; color: var(--text-secondary);" x-text="index + 1"></td>
                                <td style="padding: 16px; font-weight: 900; color: #fff;" x-text="p.callSign"></td>
                                <td style="padding: 16px; color: rgba(255,255,255,0.8);" x-text="p.name || '-'"></td>
                                <td style="padding: 16px; color: rgba(255,255,255,0.8);" x-text="p.qth || '-'"></td>
                                <td style="padding: 16px; font-family: monospace; color: var(--primary);" x-text="p.time"></td>
                            </tr>
                        </template>
                        <template x-if="participants.length === 0">
                            <tr>
                                <td colspan="5" style="padding: 40px; text-align: center; color: var(--text-secondary); font-weight: 600;">Henüz kimse eklenmedi.</td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
            
            <div class="session-actions" style="display: flex; gap: 12px; margin-bottom: 40px;">
                <button class="action-btn" @click="clearList" style="flex: 1; background: rgba(255,255,255,0.05); color: #fff; justify-content: center;">
                    <i data-lucide="trash-2" style="width: 18px;"></i>
                    Listeyi Temizle
                </button>
            </div>
        </div>
    </template>

    <!-- HISTORY SECTION -->
    <section class="history-section glass" style="margin-top: 40px; padding: 32px; border-radius: 32px;">
        <div class="history-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
            <div>
                <h3 style="font-weight: 900; color: #fff; margin: 0;">Çevrim Geçmişi</h3>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 4px;">Son tamamlanan çevrim kayıtlarınız</p>
            </div>
            <div style="display: flex; gap: 12px;">
                <button class="action-btn secondary" @click="exportHistory" :disabled="history.length === 0">
                    <i data-lucide="download" style="width: 18px;"></i>
                    Dışa Aktar
                </button>
                <button class="action-btn secondary" @click="clearHistory" :disabled="history.length === 0" style="color: #ff453a; border-color: rgba(255,69,58,0.2);">
                    <i data-lucide="trash-2" style="width: 18px;"></i>
                    Geçmişi Sil
                </button>
            </div>
        </div>

        <div class="history-list" style="display: flex; flex-direction: column; gap: 16px;">
            <template x-for="session in history" :key="session.id">
                <div class="history-item glass" style="padding: 20px; border-radius: 20px; background: rgba(255,255,255,0.03);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="font-weight: 900; color: var(--primary); margin: 0;" x-text="session.sessionName"></h4>
                            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
                                Operatör: <strong style="color: #fff;" x-text="session.operator"></strong> | 
                                <span x-text="formatDateTime(session.endedAt)"></span>
                            </p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <span class="history-badge" style="background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; color: var(--text-secondary);">
                                <span x-text="session.participants.length"></span> katılımcı
                            </span>
                            <button @click="deleteSession(session.id)" style="background: none; border: none; color: #ff453a; cursor: pointer; padding: 8px;">
                                <i data-lucide="trash-2" style="width: 18px;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </template>
            
            <template x-if="history.length === 0">
                <div style="padding: 60px; text-align: center; border: 1px dashed rgba(255,255,255,0.1); border-radius: 24px; color: var(--text-secondary);">
                    Henüz kayıtlı çevrim geçmişi bulunmuyor.
                </div>
            </template>
        </div>
    </section>
</div>

<script>
function cevrimController() {
    return {
        isActive: false,
        sessionName: '',
        operator: '',
        sessionStartedAt: null,
        participants: [],
        newEntry: { callSign: '', name: '', qth: '' },
        scheduledSession: null,
        plannedStartAt: '',
        history: [],

        init() {
            // Load state from LocalStorage
            const stored = JSON.parse(localStorage.getItem('dilaver_cevrim_active') || 'null');
            if (stored) {
                this.isActive = true;
                this.sessionName = stored.sessionName;
                this.operator = stored.operator;
                this.sessionStartedAt = stored.sessionStartedAt;
                this.participants = stored.participants;
            }

            const storedPlan = JSON.parse(localStorage.getItem('dilaver_cevrim_plan') || 'null');
            if (storedPlan) {
                this.scheduledSession = storedPlan;
                this.plannedStartAt = storedPlan.startsAt.slice(0, 16);
            }

            this.loadHistory();
            this.checkSchedule();
            setInterval(() => this.checkSchedule(), 30000); // Check every 30s
            
            lucide.createIcons();
        },

        startSession() {
            if (!this.sessionName || !this.operator) return;
            this.isActive = true;
            this.sessionStartedAt = new Date().toISOString();
            this.participants = [];
            this.saveActiveState();
            
            // Clear plan if started manually
            this.scheduledSession = null;
            localStorage.removeItem('dilaver_cevrim_plan');
            
            this.$nextTick(() => lucide.createIcons());
        },

        endSession() {
            if (!confirm('Çevrimi sonlandırmak istediğinize emin misiniz?')) return;
            
            const sessionResult = {
                id: Date.now().toString(),
                sessionName: this.sessionName,
                operator: this.operator,
                startedAt: this.sessionStartedAt,
                endedAt: new Date().toISOString(),
                participants: [...this.participants]
            };

            this.history.unshift(sessionResult);
            localStorage.setItem('dilaver_cevrim_history', JSON.stringify(this.history));
            
            this.isActive = false;
            this.sessionStartedAt = null;
            this.participants = [];
            localStorage.removeItem('dilaver_cevrim_active');
            
            this.$nextTick(() => lucide.createIcons());
        },

        addParticipant() {
            if (!this.newEntry.callSign) return;
            
            const entry = {
                id: Date.now().toString(),
                callSign: this.newEntry.callSign.toUpperCase(),
                name: this.newEntry.name.toUpperCase(),
                qth: this.newEntry.qth.toUpperCase(),
                time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            };

            this.participants.unshift(entry);
            this.newEntry = { callSign: '', name: '', qth: '' };
            this.saveActiveState();
        },

        saveActiveState() {
            localStorage.setItem('dilaver_cevrim_active', JSON.stringify({
                sessionName: this.sessionName,
                operator: this.operator,
                sessionStartedAt: this.sessionStartedAt,
                participants: this.participants
            }));
        },

        scheduleSession() {
            if (!this.plannedStartAt) return;
            this.scheduledSession = {
                sessionName: this.sessionName,
                operator: this.operator,
                startsAt: new Date(this.plannedStartAt).toISOString()
            };
            localStorage.setItem('dilaver_cevrim_plan', JSON.stringify(this.scheduledSession));
        },

        cancelScheduledSession() {
            this.scheduledSession = null;
            this.plannedStartAt = '';
            localStorage.removeItem('dilaver_cevrim_plan');
        },

        checkSchedule() {
            if (this.isActive || !this.scheduledSession) return;
            const startTime = new Date(this.scheduledSession.startsAt).getTime();
            if (startTime <= Date.now()) {
                this.startSession();
            }
        },

        clearList() {
            if (confirm('Tüm katılımcı listesi temizlenecek. Devam?')) {
                this.participants = [];
                this.saveActiveState();
            }
        },

        loadHistory() {
            this.history = JSON.parse(localStorage.getItem('dilaver_cevrim_history') || '[]');
        },

        deleteSession(id) {
            if (confirm('Bu çevrim kaydı silinecek. Emin misiniz?')) {
                this.history = this.history.filter(s => s.id !== id);
                localStorage.setItem('dilaver_cevrim_history', JSON.stringify(this.history));
            }
        },

        clearHistory() {
            if (confirm('Tüm çevrim geçmişi kalıcı olarak silinecek!')) {
                this.history = [];
                localStorage.removeItem('dilaver_cevrim_history');
            }
        },

        exportHistory() {
            const data = JSON.stringify({ sessions: this.history }, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cevrim-gecmisi-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        },

        formatDateTime(iso) {
            if (!iso) return '-';
            return new Date(iso).toLocaleString('tr-TR', { 
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
            });
        },

        formatTimeOnly(iso) {
            if (!iso) return '-';
            return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        }
    };
}
</script>
