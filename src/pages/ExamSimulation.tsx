import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, X, AlertCircle } from 'lucide-react';
import { examData } from '../data/examQuestions';
import type { ExamCategory, ExamQuestion } from '../data/examQuestionsTypes';
import './ExamSimulation.css';

type QuizState = 'MENU' | 'OPTIONS' | 'QUIZ' | 'RESULT';
type WorkMode = 'PRACTICE' | 'EXAM';

const ExamSimulation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [currentState, setCurrentState] = useState<QuizState>('MENU');
    const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(null);
    const [selectedClass, setSelectedClass] = useState<'A-B' | 'C' | null>(null);

    // Effect to handle category from navigation state
    useEffect(() => {
        const state = location.state as { category?: ExamCategory };
        if (state?.category) {
            setSelectedCategory(state.category);
            setSelectedClass('A-B'); // Default to A-B as C is removed
            setCurrentState('OPTIONS');
        }
    }, [location.state]);

    // Options
    const [workMode, setWorkMode] = useState<WorkMode>('PRACTICE');
    const [shuffleQuestions, setShuffleQuestions] = useState(true);
    const [shuffleOptions, setShuffleOptions] = useState(true);

    // Quiz Execution
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showCorrection, setShowCorrection] = useState(false); // for practice mode

    // Helpers
    const handleCategorySelect = (category: ExamCategory, classType: 'A-B' | 'C') => {
        setSelectedCategory(category);
        setSelectedClass(classType);
        setCurrentState('OPTIONS');
    };

    const startQuiz = () => {
        if (!selectedCategory) return;

        // Deep copy questions
        let pool = JSON.parse(JSON.stringify(examData[selectedCategory]));

        if (shuffleQuestions) {
            pool = pool.sort(() => Math.random() - 0.5);
        }

        if (shuffleOptions) {
            pool.forEach((q: ExamQuestion) => {
                q.options = q.options.sort(() => Math.random() - 0.5);
            });
        }

        setQuestions(pool);
        setCurrentIndex(0);
        setAnswers({});
        setShowCorrection(false);
        setCurrentState('QUIZ');
    };

    const handleAnswerSelect = (optionId: string) => {
        if (showCorrection) return;

        setAnswers(prev => ({
            ...prev,
            [currentIndex]: optionId
        }));

        if (workMode === 'PRACTICE') {
            setShowCorrection(true);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowCorrection(false);
        } else {
            const finalScore = calculateScore();
            saveResult(finalScore);
            setCurrentState('RESULT');
        }
    };

    const saveResult = (result: any) => {
        const historyKey = 'dilaver_exam_history';
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        const newEntry = {
            id: Date.now(),
            category: selectedCategory,
            stats: result,
            date: new Date().toLocaleString('tr-TR')
        };
        const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) correct++;
        });
        return {
            correct,
            wrong: questions.length - correct,
            score: Math.round((correct / questions.length) * 100)
        };
    };

    const currentQ = questions[currentIndex];

    return (
        <div className="exam-sim-page fade-in">
            <header className="page-header">
                <div className="header-top">
                    <button className="back-button" onClick={() => {
                        if (currentState === 'MENU') navigate(-1);
                        else if (currentState === 'OPTIONS') setCurrentState('MENU');
                        else if (currentState === 'QUIZ') {
                            if (window.confirm("Sınavdan çıkmak istediğinize emin misiniz?")) setCurrentState('MENU');
                        }
                        else setCurrentState('MENU');
                    }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h2>Sınav Merkezi</h2>
                </div>
            </header>

            <div className="exam-container">
                {/* MENU STATE */}
                {currentState === 'MENU' && (
                    <div className="menu-state">
                        <h3 className="section-title">Soru Çalışması</h3>
                        <div className="category-buttons">
                            {['A-B'].map((classType) => (
                                <React.Fragment key={classType}>
                                    <button className="category-btn" onClick={() => handleCategorySelect('isletme', classType as any)}>
                                        {classType} Sınıfı İşletme
                                    </button>
                                    <button className="category-btn" onClick={() => handleCategorySelect('teknik', classType as any)}>
                                        {classType} Sınıfı Teknik
                                    </button>
                                    <button className="category-btn" onClick={() => handleCategorySelect('yonetmelik', classType as any)}>
                                        {classType} Sınıfı Ulusal ve Uluslararası Düzenlemeler
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                {/* OPTIONS STATE */}
                {currentState === 'OPTIONS' && (
                    <div className="options-state">
                        <h3 className="section-title">Seçenekler</h3>
                        <div className="options-list">
                            <div className="option-row glass">
                                <span>Çalışma Tipi</span>
                                <div className="toggle-group">
                                    <button
                                        className={`toggle-btn ${workMode === 'PRACTICE' ? 'active' : ''}`}
                                        onClick={() => setWorkMode('PRACTICE')}
                                    >Bir Yanlış Bir Doğru</button>
                                    <button
                                        className={`toggle-btn ${workMode === 'EXAM' ? 'active' : ''}`}
                                        onClick={() => setWorkMode('EXAM')}
                                    >Gerçek Sınav</button>
                                </div>
                            </div>
                            <div className="option-row glass">
                                <span>Soruları karıştır</span>
                                <div className="toggle-group">
                                    <button className={`toggle-btn ${shuffleQuestions ? 'active' : ''}`} onClick={() => setShuffleQuestions(true)}>Evet</button>
                                    <button className={`toggle-btn ${!shuffleQuestions ? 'active' : ''}`} onClick={() => setShuffleQuestions(false)}>Hayır</button>
                                </div>
                            </div>
                            <div className="option-row glass">
                                <span>Şıkları karıştır</span>
                                <div className="toggle-group">
                                    <button className={`toggle-btn ${shuffleOptions ? 'active' : ''}`} onClick={() => setShuffleOptions(true)}>Evet</button>
                                    <button className={`toggle-btn ${!shuffleOptions ? 'active' : ''}`} onClick={() => setShuffleOptions(false)}>Hayır</button>
                                </div>
                            </div>
                        </div>
                        <button className="start-btn primary" onClick={startQuiz}>Çalışmayı Başlat</button>
                    </div>
                )}

                {/* QUIZ STATE */}
                {currentState === 'QUIZ' && currentQ && (
                    <div className="quiz-state">
                        <div className="quiz-header">
                            <h4 className="quiz-title">{selectedClass} Sınıfı {selectedCategory === 'isletme' ? 'İşletme' : selectedCategory === 'teknik' ? 'Teknik' : 'Yönetmelik'} Soru Bankası</h4>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${Math.round(((currentIndex) / questions.length) * 100)}%` }}
                                ></div>
                                <span className="progress-text">{currentIndex + 1} / {questions.length}</span>
                            </div>
                        </div>

                        <div className="question-box glass fade-in">
                            <p>{currentQ.question}</p>
                        </div>

                        {currentQ.image && (
                            <div className="question-image-container glass fade-in">
                                <img
                                    src={`/${currentQ.image}`}
                                    alt={`Soru ${currentQ.originalId || currentQ.id} Görseli`}
                                    className="question-image"
                                />
                            </div>
                        )}

                        <div className="options-container">
                            {currentQ.options.map((opt) => {
                                const isSelected = answers[currentIndex] === opt.id;
                                const isCorrect = opt.id === currentQ.correctAnswer;

                                let statusClass = '';
                                if (showCorrection || workMode === 'EXAM' && isSelected) {
                                    if (isSelected && isCorrect) statusClass = 'correct';
                                    else if (isSelected && !isCorrect) statusClass = 'wrong';
                                    else if (isCorrect && showCorrection) statusClass = 'should-be-correct';
                                } else if (isSelected) {
                                    statusClass = 'selected';
                                }

                                return (
                                    <button
                                        key={opt.id}
                                        className={`option-btn ${statusClass}`}
                                        onClick={() => handleAnswerSelect(opt.id)}
                                        disabled={showCorrection}
                                    >
                                        <div className="option-checkbox">
                                            {showCorrection && isSelected && isCorrect && <Check size={16} />}
                                            {showCorrection && isSelected && !isCorrect && <X size={16} />}
                                            {showCorrection && !isSelected && isCorrect && <Check size={16} />}
                                        </div>
                                        <span>{opt.text}</span>
                                    </button>
                                )
                            })}
                        </div>

                        <div className="quiz-footer">
                            <button
                                className="next-btn primary"
                                disabled={answers[currentIndex] === undefined}
                                onClick={nextQuestion}
                            >
                                {currentIndex === questions.length - 1 ? 'Sınavı Bitir' : 'Sonraki Soru'}
                            </button>
                        </div>
                    </div>
                )}

                {/* RESULT STATE */}
                {currentState === 'RESULT' && (
                    <div className="result-state">
                        <div className="result-card glass">
                            <AlertCircle size={48} className="result-icon" />
                            <h3>Sınav Sonucu</h3>
                            <div className="result-stats">
                                <div className="stat-box">
                                    <span className="stat-value">{calculateScore().score}%</span>
                                    <span className="stat-label">Başarı</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-value">{calculateScore().correct}</span>
                                    <span className="stat-label">Doğru</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-value">{calculateScore().wrong}</span>
                                    <span className="stat-label">Yanlış</span>
                                </div>
                            </div>
                            <button className="restart-btn primary" onClick={() => setCurrentState('MENU')}>
                                Ana Menüye Dön
                            </button>

                            <div className="recent-results">
                                <h4>Son Çalışmalarınız</h4>
                                <div className="results-list">
                                    {(() => {
                                        const history = JSON.parse(localStorage.getItem('dilaver_exam_history') || '[]');
                                        const filtered = history
                                            .filter((h: any) => h.category === selectedCategory)
                                            .slice(0, 5);

                                        if (filtered.length === 0) return <p className="no-history">Henüz geçmiş kayıt yok.</p>;

                                        return filtered.map((h: any) => (
                                            <div key={h.id} className="history-item">
                                                <span className="h-date">{h.date.split(' ')[0]}</span>
                                                <span className="h-score">%{h.stats.score} Başarı</span>
                                                <span className={`h-status ${h.stats.score >= 75 ? 'pass' : 'fail'}`}>
                                                    {h.stats.score >= 75 ? 'Başarılı' : 'Yetersiz'}
                                                </span>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamSimulation;
