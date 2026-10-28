import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

const SQLITE_STORAGE_KEY = 'dilaver:cevrim:history:sqlite:v1';

export interface CevrimParticipantSnapshot {
    callSign: string;
    name: string;
    qth: string;
    time: string;
}

export interface CevrimSessionHistoryInput {
    id: string;
    sessionName: string;
    operator: string;
    startedAt: string;
    endedAt: string;
    participants: CevrimParticipantSnapshot[];
}

export interface CevrimSessionHistory extends CevrimSessionHistoryInput {
    participantCount: number;
}

let sqlJsPromise: Promise<SqlJsStatic> | null = null;
let dbPromise: Promise<Database> | null = null;

const ensureBrowser = () => {
    if (typeof window === 'undefined') {
        throw new Error('SQLite storage is available only in browser runtime.');
    }
};

const uint8ToBase64 = (bytes: Uint8Array): string => {
    let binary = '';
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }

    return window.btoa(binary);
};

const base64ToUint8 = (base64: string): Uint8Array => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
};

const loadPersistedDatabase = (): Uint8Array | null => {
    ensureBrowser();

    const serialized = window.localStorage.getItem(SQLITE_STORAGE_KEY);
    if (!serialized) {
        return null;
    }

    try {
        return base64ToUint8(serialized);
    } catch (error) {
        console.error('SQLite snapshot could not be decoded, starting with a clean database.', error);
        window.localStorage.removeItem(SQLITE_STORAGE_KEY);
        return null;
    }
};

const persistDatabase = (db: Database) => {
    ensureBrowser();

    const bytes = db.export();
    const serialized = uint8ToBase64(bytes);
    window.localStorage.setItem(SQLITE_STORAGE_KEY, serialized);
};

