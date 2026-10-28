const { PDFExtract } = require('pdf.js-extract');
const fs = require('fs');
const path = require('path');

const extract = new PDFExtract();

const pdfs = [
    { id: 'isletme', path: 'public/isletme-1.pdf', title: 'İşletme', maxQ: 151 },
    { id: 'teknik', path: 'public/teknik-1.pdf', title: 'Teknik', maxQ: 172 },
    { id: 'yonetmelik', path: 'public/yonetmelik.pdf', title: 'Yönetmelik', maxQ: 67 }
];

function cleanText(text) {
    if (!text) return '';
    let t = text;
    // PDF extraction fixes (KEGM specific)
    t = t.replace(/\u0122/g, 'ş'); // Ģ -> ş
    t = t.replace(/\u0121/g, 'Ş'); // ġ -> Ş
    t = t.replace(/\u0120/g, 'İ'); // Ġ -> İ

    // Typographic fixes
    t = t.replace(/\u201f/g, '"'); // ‟ -> "
    t = t.replace(/\u201c/g, '"'); // “ -> "
    t = t.replace(/\u201d/g, '"'); // ” -> "
    t = t.replace(/\u2019/g, "'"); // ’ -> '
    t = t.replace(/\u2013/g, "-"); // – -> -
    t = t.replace(/\u2212/g, "-"); // − -> -

    // Spaces
    return t.replace(/\s+/g, ' ').trim();
}

const teknikAnswerKey = {
    1: "A", 2: "A", 3: "B", 4: "A", 5: "D", 6: "D", 7: "B", 8: "A", 9: "A", 10: "A",
    11: "C", 12: "B", 13: "B", 14: "A", 15: "A", 16: "D", 17: "D", 18: "C", 19: "B", 20: "D",
    21: "B", 22: "A", 23: "A", 24: "C", 25: "D", 26: "D", 27: "C", 28: "B", 29: "D", 30: "C",
    31: "C", 32: "C", 33: "A", 34: "B", 35: "D", 36: "D", 37: "B", 38: "D", 39: "C", 40: "A",
    41: "B", 42: "D", 43: "C", 44: "C", 45: "A", 46: "C", 47: "D", 48: "C", 49: "D", 50: "C",
    51: "B", 52: "B", 53: "C", 54: "C", 55: "C", 56: "B", 57: "A", 58: "A", 59: "D", 60: "A",
    61: "B", 62: "A", 63: "D", 64: "B", 65: "A", 66: "B", 67: "B", 68: "C", 69: "B", 70: "A",
    71: "B", 72: "A", 73: "B", 74: "D", 75: "B", 76: "A", 77: "B", 78: "D", 79: "D", 80: "B",
    81: "D", 82: "B", 83: "C", 84: "A", 85: "D", 86: "A", 87: "D", 88: "B", 89: "B", 90: "A",
    91: "C", 92: "A", 93: "D", 94: "C", 95: "B", 96: "A", 97: "A", 98: "C", 99: "C", 100: "C",
    101: "A", 102: "B", 103: "A", 104: "A", 105: "C", 106: "A", 107: "A", 108: "C", 109: "D", 110: "A",
    111: "C", 112: "D", 113: "C", 114: "B", 115: "C", 116: "C", 117: "A", 118: "B", 119: "B", 120: "B",
    121: "C", 122: "A", 123: "C", 124: "C", 125: "A", 126: "B", 127: "D", 128: "B", 129: "C", 130: "A",
    131: "D", 132: "C", 133: "B", 134: "D", 135: "C", 136: "D", 137: "A", 138: "B", 139: "A", 140: "B",
    141: "A", 142: "C", 143: "D", 144: "D", 145: "A", 146: "A", 147: "B", 148: "D", 149: "C", 150: "D",
    151: "B", 152: "A", 153: "A", 154: "A", 155: "C", 156: "C", 157: "A", 158: "A", 159: "B", 160: "D",
    161: "C", 162: "A", 163: "A", 164: "A", 165: "C", 166: "C", 167: "A", 168: "A", 169: "C", 170: "C",
    171: "D", 172: "D"
};

const yonetmelikAnswerKey = {
    1: "C", 2: "A", 3: "C", 4: "A", 5: "C", 6: "A", 7: "B", 8: "A", 9: "D", 10: "A",
    11: "C", 12: "A", 13: "B", 14: "A", 15: "A", 16: "C", 17: "B", 18: "A", 19: "D", 20: "B",
    21: "B", 22: "D", 23: "B", 24: "B", 25: "C", 26: "B", 27: "A", 28: "D", 29: "C", 30: "D",
    31: "C", 32: "A", 33: "B", 34: "A", 35: "C", 36: "C", 37: "B", 38: "D", 39: "B", 40: "A",
    41: "C", 42: "A", 43: "D", 44: "D", 45: "A", 46: "C", 47: "D", 48: "D", 49: "C", 50: "D",
    51: "D", 52: "A", 53: "A", 54: "C", 55: "B", 56: "C", 57: "B", 58: "B", 59: "C", 60: "B",
    61: "C", 62: "C", 63: "A", 64: "B", 65: "C", 66: "C", 67: "D"
};

