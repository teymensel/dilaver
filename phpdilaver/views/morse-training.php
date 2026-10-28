<div class="training-page fade-in container" x-data="morseTraining()">
    <header class="page-header" style="display: flex; align-items: center; gap: 20px;">
        <a href="?page=morse" class="control-btn secondary" style="width: 44px; height: 44px; padding: 0; border-radius: 12px;">
            <i data-lucide="chevron-left"></i>
        </a>
        <div>
            <h2 style="font-size: 2rem; font-weight: 950; letter-spacing: -1px; color: #fff; margin: 0;">Mors Antrenörü</h2>
            <p style="color: var(--text-secondary); margin-top: 2px;">Pratik yap ve ustalaş</p>
        </div>
    </header>

    <div class="difficulty-tabs">
        <template x-for="d in ['Harf', 'İsim', 'Şehir', 'Acil Durum']" :key="d">
            <button class="tab" :class="{ 'active': difficulty === d }" @click="setDifficulty(d)" x-text="d"></button>
        </template>
    </div>

    <div class="training-stats-bar">
        <div class="stat-item">
            <span class="stat-label">Başarı</span>
            <span class="stat-value"><span x-text="score"></span>/<span x-text="total"></span></span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Zorluk</span>
            <span class="stat-value" x-text="difficulty"></span>
        </div>
    </div>

    <div class="training-card" :class="{ 'correct': status === 'correct', 'error': status === 'error' }">
        <div class="target-section">
            <span class="target-word" x-text="target.text"></span>
            <template x-if="target.description">
                <p class="target-description" x-text="target.description"></p>
            </template>
        </div>

        <div class="morse-input-display" x-text="userInput || 'Mors kodunu girin...'"></div>

        <div class="decoded-preview">
            <span class="stat-label">Harfler</span>
            <span class="stat-value" style="font-size: 1.1rem; color: #fff;" x-text="decodedInput || '—'"></span>
        </div>

        <div class="keyer-section">
            <button
                class="big-keyer-pad"
                :class="{ 'active': isKeying }"
                @mousedown="handlePressStart"
                @mouseup="handlePressEnd"
                @mouseleave="handlePressEnd"
                @touchstart.prevent="handlePressStart"
                @touchend.prevent="handlePressEnd"
            >
                <i data-lucide="zap" class="key-icon"></i>
                <span>Maus veya Boşluk Tuşu</span>
            </button>
        </div>

        <div class="training-controls">
            <button class="control-btn secondary" @click="nextTarget">
                <i data-lucide="refresh-cw" style="width: 18px;"></i>
                ATLA
            </button>
            <button class="control-btn secondary" @click="playMorse(target.code)">
                <i data-lucide="volume-2" style="width: 18px;"></i>
                DİNLE
            </button>
        </div>
    </div>

    <div class="info-card">
        <i data-lucide="alert-triangle" style="width: 18px; color: var(--primary);"></i>
        <p>Harfler arasında kısa bir bekleme yapın. Boşluk tuşuyla veri girişi yapabilirsiniz.</p>
    </div>
</div>

