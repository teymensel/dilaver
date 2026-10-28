import { type RepeaterItem } from '../data/repeaterData';

const REPEATER_SOURCE_ENDPOINT = '/api/repeater-source';

const normalizeText = (value: string) => {
    return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
};

const getCellText = (cell: HTMLTableCellElement | undefined) => {
    if (!cell) {
        return '';
    }
    return normalizeText(cell.textContent ?? '');
};

const detectRuhsat = (cell: HTMLTableCellElement | undefined) => {
    if (!cell) {
        return '-';
    }

    const imgSrc = (cell.querySelector('img')?.getAttribute('src') ?? '').toLowerCase();
    if (imgSrc.includes('save')) {
        return 'Var';
    }

    const text = getCellText(cell);
    return text || '-';
};

const detectStatus = (cell: HTMLTableCellElement | undefined) => {
    if (!cell) {
        return '-';
    }

    const imgSrc = (cell.querySelector('img')?.getAttribute('src') ?? '').toLowerCase();
    if (imgSrc.includes('antenna')) {
        return 'Çalışıyor';
    }
    if (imgSrc.includes('drop')) {
        return 'Çalışmıyor';
    }
    if (imgSrc.includes('tamir')) {
        return 'Bakım/Arıza';
    }
    if (imgSrc.includes('test')) {
        return 'Testte';
    }

    const text = getCellText(cell);
    return text || '-';
};

const buildTone = (tone: string, direction: string) => {
    const normalizedTone = normalizeText(tone);
    const normalizedDirection = normalizeText(direction);

    const toneEmpty = !normalizedTone || normalizedTone === '-' || normalizedTone.toLowerCase() === 'yok';
    const directionEmpty = !normalizedDirection || normalizedDirection === '-';

    if (toneEmpty && directionEmpty) {
        return '-';
    }

    if (directionEmpty) {
        return normalizedTone;
    }

    if (toneEmpty) {
        return normalizedDirection;
    }

    return `${normalizedTone} / ${normalizedDirection}`;
};

const parseRepeatersFromHtml = (html: string): RepeaterItem[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const rows = Array.from(doc.querySelectorAll('tr.sariarka, tr.pembearka'));

    const results: RepeaterItem[] = [];

    for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length < 11) {
            continue;
        }

        const city = getCellText(cells[0]);
        const taRegion = getCellText(cells[1]);
        const geoRegion = getCellText(cells[2]);
        const band = getCellText(cells[3]);
        const altitude = getCellText(cells[4]);
        const location = getCellText(cells[5]);
        const power = getCellText(cells[6]);
        const channel = getCellText(cells[7]);
        const frequency = getCellText(cells[8]);
        const tone = buildTone(getCellText(cells[9]), getCellText(cells[10]));
        const sql = getCellText(cells[10]) || '-';
        const license = detectRuhsat(cells[11]);
        const status = detectStatus(cells[12]);
        const locator = getCellText(cells[13]) || '-';
        const thanks = getCellText(cells[14]) || '-';
        const updatedAt = getCellText(cells[15]) || '-';

        if (!city || !band || !location || !frequency) {
            continue;
        }

        results.push({
            city,
            location,
            band,
            frequency,
            tone,
            distance: altitude || undefined,
            altitude: altitude || undefined,
            taRegion: taRegion || '-',
            geoRegion: geoRegion || '-',
            power: power || '-',
            channel: channel || '-',
            sql,
            license,
            status,
            locator,
            thanks,
            updatedAt,
        });
    }

    const unique = new Map<string, RepeaterItem>();
    for (const item of results) {
        const key = `${item.city}|${item.location}|${item.band}|${item.frequency}|${item.channel ?? ''}`;
        if (!unique.has(key)) {
            unique.set(key, item);
        }
    }

    return Array.from(unique.values()).sort((a, b) => {
        const cityCompare = a.city.localeCompare(b.city, 'tr');
        if (cityCompare !== 0) {
            return cityCompare;
        }
        return a.location.localeCompare(b.location, 'tr');
    });
};

const fetchHtml = async (): Promise<string> => {
    const response = await fetch(REPEATER_SOURCE_ENDPOINT, {
        method: 'GET',
        headers: {
            Accept: 'text/html, text/plain;q=0.9, */*;q=0.8',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    if (html.includes('<tr') && html.includes('Frekans')) {
        return html;
    }

    throw new Error('Beklenen röle tablosu içeriği bulunamadı.');
};

export const fetchLiveRepeaters = async (): Promise<RepeaterItem[]> => {
    const html = await fetchHtml();
    const repeaters = parseRepeatersFromHtml(html);

    if (repeaters.length === 0) {
        throw new Error('Canlı veri parse edilemedi.');
    }

    return repeaters;
};
