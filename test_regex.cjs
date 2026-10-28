const { PDFExtract } = require('pdf.js-extract');
const fs = require('fs');

const extract = new PDFExtract();

function parseOptions(text) {
    // Regex to match a) or a ) or A) or A ) etc
    const A_idx = text.search(/[aA]\s*[\)\.]/);
    const B_idx = text.search(/[bB]\s*[\)\.]/);
    const C_idx = text.search(/[cC]\s*[\)\.]/);
    const D_idx = text.search(/[dD]\s*[\)\.]/);
    const E_idx = text.search(/[eE]\s*[\)\.]/); // optional

    if (A_idx === -1 || B_idx === -1 || C_idx === -1 || D_idx === -1) {
        return null;
    }

    return {
        A: text.substring(A_idx, B_idx).replace(/^[aA]\s*[\)\.]/, '').trim().replace(/\n/g, ' '),
        B: text.substring(B_idx, C_idx).replace(/^[bB]\s*[\)\.]/, '').trim().replace(/\n/g, ' '),
        C: text.substring(C_idx, D_idx).replace(/^[cC]\s*[\)\.]/, '').trim().replace(/\n/g, ' '),
        D: text.substring(D_idx, E_idx !== -1 ? E_idx : text.length).replace(/^[dD]\s*[\)\.]/, '').trim().replace(/\n/g, ' ')
    };
}

extract.extract('public/isletme-1.pdf', {}, (err, data) => {
    let allText = '';

    // Sort logic
    for (let i = 0; i < data.pages.length - 1; i++) {
        const items = data.pages[i].content;
        const col1 = items.filter(a => a.x < 300).sort((a, b) => Math.abs(a.y - b.y) > 5 ? a.y - b.y : a.x - b.x);
        const col2 = items.filter(a => a.x >= 300).sort((a, b) => Math.abs(a.y - b.y) > 5 ? a.y - b.y : a.x - b.x);

        let currentY = -1;
        col1.forEach(item => {
            if (Math.abs(item.y - currentY) > 5) { allText += '\n'; currentY = item.y; }
            allText += item.str + ' ';
        });
        currentY = -1;
        col2.forEach(item => {
            if (Math.abs(item.y - currentY) > 5) { allText += '\n'; currentY = item.y; }
            allText += item.str + ' ';
        });
    }

    // Split by Question Number: "1)", " 1)", "\n1)", "1.", "\n1."
    // regex: /(?:^|\n)\s*(\d{1,3})\s*[\)\.]/g
    const segments = allText.split(/(?:^|\n)\s*(\d{1,3})\s*[\)\.]/g);

    let questionsFound = 0;

    for (let i = 1; i < segments.length; i += 2) {
        const qNumStr = segments[i];
        const content = segments[i + 1];

        if (!qNumStr || !content) continue;

        // Find where a) or a ) or A) begins
        const aIndex = content.search(/[aA]\s*[\)\.]/);
        if (aIndex === -1) {
            continue; // Could not find options
        }

        const qText = content.substring(0, aIndex).trim().replace(/\n/g, ' ');
        const optionsText = content.substring(aIndex);

        const opts = parseOptions(optionsText);
        if (opts) {
            questionsFound++;
            if (questionsFound < 3) {
                console.log(`Q${qNumStr}: ${qText}`);
                console.log(` A: ${opts.A}\n B: ${opts.B}\n C: ${opts.C}\n D: ${opts.D}`);
            }
        }
    }

    console.log("Found questions for Isletme:", questionsFound);
});