const createSchema = (db: Database) => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS cevrim_session_history (
            id TEXT PRIMARY KEY,
            session_name TEXT NOT NULL,
            operator TEXT NOT NULL,
            started_at TEXT NOT NULL,
            ended_at TEXT NOT NULL,
            participant_count INTEGER NOT NULL,
            participants_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_cevrim_session_history_ended_at
        ON cevrim_session_history (ended_at DESC);
    `);
};

const getSqlJs = async (): Promise<SqlJsStatic> => {
    if (!sqlJsPromise) {
        sqlJsPromise = initSqlJs({
            locateFile: () => sqlWasmUrl,
        });
    }

    return sqlJsPromise;
};

const getDatabase = async (): Promise<Database> => {
    if (!dbPromise) {
        dbPromise = (async () => {
            const SQL = await getSqlJs();
            const persisted = loadPersistedDatabase();
            const db = persisted ? new SQL.Database(persisted) : new SQL.Database();

            createSchema(db);
            persistDatabase(db);

            return db;
        })();
    }

    return dbPromise;
};

const sanitizeParticipants = (participantsJson: string): CevrimParticipantSnapshot[] => {
    try {
        const parsed = JSON.parse(participantsJson);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.map((participant) => ({
            callSign: String(participant.callSign ?? ''),
            name: String(participant.name ?? ''),
            qth: String(participant.qth ?? ''),
            time: String(participant.time ?? ''),
        }));
    } catch {
        return [];
    }
};

const normalizeSessionInput = (session: CevrimSessionHistoryInput): CevrimSessionHistoryInput => {
    return {
        id: String(session.id),
        sessionName: String(session.sessionName ?? '').trim() || 'Adsiz Cevrim',
        operator: String(session.operator ?? '').trim().toUpperCase() || '-',
        startedAt: String(session.startedAt ?? '') || new Date().toISOString(),
        endedAt: String(session.endedAt ?? '') || new Date().toISOString(),
        participants: Array.isArray(session.participants)
            ? session.participants.map((participant) => ({
                callSign: String(participant.callSign ?? '').trim().toUpperCase(),
                name: String(participant.name ?? ''),
                qth: String(participant.qth ?? ''),
                time: String(participant.time ?? ''),
            }))
            : [],
    };
};

const insertOrReplaceSession = (db: Database, session: CevrimSessionHistoryInput) => {
    const normalized = normalizeSessionInput(session);
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO cevrim_session_history (
            id,
            session_name,
            operator,
            started_at,
            ended_at,
            participant_count,
            participants_json,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
        stmt.run([
            normalized.id,
            normalized.sessionName,
            normalized.operator,
            normalized.startedAt,
            normalized.endedAt,
            normalized.participants.length,
            JSON.stringify(normalized.participants),
            new Date().toISOString(),
        ]);
    } finally {
        stmt.free();
    }
};

export const saveCevrimSessionHistory = async (session: CevrimSessionHistoryInput): Promise<void> => {
    const db = await getDatabase();
    insertOrReplaceSession(db, session);
    persistDatabase(db);
};

export const getCevrimSessionHistory = async (limit = 30): Promise<CevrimSessionHistory[]> => {
    const db = await getDatabase();

    const stmt = db.prepare(`
        SELECT
            id,
            session_name,
            operator,
            started_at,
            ended_at,
            participant_count,
            participants_json
        FROM cevrim_session_history
        ORDER BY ended_at DESC
        LIMIT ?
    `);

    const sessions: CevrimSessionHistory[] = [];

    try {
        stmt.bind([limit]);

        while (stmt.step()) {
            const row = stmt.getAsObject() as Record<string, unknown>;
            sessions.push({
                id: String(row.id ?? ''),
                sessionName: String(row.session_name ?? ''),
                operator: String(row.operator ?? ''),
                startedAt: String(row.started_at ?? ''),
                endedAt: String(row.ended_at ?? ''),
                participantCount: Number(row.participant_count ?? 0),
                participants: sanitizeParticipants(String(row.participants_json ?? '[]')),
            });
        }
    } finally {
        stmt.free();
    }

    return sessions;
};

export const getAllCevrimSessionHistory = async (): Promise<CevrimSessionHistory[]> => {
    const db = await getDatabase();

    const stmt = db.prepare(`
        SELECT
            id,
            session_name,
            operator,
            started_at,
            ended_at,
            participant_count,
            participants_json
        FROM cevrim_session_history
        ORDER BY ended_at DESC
    `);

    const sessions: CevrimSessionHistory[] = [];

    try {
        while (stmt.step()) {
            const row = stmt.getAsObject() as Record<string, unknown>;
            sessions.push({
                id: String(row.id ?? ''),
                sessionName: String(row.session_name ?? ''),
                operator: String(row.operator ?? ''),
                startedAt: String(row.started_at ?? ''),
                endedAt: String(row.ended_at ?? ''),
                participantCount: Number(row.participant_count ?? 0),
                participants: sanitizeParticipants(String(row.participants_json ?? '[]')),
            });
        }
    } finally {
        stmt.free();
    }

    return sessions;
};

export const upsertCevrimSessionHistoryBulk = async (sessions: CevrimSessionHistoryInput[]): Promise<number> => {
    const db = await getDatabase();
    let savedCount = 0;

    db.exec('BEGIN TRANSACTION');

    try {
        sessions.forEach((session) => {
            insertOrReplaceSession(db, session);
            savedCount += 1;
        });

        db.exec('COMMIT');
        persistDatabase(db);
        return savedCount;
    } catch (error) {
        db.exec('ROLLBACK');
        throw error;
    }
};

export const deleteCevrimSessionHistory = async (id: string): Promise<void> => {
    const db = await getDatabase();

    const stmt = db.prepare('DELETE FROM cevrim_session_history WHERE id = ?');

    try {
        stmt.run([id]);
    } finally {
        stmt.free();
    }

    persistDatabase(db);
};

export const clearCevrimSessionHistory = async (): Promise<void> => {
    const db = await getDatabase();
    db.exec('DELETE FROM cevrim_session_history');
    persistDatabase(db);
};
