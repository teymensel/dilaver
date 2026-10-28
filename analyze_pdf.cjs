const { PDFExtract } = require('pdf.js-extract');
const extract = new PDFExtract();

extract.extract('public/isletme-1.pdf', {}, (err, data) => {
    if (err) return console.log(err);

    console.log("=== SAYFA 1 (İlk 20 Satır) ===");
    const page1Strings = data.pages[0].content.map(c => c.str).filter(s => s.trim() !== '');
    console.log(page1Strings.slice(0, 20).join('\n'));

    console.log("\n=== SON SAYFA (Cevap Anahtarı) ===");
    const lastPageStrings = data.pages[data.pages.length - 1].content.map(c => c.str).filter(s => s.trim() !== '');
    console.log(lastPageStrings.slice(-40).join('\n'));
});
