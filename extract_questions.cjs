const { PDFExtract } = require('pdf.js-extract');
const extract = new PDFExtract();

function processPDF(pdfPath) {
    extract.extract(pdfPath, {}, (err, data) => {
        if (err) return console.log(err);

        // Let's sort all items by Page -> Y -> X to read left-to-right, top-to-bottom
        // Actually, for two columns, we should sort by X first (column 1 vs column 2), then Y.
        // Assuming column 1 X is < 300, column 2 X is > 300. (A4 width is ~595)

        let allText = '';

        for (let i = 0; i < data.pages.length - 1; i++) {
            const items = data.pages[i].content;

            // split into columns
            const col1 = items.filter(a => a.x < 300);
            const col2 = items.filter(a => a.x >= 300);

            const sortFn = (a, b) => {
                if (Math.abs(a.y - b.y) > 5) return a.y - b.y;
                return a.x - b.x;
            };

            col1.sort(sortFn);
            col2.sort(sortFn);

            // Reconstruct text
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

        console.log("=== Text Preview ===");
        console.log(allText.substring(0, 2000));

        // Find answer key
        const lastPageItems = data.pages[data.pages.length - 1].content;
        lastPageItems.sort((a, b) => {
            if (Math.abs(a.y - b.y) > 5) return a.y - b.y;
            return a.x - b.x;
        });

        const answerText = lastPageItems.map(i => i.str).join(' ');
        const simpleAnswerPattern = /(?:^|\s)(\d{1,3})\s*([A-E])/g;
        let match;
        const answerKey = {};
        while ((match = simpleAnswerPattern.exec(answerText)) !== null) {
            answerKey[match[1]] = match[2];
        }

        console.log("=== Answer Key ===");
        console.log(Object.entries(answerKey).slice(0, 10));
        console.log("Total answers: " + Object.keys(answerKey).length);
    });
}

processPDF('public/isletme-1.pdf');
