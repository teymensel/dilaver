<?php
$category = isset($_GET['category']) ? $_GET['category'] : 'all';
?>
<div class="exam-sim-page fade-in container" x-data="quizEngine('<?php echo $category; ?>')">
    <header class="page-header" style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <button class="action-btn secondary" @click="handleBack" style="padding: 10px;">
                <i data-lucide="arrow-left" style="width: 24px;"></i>
            </button>
            <div>
                <h2 style="font-size: 2.5rem; font-weight: 950; letter-spacing: -1.5px; color: #fff; margin: 0;">Sınav Merkezi</h2>
                <p style="color: var(--text-secondary); margin-top: 4px;" x-text="categoryTitle"></p>
            </div>
        </div>
    </header>

    <div class="exam-container" style="max-width: 800px; margin: 0 auto; width: 100%;">
        <!-- PRE-START OPTIONS -->
        <template x-if="currentState === 'OPTIONS'">
            <div class="options-state fade-up">
                <h3 class="section-title">Çalışma Ayarları</h3>
                <div class="options-list">
                    <div class="option-row glass">
                        <span>Çalışma Modu</span>
                        <div class="toggle-group">
                            <button class="toggle-btn" :class="workMode === 'PRACTICE' ? 'active' : ''" @click="workMode = 'PRACTICE'">Pratik (Anlık)</button>
                            <button class="toggle-btn" :class="workMode === 'EXAM' ? 'active' : ''" @click="workMode = 'EXAM'">Sınav (Gerçek)</button>
                        </div>
                    </div>
                    <div class="option-row glass">
                        <span>Soruları Karıştır</span>
                        <div class="toggle-group">
                            <button class="toggle-btn" :class="shuffleQuestions ? 'active' : ''" @click="shuffleQuestions = true">Evet</button>
                            <button class="toggle-btn" :class="!shuffleQuestions ? 'active' : ''" @click="shuffleQuestions = false">Hayır</button>
                        </div>
                    </div>
                    <div class="option-row glass">
                        <span>Şıkları Karıştır</span>
                        <div class="toggle-group">
                            <button class="toggle-btn" :class="shuffleOptions ? 'active' : ''" @click="shuffleOptions = true">Evet</button>
                            <button class="toggle-btn" :class="!shuffleOptions ? 'active' : ''" @click="shuffleOptions = false">Hayır</button>
                        </div>
                    </div>
                </div>
                <button class="action-btn primary" style="width: 100%; padding: 20px; font-size: 1.1rem; justify-content: center;" @click="startQuiz">
                    Çalışmayı Başlat
                </button>
            </div>
        </template>

        <!-- QUIZ INTERFACE -->
        <template x-if="currentState === 'QUIZ' && currentQ">
            <div class="quiz-state fade-in">
                <div class="quiz-header glass" style="margin-bottom: 24px; padding: 20px; border-radius: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-weight: 800; color: var(--primary); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;" x-text="categoryLabel"></span>
                        <span style="font-weight: 700; color: var(--text-secondary); font-size: 0.9rem;" x-text="(currentIndex + 1) + ' / ' + questions.length"></span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="height: 10px;">
                            <div style="height: 100%; background: var(--primary); transition: width 0.3s ease;" :style="{ width: ((currentIndex / questions.length) * 100) + '%' }"></div>
                        </div>
                    </div>
                </div>

                <div class="question-box">
                    <p x-text="currentQ.question"></p>
                </div>

                <div class="options-container">
                    <template x-for="opt in currentQ.options" :key="opt.id">
                        <button class="quiz-option" 
                                :class="getOptionClass(opt.id)"
                                @click="handleAnswer(opt.id)"
                                :disabled="showCorrection">
                            <div class="option-letter" x-text="opt.id"></div>
                            <span x-text="opt.text" style="line-height: 1.4; font-weight: 500;"></span>
                        </button>
                    </template>
                </div>

                <div class="quiz-footer" style="margin-top: 32px; display: flex; justify-content: flex-end;">
                    <button class="action-btn primary" 
                            :disabled="answers[currentIndex] === undefined"
                            @click="nextQuestion">
                        <span x-text="currentIndex === questions.length - 1 ? 'Sınavı Bitir' : 'Sonraki Soru'"></span>
                        <i data-lucide="chevron-right" style="width: 18px;"></i>
                    </button>
                </div>
            </div>
        </template>

        <!-- RESULT PANEL -->
        <template x-if="currentState === 'RESULT'">
            <div class="result-state fade-up">
                <div class="result-card">
                    <div class="score-circle" :style="{ borderColor: results.score >= 75 ? '#30d158' : '#ff453a' }">
                        <span class="score-value" x-text="'%' + results.score"></span>
                        <span class="score-label">Başarı</span>
                    </div>
                    <h3 style="font-size: 1.8rem; font-weight: 900; margin-bottom: 12px;" x-text="results.score >= 75 ? 'Tebrikler!' : 'Daha Çok Çalışmalısın'"></h3>
                    <p style="color: var(--text-secondary); margin-bottom: 32px;" x-text="results.score >= 75 ? 'Sınavı başarıyla geçtiniz.' : 'Amatör telsizci olmanız için %75 başarı gereklidir.'"></p>
                    
                    <div style="display: flex; gap: 20px; justify-content: center; margin-bottom: 32px;">
                        <div class="stat-box">
                            <span style="font-size: 1.4rem; font-weight: 800; color: #30d158;" x-text="results.correct"></span>
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">DOĞRU</span>
                        </div>
                        <div class="stat-box">
                            <span style="font-size: 1.4rem; font-weight: 800; color: #ff453a;" x-text="results.wrong"></span>
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">YANLIŞ</span>
                        </div>
                    </div>

                    <button class="action-btn primary" style="justify-content: center; width: 100%; padding: 16px;" @click="currentState = 'OPTIONS'">
                        Yeniden Başla
                    </button>
                    <button class="action-btn secondary" style="justify-content: center; width: 100%; padding: 16px; margin-top: 12px;" @click="window.location.href = '?page=exams'">
                        Ana Menüye Dön
                    </button>
                </div>
            </div>
        </template>
    </div>