const isletmeAnswerKey = {
    1: "C", 2: "C", 3: "A", 4: "B", 5: "B", 6: "D", 7: "B", 8: "C", 9: "B", 10: "B",
    11: "D", 12: "B", 13: "A", 14: "D", 15: "A", 16: "C", 17: "A", 18: "C", 19: "B", 20: "B",
    21: "C", 22: "C", 23: "D", 24: "B", 25: "A", 26: "A", 27: "B", 28: "C", 29: "C", 30: "A",
    31: "D", 32: "C", 33: "B", 34: "D", 35: "C", 36: "D", 37: "C", 38: "C", 39: "C", 40: "B",
    41: "B", 42: "D", 43: "B", 44: "B", 45: "A", 46: "B", 47: "B", 48: "C", 49: "B", 50: "C",
    51: "B", 52: "D", 53: "D", 54: "C", 55: "B", 56: "A", 57: "C", 58: "A", 59: "D", 60: "D",
    61: "B", 62: "C", 63: "D", 64: "D", 65: "C", 66: "C", 67: "A", 68: "C", 69: "B", 70: "A",
    71: "A", 72: "A", 73: "D", 74: "C", 75: "D", 76: "D", 77: "D", 78: "B", 79: "A", 80: "B",
    81: "B", 82: "B", 83: "C", 84: "D", 85: "B", 86: "C", 87: "C", 88: "C", 89: "B", 90: "D",
    91: "C", 92: "A", 93: "A", 94: "C", 95: "C", 96: "A", 97: "A", 98: "D", 99: "D", 100: "B",
    101: "A", 102: "A", 103: "C", 104: "C", 105: "D", 106: "C", 107: "B", 108: "C", 109: "D", 110: "C",
    111: "B", 112: "C", 113: "B", 114: "A", 115: "A", 116: "A", 117: "A", 118: "B", 119: "A", 120: "C",
    121: "B", 122: "D", 123: "A", 124: "D", 125: "D", 126: "A", 127: "B", 128: "D", 129: "A", 130: "D",
    131: "A", 132: "B", 133: "B", 134: "C", 135: "B", 136: "B", 137: "B", 138: "B", 139: "D", 140: "D",
    141: "B", 142: "A", 143: "D", 144: "B", 145: "C", 146: "B", 147: "A", 148: "C", 149: "A", 150: "A",
    151: "B"
};

function parseAnswerKey(text, pdfId) {
    if (pdfId === 'teknik') return teknikAnswerKey;
    if (pdfId === 'yonetmelik') return yonetmelikAnswerKey;
    if (pdfId === 'isletme') return isletmeAnswerKey;
    const key = {};
    const keyPattern = /\b(\d{1,3})\s{1,20}([A-Ea-e])\b/g;
    let match;
    while ((match = keyPattern.exec(text)) !== null) {
        key[match[1]] = match[2].toUpperCase();
    }
    const lines = text.split('\n');
    lines.forEach(line => {
        const parts = line.trim().split(/\s{2,}/);
        for (let i = 0; i < parts.length; i++) {
            const m = parts[i].match(/^(\d{1,3})\s+([A-Ea-e])$/i);
            if (m) key[m[1]] = m[2].toUpperCase();
        }
    });
    return key;
}

function parseOptions(text) {
    const normalizedText = text.replace(/\n/g, ' ');
    const optRegex = /([A-Ea-e])\s*[\)\.\-\/]/g;
    let match;
    const indices = {};
    while ((match = optRegex.exec(normalizedText)) !== null) {
        const char = match[1].toUpperCase();
        if (indices[char] === undefined) {
            indices[char] = match.index;
        }
    }
    if (indices['A'] !== undefined && indices['B'] !== undefined) {
        const result = [];
        let labels = ['A', 'B', 'C', 'D', 'E'];
        let foundLabels = labels.filter(l => indices[l] !== undefined);
        for (let i = 0; i < foundLabels.length; i++) {
            const start = indices[foundLabels[i]];
            const end = (i + 1 < foundLabels.length) ? indices[foundLabels[i + 1]] : normalizedText.length;
            let optText = normalizedText.substring(start, end).replace(/^[A-Ea-e]\s*[\)\.\-\/]/, '').trim();
            result.push({ id: foundLabels[i], text: cleanText(optText) });
        }
        return result;
    }
    return null;
}

