import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Play,
    Square,
    UserPlus,
    Download,
    Trash2,
    ChevronDown,
    ChevronUp,
    Database,
    CalendarClock,
    Upload,
} from 'lucide-react';
import {
    clearCevrimSessionHistory,
    deleteCevrimSessionHistory,
    getAllCevrimSessionHistory,
    getCevrimSessionHistory,
    saveCevrimSessionHistory,
    upsertCevrimSessionHistoryBulk,
    type CevrimSessionHistory,
    type CevrimSessionHistoryInput,
} from '../services/cevrimHistoryDb';
import './Cevrim.css';

interface Participant {
    id: string;
    callSign: string;
    name: string;
    qth: string;
    time: string;
}

interface CevrimDraftValues {
    sessionName: string;
    operator: string;
}

interface ScheduledSessionPlan {
    sessionName: string;
    operator: string;
    startsAt: string;
}

type HistoryRangeFilter = 'all' | 'thisMonth' | 'thisYear';

interface EditableParticipant {
    id: string;
    callSign: string;
    name: string;
    qth: string;
    time: string;
}

interface SessionEditDraft {
    id: string;
    sessionName: string;
    operator: string;
    startedAt: string;
    endedAt: string;
    participants: EditableParticipant[];
}

const CEVRIM_DRAFT_STORAGE_KEY = 'dilaver:cevrim:draft:v1';
const CEVRIM_PLAN_STORAGE_KEY = 'dilaver:cevrim:plan:v1';

const createSessionId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const formatDateTime = (isoDate: string) => {
    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const toDateTimeLocalValue = (isoDate: string) => {
    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const pad = (value: number) => String(value).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toIsoOrNow = (value: unknown) => {
    if (typeof value === 'string') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString();
        }
    }

    return new Date().toISOString();
};

const toIsoFromDateTimeLocal = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return new Date().toISOString();
    }

    return parsed.toISOString();
};

const getStoredDraftValues = (): CevrimDraftValues => {
    if (typeof window === 'undefined') {
        return { sessionName: '', operator: '' };
    }

    try {
        const raw = window.localStorage.getItem(CEVRIM_DRAFT_STORAGE_KEY);
        if (!raw) {
            return { sessionName: '', operator: '' };
        }

        const parsed = JSON.parse(raw) as Partial<CevrimDraftValues>;
        return {
            sessionName: String(parsed.sessionName ?? ''),
            operator: String(parsed.operator ?? ''),
        };
    } catch {
        return { sessionName: '', operator: '' };
    }
};

const getStoredPlan = (): ScheduledSessionPlan | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(CEVRIM_PLAN_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as Partial<ScheduledSessionPlan>;
        if (!parsed.startsAt) {
            return null;
        }

        return {
            sessionName: String(parsed.sessionName ?? ''),
            operator: String(parsed.operator ?? ''),
            startsAt: String(parsed.startsAt ?? ''),
        };
    } catch {
        return null;
    }
};

