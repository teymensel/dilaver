<div class="morse-page fade-in container" x-data="morsePage()">
    <header class="page-header">
        <div>
            <h2 style="font-size: 2.5rem; font-weight: 900; letter-spacing: -1.5px; color: #fff; margin: 0;">Mors Kodları</h2>
            <p style="color: var(--text-secondary); margin-top: 4px;">Dinle ve Alıştırma Yap</p>
        </div>
        <a href="?page=morse-training" class="training-btn">
            <i data-lucide="zap"></i>
            Antrenman Yap
        </a>
    </header>

    <!-- Interactive Keyer Row -->
    <div class="interactive-keyer">
        <div class="keyer-header">
            <i data-lucide="volume-2" style="width: 16px;"></i>
            <span>İnteraktif Çalışma (Kısa: . Uzun: - / Space destekli)</span>
        </div>
        
        <button 
            id="keyerPad"
            class="keyer-pad" 
            :class="{ 'active': isKeying }"
            @mousedown="onPressStart"
            @mouseup="onPressEnd"
            @mouseleave="onPressEnd"
            @touchstart.prevent="onPressStart"
            @touchend.prevent="onPressEnd"
        >
            BAS - BIRAK
        </button>

        <div class="keyer-controls">
            <button class="keyer-clear-btn" @click="clearInput">
                <i data-lucide="eraser" style="width: 16px;"></i>
                Temizle
            </button>
        </div>

        <div class="keyer-output" x-text="practiceInput || 'Çıktı: . ve - buraya yazılır'"></div>
        <div class="keyer-decoded">Harfler: <span x-text="decodedText || '—'"></span></div>
    </div>

    <!-- Alphabet Category -->
    <div class="morse-category">
        <h3>Alfabe</h3>
        <div class="morse-grid">
            <template x-for="item in alphabet" :key="item.char">
                <button class="morse-card" @click="playMorse(item.code)">
                    <span class="morse-char" x-text="item.char"></span>
                    <span class="morse-code" x-text="item.code"></span>
                    <div class="play-hint">
                        <i data-lucide="play" style="width: 12px; height: 12px; fill: white;"></i>
                    </div>
                </button>
            </template>
        </div>
    </div>

    <!-- Numbers Category -->
    <div class="morse-category">
        <h3>Rakamlar</h3>
        <div class="morse-grid">
            <template x-for="item in numbers" :key="item.char">
                <button class="morse-card" @click="playMorse(item.code)">
                    <span class="morse-char" x-text="item.char"></span>
                    <span class="morse-code" x-text="item.code"></span>
                    <div class="play-hint">
                        <i data-lucide="play" style="width: 12px; height: 12px; fill: white;"></i>
                    </div>
                </button>
            </template>
        </div>
    </div>
</div>

<script>
function morsePage() {
    return {
        isKeying: false,
        practiceInput: '',
        decodedText: '',
        pressStarted: 0,
        gapTimeout: null,
        dotThreshold: 180,
        charGap: 600,
        
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
        
        morseMap: {},

        init() {
            this.morseMap = [...this.alphabet, ...this.numbers].reduce((acc, curr) => {
                acc[curr.code] = curr.char;
                return acc;
            }, {});
            
            this.$nextTick(() => {
                lucide.createIcons();
            });

            // Spacebar Listener
            window.onkeydown = (e) => {
                if (e.code === 'Space' && !e.repeat) {
                    e.preventDefault();
                    this.onPressStart();
                }
            };
            window.onkeyup = (e) => {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.onPressEnd();
                }
            };
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
            if (this.oscillator) this.oscillator.stop();
            
            this.oscillator = this.audioCtx.createOscillator();
            this.oscillator.type = 'sine';
            this.oscillator.frequency.setValueAtTime(700, this.audioCtx.currentTime);
            this.oscillator.connect(this.gainNode);
            this.oscillator.start();
            
            this.gainNode.gain.setTargetAtTime(0.1, this.audioCtx.currentTime, 0.01);
        },

        stopTone() {
            if (this.gainNode) {
                this.gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.01);
            }
            if (this.oscillator) {
                setTimeout(() => { if (this.oscillator) this.oscillator.stop(); }, 50);
            }
        },

        onPressStart() {
            if (this.isKeying) return;
            this.isKeying = true;
            this.pressStarted = Date.now();
            if (this.gapTimeout) clearTimeout(this.gapTimeout);
            this.startTone();
        },

        onPressEnd() {
            if (!this.isKeying) return;
            this.isKeying = false;
            this.stopTone();

            const duration = Date.now() - this.pressStarted;
            const symbol = duration < this.dotThreshold ? '.' : '-';
            this.practiceInput += symbol;
            
            this.decode();

            this.gapTimeout = setTimeout(() => {
                if (this.practiceInput && !this.practiceInput.endsWith(' ')) {
                    this.practiceInput += ' ';
                }
            }, this.charGap);
        },

        decode() {
            const tokens = this.practiceInput.trim().split(' ');
            this.decodedText = tokens.map(t => this.morseMap[t] || '•').join('');
        },

        clearInput() {
            this.practiceInput = '';
            this.decodedText = '';
            this.isKeying = false;
        },

        async playMorse(code) {
            this.setupAudio();
            const unit = 100; // ms
            
            for (let char of code) {
                this.startTone();
                await new Promise(r => setTimeout(r, char === '.' ? unit : unit * 3));
                this.stopTone();
                await new Promise(r => setTimeout(r, unit));
            }
        }
    }
}
</script>
