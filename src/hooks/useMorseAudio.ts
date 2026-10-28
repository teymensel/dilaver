import { useCallback, useRef } from 'react';

export const useMorseAudio = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    };

    const startTone = useCallback((frequency: number = 700) => {
        initAudio();
        const ctx = audioContextRef.current!;
        if (ctx.state === 'suspended') ctx.resume();

        // Stop any existing oscillator
        if (oscillatorRef.current) {
            try { oscillatorRef.current.stop(); } catch (e) { }
            oscillatorRef.current.disconnect();
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();

        oscillatorRef.current = oscillator;
        gainNodeRef.current = gainNode;
    }, []);

    const stopTone = useCallback(() => {
        const ctx = audioContextRef.current;
        if (!ctx || !oscillatorRef.current || !gainNodeRef.current) return;

        const gainNode = gainNodeRef.current;
        const oscillator = oscillatorRef.current;

        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.01);
        oscillator.stop(ctx.currentTime + 0.02);

        oscillatorRef.current = null;
        gainNodeRef.current = null;
    }, []);

    const playTone = useCallback((duration: number, frequency: number = 700) => {
        initAudio();
        const ctx = audioContextRef.current!;
        if (ctx.state === 'suspended') ctx.resume();

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration - 0.01);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
    }, []);

    const playMorse = useCallback((code: string) => {
        const dotTime = 0.1;
        const dashTime = 0.3;
        const spaceTime = 0.1;
        let currentTime = 0;

        code.split('').forEach((symbol) => {
            if (symbol === '.') {
                setTimeout(() => playTone(dotTime), currentTime * 1000);
                currentTime += dotTime + spaceTime;
            } else if (symbol === '-') {
                setTimeout(() => playTone(dashTime), currentTime * 1000);
                currentTime += dashTime + spaceTime;
            } else if (symbol === ' ') {
                currentTime += spaceTime * 2;
            }
        });
    }, [playTone]);

    return { playTone, playMorse, startTone, stopTone };
};