</div>

<script>
function quizEngine(cat) {
    return {
        category: cat,
        currentState: 'OPTIONS', // OPTIONS, QUIZ, RESULT
        workMode: 'PRACTICE', // PRACTICE, EXAM
        shuffleQuestions: true,
        shuffleOptions: true,
        
        allQuestions: null,
        questions: [],
        currentIndex: 0,
        answers: {},
        showCorrection: false,
        results: { correct: 0, wrong: 0, score: 0 },

        init() {
            fetch('assets/data/questions.json')
                .then(r => r.json())
                .then(data => {
                    this.allQuestions = data;
                });
            this.$nextTick(() => lucide.createIcons());
        },

        get categoryTitle() {
            const titles = {
                'isletme': 'İşletme Soru Bankası',
                'teknik': 'Teknik Soru Bankası',
                'yonetmelik': 'Düzenlemeler Soru Bankası',
                'all': 'Deneme Sınavı'
            };
            return titles[this.category] || 'Sınav Simülasyonu';
        },

        get categoryLabel() {
            if (this.currentQ) {
                if (this.category === 'all') return 'KARMA SINAV';
                return this.categoryTitle.toUpperCase();
            }
            return '';
        },

        get currentQ() {
            return this.questions[this.currentIndex] || null;
        },

        handleBack() {
            if (this.currentState === 'QUIZ') {
                if (confirm('Sınavdan çıkmak istediğinize emin misiniz?')) {
                    this.currentState = 'OPTIONS';
                }
            } else {
                window.location.href = '?page=exams';
            }
        },

        startQuiz() {
            if (!this.allQuestions) return;

            let pool = [];
            if (this.category === 'all') {
                // Deneme sınavı: 20 işletme, 20 teknik, 10 yönetmelik (örnek 50 soru)
                const isletme = [...this.allQuestions.isletme].sort(() => 0.5 - Math.random()).slice(0, 20);
                const teknik = [...this.allQuestions.teknik].sort(() => 0.5 - Math.random()).slice(0, 20);
                const yon = [...this.allQuestions.yonetmelik].sort(() => 0.5 - Math.random()).slice(0, 10);
                pool = [...isletme, ...teknik, ...yon];
            } else {
                pool = JSON.parse(JSON.stringify(this.allQuestions[this.category]));
            }

            if (this.shuffleQuestions) {
                pool = pool.sort(() => 0.5 - Math.random());
            }

            if (this.shuffleOptions) {
                pool.forEach(q => {
                    q.options = q.options.sort(() => 0.5 - Math.random());
                });
            }

            this.questions = pool;
            this.currentIndex = 0;
            this.answers = {};
            this.showCorrection = false;
            this.currentState = 'QUIZ';
            this.$nextTick(() => lucide.createIcons());
        },

        handleAnswer(optionId) {
            if (this.showCorrection) return;

            this.answers[this.currentIndex] = optionId;

            if (this.workMode === 'PRACTICE') {
                this.showCorrection = true;
                setTimeout(() => {
                    // Sayfa sonuna kaydır (isteğe bağlı)
                }, 100);
            }
        },

        getOptionClass(optionId) {
            const isSelected = this.answers[this.currentIndex] === optionId;
            const isCorrect = optionId === this.currentQ.correctAnswer;

            if (this.showCorrection || (this.workMode === 'EXAM' && isSelected && this.currentIndex === this.questions.length - 1)) {
                if (isSelected && isCorrect) return 'correct';
                if (isSelected && !isCorrect) return 'wrong';
                if (isCorrect && isSelected === false && this.showCorrection) return 'correct';
            }
            if (isSelected) return 'selected';
            return '';
        },

        nextQuestion() {
            if (this.currentIndex < this.questions.length - 1) {
                this.currentIndex++;
                this.showCorrection = false;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                this.finishQuiz();
            }
        },

        finishQuiz() {
            let correct = 0;
            this.questions.forEach((q, idx) => {
                if (this.answers[idx] === q.correctAnswer) correct++;
            });

            this.results = {
                correct: correct,
                wrong: this.questions.length - correct,
                score: Math.round((correct / this.questions.length) * 100)
            };

            this.currentState = 'RESULT';
            
            // Save to history
            const history = JSON.parse(localStorage.getItem('dilaver_exam_history') || '[]');
            history.unshift({
                date: new Date().toLocaleString('tr-TR'),
                category: this.category,
                score: this.results.score,
                correct: this.results.correct,
                wrong: this.results.wrong
            });
            localStorage.setItem('dilaver_exam_history', JSON.stringify(history.slice(0, 10)));
        }
    }
}
</script>
