import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Volume2, Zap, Eraser } from 'lucide-react';
import { morseAlphabet, morseNumbers } from '../data/morseData';
import { useMorseAudio } from '../hooks/useMorseAudio';
import './Morse.css';

const DOT_THRESHOLD_MS = 180;
const CHAR_GAP_MS = 600;

const Morse: React.FC = () => {
    const navigate = useNavigate();
    const { playMorse, startTone, stopTone } = useMorseAudio();

    const [isKeying, setIsKeying] = useState(false);
    const [practiceInput, setPracticeInput] = useState('');

    const pressStartRef = useRef<number>(0);
    const isKeyingRef = useRef(false);
    const charGapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const morseToCharMap = useMemo(() => {
        const map = new Map<string, string>();
        [...morseAlphabet, ...morseNumbers].forEach((item) => {
            map.set(item.code, item.char);
        });
        return map;
    }, []);

    const clearCharGapTimeout = useCallback(() => {
        if (charGapTimeoutRef.current) {
            clearTimeout(charGapTimeoutRef.current);
            charGapTimeoutRef.current = null;
        }
    }, []);

    const clearPracticeInput = useCallback(() => {
        isKeyingRef.current = false;
        setIsKeying(false);
        clearCharGapTimeout();
        stopTone();
        setPracticeInput('');
    }, [clearCharGapTimeout, stopTone]);

    const handlePressStart = useCallback(() => {
        if (isKeyingRef.current) {
            return;
        }

        isKeyingRef.current = true;
        setIsKeying(true);
        pressStartRef.current = Date.now();
        clearCharGapTimeout();
        startTone();
    }, [clearCharGapTimeout, startTone]);

    const handlePressEnd = useCallback(() => {
        if (!isKeyingRef.current) {
            return;
        }

        isKeyingRef.current = false;
        setIsKeying(false);
        stopTone();

        const duration = Date.now() - pressStartRef.current;
        const symbol = duration < DOT_THRESHOLD_MS ? '.' : '-';

        setPracticeInput((prev) => prev + symbol);

        charGapTimeoutRef.current = setTimeout(() => {
            setPracticeInput((prev) => (prev.endsWith(' ') ? prev : `${prev} `));
        }, CHAR_GAP_MS);
    }, [stopTone]);

    const normalizedPracticeInput = useMemo(
        () => practiceInput.trim().replace(/\s+/g, ' '),
        [practiceInput]
    );

    const decodedPracticeText = useMemo(() => {
        if (!normalizedPracticeInput) {
            return '';
        }

        return normalizedPracticeInput
            .split(' ')
            .map((token) => morseToCharMap.get(token) ?? '•')
            .join('');
    }, [morseToCharMap, normalizedPracticeInput]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.code !== 'Space' || event.repeat) {
                return;
            }

            event.preventDefault();
            handlePressStart();
        };

        const onKeyUp = (event: KeyboardEvent) => {
            if (event.code !== 'Space') {
                return;
            }

            event.preventDefault();
            handlePressEnd();
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            clearCharGapTimeout();
            stopTone();
        };
    }, [clearCharGapTimeout, handlePressEnd, handlePressStart, stopTone]);

    return (
        <div className="morse-page fade-in">
            <header className="page-header">
                <div>
                    <h2>Mors Kodları</h2>
                    <p>Dinle ve Alıştırma Yap</p>
                </div>
                <button className="training-btn" onClick={() => navigate('/morse-training')}>
                    <Zap size={18} fill="currentColor" />
                    Antrenman Yap
                </button>
            </header>

            <div className="interactive-keyer glass">
                <div className="keyer-header">
                    <Volume2 size={18} />
                    <span>İnteraktif Çalışma (Kısa: . Uzun: - / Space destekli)</span>
                </div>
                <button
                    className={`keyer-pad ${isKeying ? 'active' : ''}`}
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
                    BAS - BIRAK
                </button>

                <button className="keyer-clear-btn" onClick={clearPracticeInput}>
                    <Eraser size={16} />
                    Sil
                </button>

                <div className="keyer-output" aria-live="polite">
                    {practiceInput || 'Çıktı: . ve - buraya yazılır'}
                </div>

                <div className="keyer-decoded" aria-live="polite">
                    Harfler: {decodedPracticeText || '—'}
                </div>
            </div>

            <div className="morse-category">
                <h3>Alfabe</h3>
                <div className="morse-grid">
                    {morseAlphabet.map((item) => (
                        <button key={item.char} className="morse-card glass" onClick={() => playMorse(item.code)}>
                            <span className="morse-char">{item.char.toLowerCase()}</span>
                            <span className="morse-code">{item.code}</span>
                            <div className="play-hint">
                                <Play size={10} fill="currentColor" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="morse-category">
                <h3>Rakamlar</h3>
                <div className="morse-grid">
                    {morseNumbers.map((item) => (
                        <button key={item.char} className="morse-card glass" onClick={() => playMorse(item.code)}>
                            <span className="morse-char">{item.char}</span>
                            <span className="morse-code">{item.code}</span>
                            <div className="play-hint">
                                <Play size={10} fill="currentColor" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Morse;
