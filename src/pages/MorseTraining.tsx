import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Zap, RefreshCw, ChevronLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMorseAudio } from '../hooks/useMorseAudio';
import { turkishCities, commonNames, emergencySignals } from '../data/trainingData';
import { morseAlphabet, morseNumbers } from '../data/morseData';
import './MorseTraining.css';

type Difficulty = 'Harf' | 'İsim' | 'Şehir' | 'Acil Durum';

const DOT_THRESHOLD_MS = 180;
const CHAR_GAP_THRESHOLD_MS = 600;
const SUCCESS_ADVANCE_DELAY_MS = 320;
const ERROR_ADVANCE_DELAY_MS = 700;

const TURKISH_CHAR_MAP: Record<string, string> = {
    Ç: 'C',
    Ğ: 'G',
    İ: 'I',
    Ö: 'O',
    Ş: 'S',
    Ü: 'U',
};

const MorseTraining: React.FC = () => {
    const navigate = useNavigate();
    const { startTone, stopTone, playMorse } = useMorseAudio();

    const [difficulty, setDifficulty] = useState<Difficulty>('Harf');
    const [target, setTarget] = useState({ text: '', code: '', description: '' });
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [total, setTotal] = useState(0);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isKeying, setIsKeying] = useState(false);

    const keyStartTimeRef = useRef<number>(0);
    const charGapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isRoundResolvedRef = useRef(false);

    const morseItems = useMemo(() => [...morseAlphabet, ...morseNumbers], []);

    const charToMorseMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const item of morseItems) {
            map.set(item.char, item.code);
        }
        return map;
    }, [morseItems]);

    const morseToCharMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const item of morseItems) {
            map.set(item.code, item.char);
        }
        return map;
    }, [morseItems]);

    const clearRoundTimers = useCallback(() => {
        if (charGapTimeoutRef.current) {
            clearTimeout(charGapTimeoutRef.current);
            charGapTimeoutRef.current = null;
        }
        if (advanceTimeoutRef.current) {
            clearTimeout(advanceTimeoutRef.current);
            advanceTimeoutRef.current = null;
        }
    }, []);

    const normalizeForMorse = useCallback((text: string) => {
        return text
            .toUpperCase()
            .split('')
            .map((char) => TURKISH_CHAR_MAP[char] ?? char)
            .join('');
    }, []);

    const getMorse = useCallback(
        (text: string) => {
            const tokens: string[] = [];
            const normalizedText = normalizeForMorse(text);

            for (const char of normalizedText) {
                if (char === ' ') {
                    tokens.push('/');
                    continue;
                }
                const code = charToMorseMap.get(char);
                if (code) {
                    tokens.push(code);
                }
            }

            return tokens.join(' ');
        },
        [charToMorseMap, normalizeForMorse]
    );

    const nextTarget = useCallback(() => {
        clearRoundTimers();
        isRoundResolvedRef.current = false;
        setIsKeying(false);

        let text = '';
        let description = '';

        switch (difficulty) {
            case 'Harf':
                text = morseAlphabet[Math.floor(Math.random() * morseAlphabet.length)].char;
                break;
            case 'İsim':
                text = commonNames[Math.floor(Math.random() * commonNames.length)];
                break;
            case 'Şehir':
                text = turkishCities[Math.floor(Math.random() * turkishCities.length)];
                break;
            case 'Acil Durum': {
                const signal = emergencySignals[Math.floor(Math.random() * emergencySignals.length)];
                text = signal.code;
                description = signal.description;
                break;
            }
            default:
                text = 'SOS';
        }

        setTarget({ text, code: getMorse(text), description });
        setUserInput('');
        setIsCorrect(null);
    }, [clearRoundTimers, difficulty, getMorse]);

    useEffect(() => {
        nextTarget();
    }, [nextTarget]);

    useEffect(() => {
        return () => {
            clearRoundTimers();
            stopTone();
        };
    }, [clearRoundTimers, stopTone]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.code === 'Space' && !e.repeat) {
            e.preventDefault();
            handlePressStart();
        }
    };

    const handleKeyUp = (e: React.KeyboardEvent) => {
        if (e.code === 'Space') {
            handlePressEnd();
        }
    };

    const handlePressStart = () => {
        if (isKeying || isRoundResolvedRef.current) {
            return;
        }

        setIsKeying(true);
        startTone();
        keyStartTimeRef.current = Date.now();

        if (charGapTimeoutRef.current) {
            clearTimeout(charGapTimeoutRef.current);
            charGapTimeoutRef.current = null;
        }
    };

    const handlePressEnd = () => {
        if (!isKeying || isRoundResolvedRef.current) {
            return;
        }

        setIsKeying(false);
        stopTone();

        const duration = Date.now() - keyStartTimeRef.current;
        const symbol = duration < DOT_THRESHOLD_MS ? '.' : '-';

        setUserInput((prev) => prev + symbol);

        charGapTimeoutRef.current = setTimeout(() => {
            if (isRoundResolvedRef.current) {
                return;
            }
            setUserInput((prev) => (prev.endsWith(' ') ? prev : `${prev} `));
        }, CHAR_GAP_THRESHOLD_MS);
    };

    const normalizedInput = useMemo(() => userInput.trim().replace(/\s+/g, ' '), [userInput]);
    const normalizedTarget = useMemo(() => target.code.trim().replace(/\s+/g, ' '), [target.code]);

    const decodedInput = useMemo(() => {
        if (!normalizedInput) {
            return '';
        }

        return normalizedInput
            .split(' ')
            .map((token) => morseToCharMap.get(token) ?? '•')
            .join('');
    }, [morseToCharMap, normalizedInput]);

    useEffect(() => {
        if (!normalizedTarget || isRoundResolvedRef.current) {
            return;
        }

        const inputTokens = normalizedInput ? normalizedInput.split(' ') : [];
        const targetTokens = normalizedTarget.split(' ');

        if (!inputTokens.length) {
            return;
        }

        const hasMismatch = inputTokens.some((token, index) => {
            const expectedToken = targetTokens[index];
            if (!expectedToken) {
                return true;
            }
            return !expectedToken.startsWith(token);
        });

        if (hasMismatch) {
            isRoundResolvedRef.current = true;
            clearRoundTimers();
            setIsCorrect(false);
            setTotal((prev) => prev + 1);
            advanceTimeoutRef.current = setTimeout(nextTarget, ERROR_ADVANCE_DELAY_MS);
            return;
        }

        if (normalizedInput === normalizedTarget) {
            isRoundResolvedRef.current = true;
            clearRoundTimers();
            setIsCorrect(true);
            setScore((prev) => prev + 1);
            setTotal((prev) => prev + 1);
            advanceTimeoutRef.current = setTimeout(nextTarget, SUCCESS_ADVANCE_DELAY_MS);
            return;
        }

        setIsCorrect(null);
    }, [clearRoundTimers, nextTarget, normalizedInput, normalizedTarget]);

    return (
        <div className="training-page fade-in" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} tabIndex={0}>
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/morse')}>
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h2>Mors Antrenörü</h2>
                    <p>Pratik yap ve ustalaş</p>
                </div>
            </header>

            <div className="difficulty-tabs">
                {(['Harf', 'İsim', 'Şehir', 'Acil Durum'] as Difficulty[]).map((d) => (
                    <button key={d} className={`tab ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>
                        {d}
                    </button>
                ))}
            </div>

            <div className="training-stats-bar">
                <div className="stat-item glass">
                    <span className="stat-label">Başarı</span>
                    <span className="stat-value">
                        {score}/{total}
                    </span>
                </div>
                <div className="stat-item glass">
                    <span className="stat-label">Zorluk</span>
                    <span className="stat-value">{difficulty}</span>
                </div>
            </div>

            <div className={`training-card glass ${isCorrect === true ? 'correct' : isCorrect === false ? 'error' : ''}`}>
                <div className="target-section">
                    <span className="target-word">{target.text}</span>
                    {target.description && <p className="target-description">{target.description}</p>}
                </div>

                <div className="morse-input-display">{userInput || 'Mors kodunu girin...'}</div>

                <div className="decoded-preview" aria-live="polite">
                    <span className="decoded-label">Harfler</span>
                    <span className={`decoded-value ${decodedInput ? 'has-value' : ''}`}>{decodedInput || '—'}</span>
                </div>

                <div className="keyer-section">
                    <button
                        className={`big-keyer-pad ${isKeying ? 'active' : ''}`}
                        onMouseDown={handlePressStart}
                        onMouseUp={handlePressEnd}
                        onMouseLeave={handlePressEnd}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            handlePressStart();
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            handlePressEnd();
                        }}
                    >
                        <Zap size={32} className="key-icon" fill={isKeying ? 'white' : 'none'} />
                        <span>Maus veya Boşluk Tuşu</span>
                    </button>
                </div>

                <div className="training-controls">
                    <button className="control-btn secondary" onClick={nextTarget}>
                        <RefreshCw size={18} />
                        ATLA
                    </button>
                    <button className="control-btn secondary" onClick={() => playMorse(target.code)}>
                        <Zap size={18} />
                        DİNLE
                    </button>
                </div>
            </div>

            <div className="info-card glass">
                <AlertTriangle size={18} color="var(--primary)" />
                <p>SOS (...) (---) (...) olarak girilir. Harfler arasında kısa bir bekleme yapın.</p>
            </div>
        </div>
    );
};

export default MorseTraining;
