const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extractText(pdfPath) {
    const data = fs.readFileSync(pdfPath);
    const pdfDocument = await pdfjsLib.getDocument({ data: new Uint8Array(data) }).promise;

    let fullText = '';

    for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `--- Sayfa ${i} ---\n` + pageText + '\n\n';

        if (i === 1 || i === pdfDocument.numPages) {
            console.log(`\n\n=== SAYFA ${i} ===`);
            console.log(pageText.substring(0, 1500));
        }
    }

    console.log(`\nToplam ${pdfDocument.numPages} sayfa okundu.`);
    return fullText;
}

if (process.argv.length < 3) {
    console.log("Kullanım: node extract_pdfjs.cjs <pdf_yolu>");
    process.exit(1);
}

extractText(process.argv[2]).catch(console.error);