async function parsePDF(pdfInfo) {
    return new Promise((resolve) => {
        extract.extract(pdfInfo.path, {}, (err, data) => {
            if (err) return resolve({ id: pdfInfo.id, data: [] });

            let allText = '';
            for (let i = 0; i < data.pages.length; i++) {
                const items = data.pages[i].content;
                if (items.length === 0) continue;

                // Simple Y-then-X sorting for the whole page
                // This correctly handles 2x2 option grids and single-column text
                const sortedItems = items.sort((a, b) => {
                    const yDiff = a.y - b.y;
                    if (Math.abs(yDiff) > 4) return yDiff;
                    return a.x - b.x;
                });

                let pageText = '';
                let lastY = -1;
                for (const it of sortedItems) {
                    if (Math.abs(it.y - lastY) > 4) {
                        pageText += '\n';
                        lastY = it.y;
                    }
                    pageText += it.str + ' ';
                }
                allText += pageText + '\n[PAGE_BREAK]\n';
            }

            const answerKey = parseAnswerKey(allText, pdfInfo.id);
            const questions = [];

            for (let qNum = 1; qNum <= pdfInfo.maxQ; qNum++) {
                const pattern = new RegExp(`(?:^|\\n|\\s{3,})${qNum}\\s*[\\)\\.\\-]\\s*`, 'g');
                let match;
                let candidates = [];
                while ((match = pattern.exec(allText)) !== null) {
                    const nextPattern = /\n\s*\d{1,3}\s*[\)\.\-]\s*/g;
                    nextPattern.lastIndex = pattern.lastIndex;
                    const nextMatch = nextPattern.exec(allText);
                    const end = nextMatch ? nextMatch.index : allText.length;
                    candidates.push(allText.substring(pattern.lastIndex, end));
                }

                if (candidates.length > 0) {
                    let bestCand = candidates[0];
                    let bestOpts = parseOptions(bestCand);
                    for (let i = 1; i < candidates.length; i++) {
                        let opts = parseOptions(candidates[i]);
                        if (opts && (!bestOpts || opts.length > bestOpts.length)) {
                            bestCand = candidates[i];
                            bestOpts = opts;
                        }
                    }

                    const aIdx = bestCand.search(/[A-Ea-e]\s*[\)\.\-\/]/);
                    const qRaw = bestCand.substring(0, aIdx !== -1 ? aIdx : bestCand.length);
                    const qText = cleanText(qRaw);
                    questions.push({
                        id: qNum,
                        originalId: qNum,
                        question: qText || `Soru ${qNum}`,
                        options: bestOpts || [
                            { id: 'A', text: 'Seçenek A' },
                            { id: 'B', text: 'Seçenek B' },
                            { id: 'C', text: 'Seçenek C' },
                            { id: 'D', text: 'Seçenek D' }
                        ],
                        correctAnswer: answerKey[qNum] || 'A',
                    });
                }
            }

            console.log(`Parsed ${questions.length} questions for ${pdfInfo.id}.`);
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (pdfInfo.id === 'teknik') {
                    const imagePath = `assets/questions/teknik/a${q.originalId}.png`;
                    const fullPath = path.join(__dirname, 'public', imagePath);
                    if (fs.existsSync(fullPath)) {
                        q.image = imagePath;
                    }
                }
            }
            resolve({ id: pdfInfo.id, data: questions });
        });
    });
}

async function main() {
    console.log("Extraction with final robust logic...");
    const results = {};
    let totalQuestions = 0;

    for (const pdf of pdfs) {
        if (fs.existsSync(pdf.path)) {
            const data = await parsePDF(pdf);
            const seen = new Set();
            const cleanData = data.data
                .filter(q => {
                    if (seen.has(q.originalId)) return false;
                    seen.add(q.originalId);
                    return true;
                })
                .sort((a, b) => a.originalId - b.originalId)
                .map((q, idx) => ({
                    id: idx + 1,
                    originalId: q.originalId,
                    question: q.question,
                    image: q.image,
                    options: q.options,
                    correctAnswer: q.correctAnswer
                }));

            results[data.id] = cleanData;
            totalQuestions += cleanData.length;
        }
    }

    const tsContent = `// Auto-generated from PDFs\nimport type { ExamCategory, ExamQuestion } from './examQuestionsTypes';\n\nexport const examData: Record<ExamCategory, ExamQuestion[]> = ${JSON.stringify(results, null, 2)};\n`;
    fs.writeFileSync('src/data/examQuestions.ts', tsContent);
    console.log(`Successfully wrote ${totalQuestions} questions to src/data/examQuestions.ts`);
}

main();
