const { PDFExtract } = require('pdf.js-extract');
const fs = require('fs');
const extract = new PDFExtract();

const path = 'public/teknik-1.pdf';

extract.extract(path, {}, (err, data) => {
    if (err) return console.error(err);

    // Scan all pages for answer key table
    let allText = '';
    for (let i = 0; i < data.pages.length; i++) {
        const items = data.pages[i].content;
        const sorted = items.sort((a, b) => Math.abs(a.y - b.y) > 5 ? a.y - b.y : a.x - b.x);
        let curY = -1;
        sorted.forEach(item => {
            if (Math.abs(item.y - curY) > 5) { allText += '\n'; curY = item.y; }
            allText += item.str + ' ';
        });
    }

    const answerKey = {};
    let match;
    const answerPattern = /(?:^|\s|\n)(\d{1,3})\s+([A-Ea-e])(?:\s+|$)/ig;
    while ((match = answerPattern.exec(allText)) !== null) {
        answerKey[match[1]] = match[2].toUpperCase();
    }

    console.log("Teknik Answer Key Count:", Object.keys(answerKey).length);
    console.log("Max ID in Key:", Math.max(...Object.keys(answerKey).map(Number)));
});