const Cevrim: React.FC = () => {
    const initialDraft = useMemo(() => getStoredDraftValues(), []);
    const initialPlan = useMemo(() => getStoredPlan(), []);

    const [isActive, setIsActive] = useState(false);
    const [sessionName, setSessionName] = useState(initialDraft.sessionName);
    const [operator, setOperator] = useState(initialDraft.operator);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [newEntry, setNewEntry] = useState({ callSign: '', name: '', qth: '' });
    const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
    const [isEndingSession, setIsEndingSession] = useState(false);
    const [isEndModalOpen, setIsEndModalOpen] = useState(false);

    const [plannedStartAt, setPlannedStartAt] = useState(initialPlan ? toDateTimeLocalValue(initialPlan.startsAt) : '');
    const [scheduledSession, setScheduledSession] = useState<ScheduledSessionPlan | null>(initialPlan);
    const [planError, setPlanError] = useState<string | null>(null);
    const [planNotice, setPlanNotice] = useState<string | null>(null);

    const [history, setHistory] = useState<CevrimSessionHistory[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
    const [historyCallSignFilter, setHistoryCallSignFilter] = useState('');
    const [historyQthFilter, setHistoryQthFilter] = useState('');
    const [historyRangeFilter, setHistoryRangeFilter] = useState<HistoryRangeFilter>('all');
    const [historySessionFilterId, setHistorySessionFilterId] = useState('all');
    const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
    const [editingSession, setEditingSession] = useState<SessionEditDraft | null>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    const importInputRef = useRef<HTMLInputElement | null>(null);
    const longPressTimeoutRef = useRef<number | null>(null);

    const participantCountLabel = useMemo(() => `${participants.length} katılımcı`, [participants.length]);
    const sessionStartLabel = useMemo(
        () => (sessionStartedAt ? formatDateTime(sessionStartedAt) : '-'),
        [sessionStartedAt]
    );
    const normalizedSessionName = sessionName.trim();
    const normalizedOperator = operator.trim().toUpperCase();
    const isSessionNameValid = normalizedSessionName.length > 0;
    const isOperatorValid = normalizedOperator.length > 0;
    const canStartSession = isSessionNameValid && isOperatorValid;
    const hasPlanningDate = plannedStartAt.trim().length > 0;
    const canScheduleSession = canStartSession && hasPlanningDate;
    const toUpperText = useCallback((value: string) => value.toLocaleUpperCase('tr-TR'), []);
    const normalizedCallSignFilter = useMemo(() => historyCallSignFilter.trim().toLocaleUpperCase('tr-TR'), [historyCallSignFilter]);
    const normalizedQthFilter = useMemo(() => historyQthFilter.trim().toLocaleUpperCase('tr-TR'), [historyQthFilter]);
    const selectedHistoryCount = selectedHistoryIds.length;

    const historySessionOptions = useMemo(() => {
        return history.map((session) => ({
            id: session.id,
            label: `${session.sessionName} (${formatDateTime(session.endedAt)})`,
        }));
    }, [history]);

    const isInSelectedHistoryRange = useCallback(
        (dateIso: string) => {
            if (historyRangeFilter === 'all') {
                return true;
            }

            const sessionDate = new Date(dateIso);
            if (Number.isNaN(sessionDate.getTime())) {
                return false;
            }

            const now = new Date();
            const sameYear = sessionDate.getFullYear() === now.getFullYear();

            if (historyRangeFilter === 'thisYear') {
                return sameYear;
            }

            return sameYear && sessionDate.getMonth() === now.getMonth();
        },
        [historyRangeFilter]
    );

    const filteredHistory = useMemo(() => {
        return history.filter((session) => {
            if (historySessionFilterId !== 'all' && session.id !== historySessionFilterId) {
                return false;
            }

            if (!isInSelectedHistoryRange(session.endedAt)) {
                return false;
            }

            const matchesCallSign =
                normalizedCallSignFilter.length === 0 ||
                session.operator.toLocaleUpperCase('tr-TR').includes(normalizedCallSignFilter) ||
                session.participants.some((participant) =>
                    participant.callSign.toLocaleUpperCase('tr-TR').includes(normalizedCallSignFilter)
                );

            if (!matchesCallSign) {
                return false;
            }

            const matchesQth =
                normalizedQthFilter.length === 0 ||
                session.participants.some((participant) =>
                    participant.qth.toLocaleUpperCase('tr-TR').includes(normalizedQthFilter)
                );

            return matchesQth;
        });
    }, [history, historySessionFilterId, isInSelectedHistoryRange, normalizedCallSignFilter, normalizedQthFilter]);

    useEffect(() => {
        setSelectedHistoryIds((prev) => prev.filter((id) => history.some((item) => item.id === id)));
    }, [history]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const hasDraftValue = sessionName.trim().length > 0 || operator.trim().length > 0;

        if (!hasDraftValue) {
            window.localStorage.removeItem(CEVRIM_DRAFT_STORAGE_KEY);
            return;
        }

        window.localStorage.setItem(
            CEVRIM_DRAFT_STORAGE_KEY,
            JSON.stringify({
                sessionName,
                operator,
            })
        );
    }, [sessionName, operator]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (!scheduledSession) {
            window.localStorage.removeItem(CEVRIM_PLAN_STORAGE_KEY);
            return;
        }

        window.localStorage.setItem(CEVRIM_PLAN_STORAGE_KEY, JSON.stringify(scheduledSession));
    }, [scheduledSession]);

    const loadHistory = useCallback(async () => {
        setIsHistoryLoading(true);
        setHistoryError(null);

        try {
            const rows = await getCevrimSessionHistory(30);
            setHistory(rows);
        } catch (error) {
            console.error('Çevrim geçmişi yüklenemedi.', error);
            setHistoryError('Geçmiş yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
        } finally {
            setIsHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const beginSession = useCallback((name: string, op: string) => {
        setSessionName(name);
        setOperator(op);
        setIsActive(true);
        setParticipants([]);
        setSessionStartedAt(new Date().toISOString());
        setNewEntry({ callSign: '', name: '', qth: '' });
    }, []);

    const startSession = () => {
        if (!canStartSession) {
            return;
        }

        setPlanError(null);
        setPlanNotice(null);
        setScheduledSession(null);
        setPlannedStartAt('');
        beginSession(normalizedSessionName, normalizedOperator);
    };

    const cancelScheduledSession = () => {
        setScheduledSession(null);
        setPlannedStartAt('');
        setPlanError(null);
        setPlanNotice(null);
    };

    const scheduleSession = () => {
        if (!canStartSession) {
            setPlanError('Planlama için önce zorunlu alanları doldurun.');
            return;
        }

        if (!plannedStartAt) {
            setPlanError('Planlama için tarih/saat seçin.');
            return;
        }

        const startsAt = new Date(plannedStartAt);
        if (Number.isNaN(startsAt.getTime())) {
            setPlanError('Geçerli bir tarih/saat girin.');
            return;
        }

        if (startsAt.getTime() <= Date.now()) {
            setPlanError('Planlama zamanı şu andan ileri bir zaman olmalı.');
            return;
        }

        setPlanError(null);
        setPlanNotice(`Plan kaydedildi: ${formatDateTime(startsAt.toISOString())}`);
        setScheduledSession({
            sessionName: normalizedSessionName,
            operator: normalizedOperator,
            startsAt: startsAt.toISOString(),
        });
    };

    useEffect(() => {
        if (!scheduledSession || isActive) {
            return;
        }

        const startMs = new Date(scheduledSession.startsAt).getTime();
        if (Number.isNaN(startMs)) {
            cancelScheduledSession();
            return;
        }

        const triggerStart = () => {
            beginSession(scheduledSession.sessionName, scheduledSession.operator);
            cancelScheduledSession();
            setPlanNotice(`Planlanan çevrim otomatik başlatıldı: ${scheduledSession.sessionName}`);
        };

        const delayMs = startMs - Date.now();

        if (delayMs <= 0) {
            triggerStart();
            return;
        }

        const timeoutId = window.setTimeout(triggerStart, delayMs);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [beginSession, cancelScheduledSession, isActive, scheduledSession]);

    const requestEndSession = () => {
        if (isEndingSession) {
            return;
        }

        setIsEndModalOpen(true);
    };

    const endSession = async () => {
        setIsEndModalOpen(false);
        setIsEndingSession(true);

        try {
            const endedAt = new Date().toISOString();
            const normalizedSessionName = sessionName.trim() || 'Adsız Çevrim';
            const normalizedOperator = operator.trim().toUpperCase() || '-';

            await saveCevrimSessionHistory({
                id: createSessionId(),
                sessionName: normalizedSessionName,
                operator: normalizedOperator,
                startedAt: sessionStartedAt ?? endedAt,
                endedAt,
                participants: participants.map((participant) => ({
                    callSign: participant.callSign,
                    name: participant.name,
                    qth: participant.qth,
                    time: participant.time,
                })),
            });

            setIsActive(false);
            setSessionStartedAt(null);
            setParticipants([]);
            await loadHistory();
        } catch (error) {
            console.error('Çevrim kaydedilemedi.', error);
            window.alert('Çevrim geçmişi SQLite içine kaydedilemedi. Tekrar deneyin.');
        } finally {
            setIsEndingSession(false);
        }
    };

    const addParticipant = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newEntry.callSign.trim()) {
            return;
        }

        const participant: Participant = {
            id: createSessionId(),
            callSign: newEntry.callSign.toUpperCase(),
            name: newEntry.name,
            qth: newEntry.qth,
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        };

        setParticipants((prev) => [...prev, participant]);
        setNewEntry({ callSign: '', name: '', qth: '' });
    };

    const clearList = () => {
        if (window.confirm('Aktif katılımcı listesini temizlemek istiyor musunuz?')) {
            setParticipants([]);
        }
    };

    const removeHistoryItem = async (id: string) => {
        if (!window.confirm('Bu geçmiş çevrim kaydını silmek istiyor musunuz?')) {
            return;
        }

        try {
            await deleteCevrimSessionHistory(id);
            setHistory((prev) => prev.filter((item) => item.id !== id));
            if (expandedSessionId === id) {
                setExpandedSessionId(null);
            }
        } catch (error) {
            console.error('Geçmiş çevrim silinemedi.', error);
            window.alert('Kayıt silinemedi. Tekrar deneyin.');
        }
    };

    const clearHistory = async () => {
        if (!window.confirm('Tüm çevrim geçmişi silinsin mi?')) {
            return;
        }

        try {
            await clearCevrimSessionHistory();
            setHistory([]);
            setExpandedSessionId(null);
        } catch (error) {
            console.error('Geçmiş temizlenemedi.', error);
            window.alert('Geçmiş temizlenemedi. Tekrar deneyin.');
        }
    };

    const toggleHistoryDetails = (id: string) => {
        setExpandedSessionId((prev) => (prev === id ? null : id));
    };

    const toggleHistorySelection = useCallback((id: string) => {
        setSelectedHistoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }, []);

    const clearHistorySelection = () => {
        setSelectedHistoryIds([]);
    };

    const isInteractiveTarget = (target: EventTarget | null) => {
        if (!(target instanceof HTMLElement)) {
            return false;
        }

        return Boolean(target.closest('button,input,select,textarea,a,label'));
    };

    const handleHistoryTouchStart = (id: string, event: React.TouchEvent<HTMLElement>) => {
        if (isInteractiveTarget(event.target)) {
            return;
        }

        if (longPressTimeoutRef.current) {
            window.clearTimeout(longPressTimeoutRef.current);
        }

        longPressTimeoutRef.current = window.setTimeout(() => {
            toggleHistorySelection(id);
            longPressTimeoutRef.current = null;
        }, 450);
    };

    const handleHistoryTouchEnd = () => {
        if (longPressTimeoutRef.current) {
            window.clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
        }
    };

    const openEditSession = (session: CevrimSessionHistory) => {
        setEditError(null);
        setEditingSession({
            id: session.id,
            sessionName: session.sessionName,
            operator: session.operator,
            startedAt: toDateTimeLocalValue(session.startedAt),
            endedAt: toDateTimeLocalValue(session.endedAt),
            participants: session.participants.map((participant) => ({
                id: createSessionId(),
                callSign: participant.callSign,
                name: participant.name,
                qth: participant.qth,
                time: participant.time,
            })),
        });
    };

    const closeEditSession = () => {
        if (isSavingEdit) {
            return;
        }

        setEditingSession(null);
        setEditError(null);
    };

    const updateEditingSessionField = (field: 'sessionName' | 'operator' | 'startedAt' | 'endedAt', value: string) => {
        setEditingSession((prev) => {
            if (!prev) {
                return prev;
            }

            return { ...prev, [field]: value };
        });
    };

    const updateEditingParticipant = (
        participantId: string,
        field: 'callSign' | 'name' | 'qth' | 'time',
        value: string
    ) => {
        setEditingSession((prev) => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                participants: prev.participants.map((participant) =>
                    participant.id === participantId ? { ...participant, [field]: value } : participant
                ),
            };
        });
    };

    const addEditingParticipant = () => {
        setEditingSession((prev) => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                participants: [
                    ...prev.participants,
                    {
                        id: createSessionId(),
                        callSign: '',
                        name: '',
                        qth: '',
                        time: '',
                    },
                ],
            };
        });
    };

    const removeEditingParticipant = (participantId: string) => {
        setEditingSession((prev) => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                participants: prev.participants.filter((participant) => participant.id !== participantId),
            };
        });
    };

    const saveEditedSession = async () => {
        if (!editingSession) {
            return;
        }

        const normalizedName = editingSession.sessionName.trim();
        const normalizedOperator = editingSession.operator.trim().toUpperCase();

        if (!normalizedName || !normalizedOperator) {
            setEditError('Çevrim adı ve operatör çağrı işareti zorunludur.');
            return;
        }

        setIsSavingEdit(true);
        setEditError(null);

        try {
            await saveCevrimSessionHistory({
                id: editingSession.id,
                sessionName: normalizedName,
                operator: normalizedOperator,
                startedAt: toIsoFromDateTimeLocal(editingSession.startedAt),
                endedAt: toIsoFromDateTimeLocal(editingSession.endedAt),
                participants: editingSession.participants.map((participant) => ({
                    callSign: participant.callSign.trim().toUpperCase(),
                    name: participant.name.trim().toUpperCase(),
                    qth: participant.qth.trim().toUpperCase(),
                    time: participant.time.trim(),
                })),
            });

            await loadHistory();
            setEditingSession(null);
        } catch (error) {
            console.error('Çevrim düzenleme kaydedilemedi.', error);
            setEditError('Düzenleme kaydedilemedi. Tekrar deneyin.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    const exportHistory = useCallback(async () => {
        try {
            const allRows = await getAllCevrimSessionHistory();
            if (allRows.length === 0) {
                window.alert('Dışa aktarılacak bir çevrim geçmişi yok.');
                return;
            }

            const rowsToExport =
                selectedHistoryIds.length > 0
                    ? allRows.filter((row) => selectedHistoryIds.includes(row.id))
                    : allRows;

            if (rowsToExport.length === 0) {
                window.alert('Seçili çevrim bulunamadı. Lütfen seçimleri kontrol edin.');
                return;
            }

            const payload = {
                version: 1,
                exportedAt: new Date().toISOString(),
                sessions: rowsToExport,
            };

            const json = JSON.stringify(payload, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const anchor = document.createElement('a');
            const stamp = new Date().toISOString().replace(/[:.]/g, '-');
            anchor.href = url;
            anchor.download = `cevrim-gecmisi-${stamp}.json`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Dışa aktarma başarısız.', error);
            window.alert('Dışa aktarma yapılamadı. Tekrar deneyin.');
        }
    }, [selectedHistoryIds]);

    const openImportPicker = () => {
        importInputRef.current?.click();
    };

    const normalizeImportedSessions = (raw: unknown): CevrimSessionHistoryInput[] => {
        const sourceList = Array.isArray(raw)
            ? raw
            : raw && typeof raw === 'object' && Array.isArray((raw as { sessions?: unknown[] }).sessions)
                ? (raw as { sessions: unknown[] }).sessions
                : [];

        return sourceList
            .map((item) => {
                if (!item || typeof item !== 'object') {
                    return null;
                }

                const record = item as Record<string, unknown>;
                const participantsRaw = Array.isArray(record.participants) ? record.participants : [];

                return {
                    id: typeof record.id === 'string' && record.id.trim() ? record.id : createSessionId(),
                    sessionName:
                        typeof record.sessionName === 'string' && record.sessionName.trim()
                            ? record.sessionName.trim()
                            : 'Adsiz Cevrim',
                    operator:
                        typeof record.operator === 'string' && record.operator.trim()
                            ? record.operator.trim().toUpperCase()
                            : '-',
                    startedAt: toIsoOrNow(record.startedAt),
                    endedAt: toIsoOrNow(record.endedAt),
                    participants: participantsRaw.map((participant) => {
                        const row = participant as Record<string, unknown>;
                        return {
                            callSign: String(row.callSign ?? '').trim().toUpperCase(),
                            name: String(row.name ?? ''),
                            qth: String(row.qth ?? ''),
                            time: String(row.time ?? ''),
                        };
                    }),
                } as CevrimSessionHistoryInput;
            })
            .filter((item): item is CevrimSessionHistoryInput => item !== null);
    };

    const handleImportHistory = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';

        if (!file) {
            return;
        }

        try {
            const text = await file.text();
            const parsed = JSON.parse(text) as unknown;
            const sessions = normalizeImportedSessions(parsed);

            if (sessions.length === 0) {
                window.alert('Geçerli bir çevrim geçmişi bulunamadı.');
                return;
            }

            const importedCount = await upsertCevrimSessionHistoryBulk(sessions);
            await loadHistory();
            window.alert(`${importedCount} çevrim kaydı içe aktarıldı.`);
        } catch (error) {
            console.error('İçe aktarma başarısız.', error);
            window.alert('Dosya içe aktarılamadı. JSON formatını kontrol edin.');
        }
    };

    return (
        <div className="cevrim-page fade-in">
            <header className="page-header">
                <h2>Telsiz Çevrim Modu</h2>
                <p>Aktif operatör ve katılımcı takibi</p>
            </header>

            {!isActive ? (
                <div className="setup-card glass">
                    <h3>Yeni Çevrim Başlat</h3>
                    <div className="form-group">
                        <label>
                            Çevrim Adı <span className="required-mark">*</span>
                        </label>
                        <input
                            value={sessionName}
                            onChange={(e) => setSessionName(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="Örn: Akdeniz Net"
                            aria-invalid={!isSessionNameValid}
                        />
                        {!isSessionNameValid && <p className="form-hint-error">Çevrim adı zorunludur.</p>}
                    </div>
                    <div className="form-group">
                        <label>
                            Operatör Çağrı İşareti <span className="required-mark">*</span>
                        </label>
                        <input
                            value={operator}
                            onChange={(e) => setOperator(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="Örn: TA1ABC"
                            aria-invalid={!isOperatorValid}
                        />
                        {!isOperatorValid && <p className="form-hint-error">Operatör çağrı işareti zorunludur.</p>}
                    </div>

                    <div className="planner-group">
                        <label>Çevrim Planla (Opsiyonel)</label>
                        <input
                            type="datetime-local"
                            value={plannedStartAt}
                            onChange={(e) => setPlannedStartAt(e.target.value)}
                        />
                        <div className="planner-actions">
                            <button className="plan-btn" type="button" onClick={scheduleSession} disabled={!canScheduleSession}>
                                <CalendarClock size={18} />
                                ÇEVRİM PLANLA
                            </button>
                            {scheduledSession && (
                                <button className="plan-cancel-btn" type="button" onClick={cancelScheduledSession}>
                                    Planı İptal Et
                                </button>
                            )}
                        </div>
                        {!canStartSession && (
                            <p className="plan-hint">Planlama için önce yıldızlı zorunlu alanları doldurun.</p>
                        )}
                        {!hasPlanningDate && <p className="plan-hint">Planlama tarihi girmezseniz plan oluşturulmaz.</p>}
                        {planError && <p className="plan-error">{planError}</p>}
                        {planNotice && <p className="plan-info">{planNotice}</p>}
                        {scheduledSession && (
                            <p className="plan-info">
                                Planlandı: <strong>{scheduledSession.sessionName}</strong> ({scheduledSession.operator}) -{' '}
                                {formatDateTime(scheduledSession.startsAt)}
                            </p>
                        )}
                    </div>

                    <button className="start-btn" onClick={startSession} disabled={!canStartSession}>
                        <Play size={20} fill="currentColor" />
                        ÇEVRİMİ BAŞLAT
                    </button>
                </div>
            ) : (
                <div className="active-session">
                    <div className="session-stats glass">
                        <div className="stat">
                            <span className="label">Operatör</span>
                            <span className="value">{operator.toUpperCase()}</span>
                        </div>
                        <div className="stat">
                            <span className="label">Katılımcı</span>
                            <span className="value">{participantCountLabel}</span>
                        </div>
                        <div className="stat stat-start-time">
                            <span className="label">Başlangıç</span>
                            <span className="value value-small">{sessionStartLabel}</span>
                        </div>
                        <button className="stop-btn" onClick={requestEndSession} disabled={isEndingSession}>
                            <Square size={16} fill="currentColor" />
                            {isEndingSession ? 'KAYDEDİLİYOR' : 'BİTİR'}
                        </button>
                    </div>

                    <form className="quick-entry glass" onSubmit={addParticipant}>
                        <input
                            placeholder="Çağrı Kodu"
                            value={newEntry.callSign}
                            onChange={(e) => setNewEntry({ ...newEntry, callSign: toUpperText(e.target.value) })}
                            required
                        />
                        <input
                            placeholder="İsim"
                            value={newEntry.name}
                            onChange={(e) => setNewEntry({ ...newEntry, name: toUpperText(e.target.value) })}
                        />
                        <input
                            placeholder="QTH (Konum)"
                            value={newEntry.qth}
                            onChange={(e) => setNewEntry({ ...newEntry, qth: toUpperText(e.target.value) })}
                        />
                        <button type="submit" className="add-p-btn">
                            <UserPlus size={20} />
                        </button>
                    </form>

                    <div className="participant-table-wrapper glass">
                        <table className="participant-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>ÇAĞRI İŞARETİ</th>
                                    <th>İSİM</th>
                                    <th>QTH</th>
                                    <th>SAAT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p, index) => (
                                    <tr key={p.id}>
                                        <td>{index + 1}</td>
                                        <td className="call">{p.callSign}</td>
                                        <td>{p.name}</td>
                                        <td>{p.qth}</td>
                                        <td className="time">{p.time}</td>
                                    </tr>
                                ))}
                                {participants.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="empty-row">
                                            Henüz kimse eklenmedi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="session-actions">
                        <button className="action-btn" onClick={clearList}>
                            <Trash2 size={18} />
                            Temizle
                        </button>
                        <button className="action-btn" onClick={exportHistory}>
                            <Download size={18} />
                            Dışa Aktar
                        </button>
                        <button className="action-btn" onClick={openImportPicker}>
                            <Upload size={18} />
                            İçe Aktar
                        </button>
                    </div>
                </div>
            )}

            <section className="history-section glass">
                <div className="history-header">
                    <div>
                        <h3>Eski Çevrimlerim</h3>
                        <p>SQLite tabanlı olarak cihazda saklanır. Gösterilen: {filteredHistory.length}/{history.length}</p>
                        <p className="history-selection-hint">
                            Seçim: {selectedHistoryCount} kayıt (mobilde uzun bas, masaüstünde çift tık)
                        </p>
                    </div>
                    <div className="history-header-actions">
                        <button className="history-clear-btn" onClick={exportHistory} disabled={history.length === 0}>
                            <Download size={16} />
                            {selectedHistoryCount > 0 ? `Seçileni Dışa Aktar (${selectedHistoryCount})` : 'Tümünü Dışa Aktar'}
                        </button>
                        <button className="history-clear-btn" onClick={openImportPicker}>
                            <Upload size={16} />
                            İçe Aktar
                        </button>
                        <button
                            className="history-clear-btn"
                            onClick={clearHistorySelection}
                            disabled={selectedHistoryCount === 0}
                        >
                            Seçimi Temizle
                        </button>
                        <button className="history-clear-btn" onClick={clearHistory} disabled={history.length === 0}>
                            <Database size={16} />
                            Geçmişi Sil
                        </button>
                    </div>
                </div>

                <div className="history-filters">
                    <select
                        className="history-filter-select"
                        value={historySessionFilterId}
                        onChange={(e) => setHistorySessionFilterId(e.target.value)}
                    >
                        <option value="all">Tüm Çevrim Adları</option>
                        {historySessionOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <input
                        className="history-filter-input"
                        placeholder="Çağrı işareti ara (örn: TA1)"
                        value={historyCallSignFilter}
                        onChange={(e) => setHistoryCallSignFilter(toUpperText(e.target.value))}
                    />
                    <input
                        className="history-filter-input"
                        placeholder="QTH/Bölge filtrele (örn: İSTANBUL)"
                        value={historyQthFilter}
                        onChange={(e) => setHistoryQthFilter(toUpperText(e.target.value))}
                    />
                    <select
                        className="history-filter-select"
                        value={historyRangeFilter}
                        onChange={(e) => setHistoryRangeFilter(e.target.value as HistoryRangeFilter)}
                    >
                        <option value="all">Tüm Çevrimler</option>
                        <option value="thisMonth">Bu Ay</option>
                        <option value="thisYear">Bu Yıl</option>
                    </select>
                </div>

                <input
                    ref={importInputRef}
                    className="hidden-file-input"
                    type="file"
                    accept="application/json"
                    onChange={handleImportHistory}
                />

                {isHistoryLoading && <p className="history-state">Geçmiş yükleniyor...</p>}
                {historyError && <p className="history-state error">{historyError}</p>}

                {!isHistoryLoading && !historyError && history.length === 0 && (
                    <p className="history-state">Kayıtlı çevrim bulunmuyor.</p>
                )}

                {!isHistoryLoading && !historyError && history.length > 0 && filteredHistory.length === 0 && (
                    <p className="history-state">Filtreye uygun çevrim bulunamadı.</p>
                )}

                {!isHistoryLoading && !historyError && filteredHistory.length > 0 && (
                    <div className="history-list">
                        {filteredHistory.map((item) => {
                            const isExpanded = expandedSessionId === item.id;
                            const isSelected = selectedHistoryIds.includes(item.id);

                            return (
                                <article
                                    key={item.id}
                                    className={`history-item ${isSelected ? 'selected' : ''}`}
                                    onDoubleClick={(event) => {
                                        if (!isInteractiveTarget(event.target)) {
                                            toggleHistorySelection(item.id);
                                        }
                                    }}
                                    onTouchStart={(event) => handleHistoryTouchStart(item.id, event)}
                                    onTouchEnd={handleHistoryTouchEnd}
                                    onTouchCancel={handleHistoryTouchEnd}
                                >
                                    <div className="history-item-top">
                                        <div className="history-item-meta">
                                            <h4>{item.sessionName}</h4>
                                            <p>
                                                Operatör: <strong>{item.operator}</strong>
                                            </p>
                                            <p>
                                                Başlangıç: {formatDateTime(item.startedAt)} | Bitiş: {formatDateTime(item.endedAt)}
                                            </p>
                                            <span className="history-badge">{item.participantCount} katılımcı</span>
                                        </div>
                                        <div className="history-item-actions">
                                            <button
                                                className={`history-select-btn ${isSelected ? 'active' : ''}`}
                                                onClick={() => toggleHistorySelection(item.id)}
                                            >
                                                {isSelected ? 'Seçili' : 'Seç'}
                                            </button>
                                            <button className="history-toggle-btn" onClick={() => toggleHistoryDetails(item.id)}>
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                {isExpanded ? 'Gizle' : 'Detay'}
                                            </button>
                                            <button className="history-toggle-btn" onClick={() => openEditSession(item)}>
                                                Düzenle
                                            </button>
                                            <button className="history-delete-btn" onClick={() => removeHistoryItem(item.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="history-details">
                                            {item.participants.length === 0 ? (
                                                <p className="history-empty">Bu çevrimde katılımcı kaydı yok.</p>
                                            ) : (
                                                <table className="history-table">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>ÇAĞRI</th>
                                                            <th>İSİM</th>
                                                            <th>QTH</th>
                                                            <th>SAAT</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {item.participants.map((participant, index) => (
                                                            <tr key={`${item.id}-${participant.callSign}-${index}`}>
                                                                <td>{index + 1}</td>
                                                                <td>{participant.callSign}</td>
                                                                <td>{participant.name || '-'}</td>
                                                                <td>{participant.qth || '-'}</td>
                                                                <td>{participant.time || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {isEndModalOpen && (
                <div className="confirm-overlay" role="dialog" aria-modal="true">
                    <div className="confirm-modal glass">
                        <h4>Çevrimi Bitir</h4>
                        <p>Çevrimi sonlandırmak istediğinize emin misiniz?</p>
                        <div className="confirm-modal-actions">
                            <button
                                type="button"
                                className="confirm-cancel-btn"
                                onClick={() => setIsEndModalOpen(false)}
                                disabled={isEndingSession}
                            >
                                Vazgeç
                            </button>
                            <button type="button" className="confirm-stop-btn" onClick={endSession} disabled={isEndingSession}>
                                Sonlandır
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingSession && (
                <div className="confirm-overlay" role="dialog" aria-modal="true">
                    <div className="edit-modal glass">
                        <h4>Çevrim Düzenle</h4>

                        <div className="edit-grid">
                            <div className="edit-field">
                                <label>Çevrim Adı</label>
                                <input
                                    value={editingSession.sessionName}
                                    onChange={(e) => updateEditingSessionField('sessionName', e.target.value)}
                                />
                            </div>
                            <div className="edit-field">
                                <label>Operatör</label>
                                <input
                                    value={editingSession.operator}
                                    onChange={(e) => updateEditingSessionField('operator', toUpperText(e.target.value))}
                                />
                            </div>
                            <div className="edit-field">
                                <label>Başlangıç</label>
                                <input
                                    type="datetime-local"
                                    value={editingSession.startedAt}
                                    onChange={(e) => updateEditingSessionField('startedAt', e.target.value)}
                                />
                            </div>
                            <div className="edit-field">
                                <label>Bitiş</label>
                                <input
                                    type="datetime-local"
                                    value={editingSession.endedAt}
                                    onChange={(e) => updateEditingSessionField('endedAt', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="edit-participants">
                            <div className="edit-participants-head">
                                <span>Katılımcılar</span>
                                <button type="button" className="edit-add-btn" onClick={addEditingParticipant}>
                                    + Katılımcı Ekle
                                </button>
                            </div>
                            <div className="edit-participants-list">
                                {editingSession.participants.map((participant) => (
                                    <div key={participant.id} className="edit-participant-row">
                                        <input
                                            placeholder="Çağrı"
                                            value={participant.callSign}
                                            onChange={(e) =>
                                                updateEditingParticipant(
                                                    participant.id,
                                                    'callSign',
                                                    toUpperText(e.target.value)
                                                )
                                            }
                                        />
                                        <input
                                            placeholder="İsim"
                                            value={participant.name}
                                            onChange={(e) =>
                                                updateEditingParticipant(participant.id, 'name', toUpperText(e.target.value))
                                            }
                                        />
                                        <input
                                            placeholder="QTH"
                                            value={participant.qth}
                                            onChange={(e) =>
                                                updateEditingParticipant(participant.id, 'qth', toUpperText(e.target.value))
                                            }
                                        />
                                        <input
                                            placeholder="Saat"
                                            value={participant.time}
                                            onChange={(e) => updateEditingParticipant(participant.id, 'time', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="edit-remove-btn"
                                            onClick={() => removeEditingParticipant(participant.id)}
                                        >
                                            Sil
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {editError && <p className="plan-error">{editError}</p>}

                        <div className="confirm-modal-actions">
                            <button
                                type="button"
                                className="confirm-cancel-btn"
                                onClick={closeEditSession}
                                disabled={isSavingEdit}
                            >
                                Vazgeç
                            </button>
                            <button
                                type="button"
                                className="confirm-stop-btn"
                                onClick={saveEditedSession}
                                disabled={isSavingEdit}
                            >
                                {isSavingEdit ? 'Kaydediliyor' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cevrim;
