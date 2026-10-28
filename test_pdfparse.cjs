const fs = require('fs');
const pdf = require('pdf-parse');

async function extractQuestions(filePath) {
    let dataBuffer = fs.readFileSync(filePath);
    try {
        const data = await pdf(dataBuffer);
        const text = data.text;

        let questions = [];
        // A simple regex to find sequences like "1. What is...? A) ... B) ... C) ... D) ..."
        // This regex is very forgiving.
        const regex = /(\d+)\s*[\.\)]\s*(.*?)(?=\s*[A-E]\s*[\.\)]|$)/gs;

        let match;
        while ((match = regex.exec(text)) !== null) {
            let qNum = match[1];
            let qText = match[2].trim().replace(/\n/g, ' ');
            if (qText.length > 20 && qText.length < 500) {
                questions.push({ id: qNum, text: qText });
            }
        }

        console.log(`Found ${questions.length} question blocks in ${filePath}`);
        console.log(questions.slice(0, 3));
    } catch (e) {
        console.error(e);
    }
}

extractQuestions('public/isletme-1.pdf');
