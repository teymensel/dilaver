const fs = require('fs');
const pdf = require('pdf-parse');

async function extractQuestions(filePath) {
    let dataBuffer = fs.readFileSync(filePath);
    try {
        const data = await pdf(dataBuffer);
        console.log(`Extracted text from ${filePath}. Length: ${data.text.length} characters.`);

        console.log("--- BÖLÜM 1 (Önizleme) ---");
        console.log(data.text.substring(0, 1000));

        console.log("\n--- BÖLÜM 2 (Cevap Anahtarı Önizleme) ---");
        console.log(data.text.substring(data.text.length - 1000));

    } catch (error) {
        console.error("Error reading PDF:", error);
    }
}

if (process.argv.length < 3) {
    console.log("Usage: node extract_pdf.js <path_to_pdf>");
    process.exit(1);
}

extractQuestions(process.argv[2]);