<script>
function morseTraining() {
    return {
        difficulty: 'Harf',
        target: { text: '', code: '', description: '' },
        userInput: '',
        decodedInput: '',
        score: 0,
        total: 0,
        status: null, // 'correct' | 'error' | null
        isKeying: false,
        pressStartTime: 0,
        gapTimeout: null,
        dotThreshold: 180,
        charGap: 600,
        resolved: false,
        
        // Audio Context
        audioCtx: null,
        oscillator: null,
        gainNode: null,

        alphabet: [
            { char: 'A', code: '.-' }, { char: 'B', code: '-...' }, { char: 'C', code: '-.-.' },
            { char: 'D', code: '-..' }, { char: 'E', code: '.' }, { char: 'F', code: '..-.' },
            { char: 'G', code: '--.' }, { char: 'H', code: '....' }, { char: 'I', code: '..' },
            { char: 'J', code: '.---' }, { char: 'K', code: '-.-' }, { char: 'L', code: '.-..' },
            { char: 'M', code: '--' }, { char: 'N', code: '-.' }, { char: 'O', code: '---' },
            { char: 'P', code: '.--.' }, { char: 'Q', code: '--.-' }, { char: 'R', code: '.-.' },
            { char: 'S', code: '...' }, { char: 'T', code: '-' }, { char: 'U', code: '..-' },
            { char: 'V', code: '...-' }, { char: 'W', code: '.--' }, { char: 'X', code: '-..-' },
            { char: 'Y', code: '-.--' }, { char: 'Z', code: '--..' }
        ],
        numbers: [
            { char: '1', code: '.----' }, { char: '2', code: '..---' }, { char: '3', code: '...--' },
            { char: '4', code: '....-' }, { char: '5', code: '.....' }, { char: '6', code: '-....' },
            { char: '7', code: '--...' }, { char: '8', code: '---..' }, { char: '9', code: '----.' },
            { char: '0', code: '-----' }
        ],
        cities: ['ISTANBUL', 'ANKARA', 'IZMIR', 'BURSA', 'ANTALYA', 'ADANA', 'KONYA', 'GAZIANTEP', 'SAMSUN', 'MERSIN'],
        names: ['AHMET', 'MEHMET', 'AYSE', 'FATMA', 'MUSTAFA', 'EMINE', 'ALI', 'HUSEYIN', 'HASAN', 'ZEYNEP'],
        emergency: [
            { text: 'SOS', code: '... --- ...', description: 'Uluslararası Tehlike Sinyali' },
            { text: 'MAYDAY', code: '-- .- -.-- -.. .- -.--', description: 'Acil Yardım Çağrısı' },
            { text: 'CQD', code: '-.-. --.- -..', description: 'Eski Tehlike Sinyali' },
            { text: 'QUM', code: '--.- ..- --', description: 'Felaket Bildirisi' }
        ],
        
        morseMap: {},
        charMap: {},

        init() {
            const all = [...this.alphabet, ...this.numbers];
            this.morseMap = all.reduce((acc, curr) => { acc[curr.code] = curr.char; return acc; }, {});
            this.charMap = all.reduce((acc, curr) => { acc[curr.char] = curr.code; return acc; }, {});
            
            this.nextTarget();

            window.onkeydown = (e) => {
                if (e.code === 'Space' && !e.repeat) {
                    e.preventDefault();
                    this.handlePressStart();
                }
            };
            window.onkeyup = (e) => {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.handlePressEnd();
                }
            };

            this.$nextTick(() => {
                lucide.createIcons();
            });
        },

        setDifficulty(d) {
            this.difficulty = d;
            this.nextTarget();
        },

        nextTarget() {
            this.resolved = false;
            this.status = null;
            this.userInput = '';
            this.decodedInput = '';
            
            let text = '';
            let description = '';
            
            if (this.difficulty === 'Harf') {
                const item = this.alphabet[Math.floor(Math.random() * this.alphabet.length)];
                text = item.char;
            } else if (this.difficulty === 'İsim') {
                text = this.names[Math.floor(Math.random() * this.names.length)];
            } else if (this.difficulty === 'Şehir') {
                text = this.cities[Math.floor(Math.random() * this.cities.length)];
            } else {
                const item = this.emergency[Math.floor(Math.random() * this.emergency.length)];
                text = item.text;
                description = item.description;
            }
            
            const code = text.split('').map(c => this.charMap[c] || '').join(' ').trim();
            this.target = { text, code, description };
        },

        setupAudio() {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                this.gainNode = this.audioCtx.createGain();
                this.gainNode.connect(this.audioCtx.destination);
                this.gainNode.gain.value = 0;
            }
        },

        startTone() {
            this.setupAudio();
            if (this.oscillator) try { this.oscillator.stop(); } catch(e) {}
            this.oscillator = this.audioCtx.createOscillator();
            this.oscillator.type = 'sine';
            this.oscillator.frequency.setValueAtTime(700, this.audioCtx.currentTime);
            this.oscillator.connect(this.gainNode);
            this.oscillator.start();
            this.gainNode.gain.setTargetAtTime(0.1, this.audioCtx.currentTime, 0.01);
        },

        stopTone() {
            if (this.gainNode) this.gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.01);
            if (this.oscillator) {
                setTimeout(() => { try { if (this.oscillator) this.oscillator.stop(); } catch(e) {} }, 50);
            }
        },

        handlePressStart() {
            if (this.resolved || this.isKeying) return;
            this.isKeying = true;
            this.pressStartTime = Date.now();
            if (this.gapTimeout) clearTimeout(this.gapTimeout);
            this.startTone();
        },

        handlePressEnd() {
            if (!this.isKeying || this.resolved) return;
            this.isKeying = false;
            this.stopTone();

            const duration = Date.now() - this.pressStartTime;
            const symbol = duration < this.dotThreshold ? '.' : '-';
            this.userInput += symbol;
            
            this.checkProgress();

            this.gapTimeout = setTimeout(() => {
                if (this.userInput && !this.userInput.endsWith(' ') && !this.resolved) {
                    this.userInput += ' ';
                }
            }, this.charGap);
        },

        checkProgress() {
            const input = this.userInput.trim().replace(/\s+/g, ' ');
            const target = this.target.code.trim().replace(/\s+/g, ' ');
            
            const inputTokens = input ? input.split(' ') : [];
            const targetTokens = target.split(' ');
            
            // Decode input for preview
            this.decodedInput = inputTokens.map(t => this.morseMap[t] || '•').join('');

            // Mismatch check
            for (let i = 0; i < inputTokens.length; i++) {
                if (!targetTokens[i] || !targetTokens[i].startsWith(inputTokens[i])) {
                    this.resolveRound(false);
                    return;
                }
            }

            // Success check
            if (input === target) {
                this.resolveRound(true);
            }
        },

        resolveRound(isSuccess) {
            this.resolved = true;
            this.status = isSuccess ? 'correct' : 'error';
            this.total++;
            if (isSuccess) this.score++;
            
            setTimeout(() => {
                this.nextTarget();
            }, isSuccess ? 500 : 1000);
        },

        async playMorse(code) {
            this.setupAudio();
            const unit = 100;
            for (let char of code) {
                if (char === ' ') {
                    await new Promise(r => setTimeout(r, unit * 3));
                    continue;
                }
                this.startTone();
                await new Promise(r => setTimeout(r, char === '.' ? unit : unit * 3));
                this.stopTone();
                await new Promise(r => setTimeout(r, unit));
            }
        }
    }
}
</script>
