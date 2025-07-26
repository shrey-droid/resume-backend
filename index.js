const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 5000;

app.use(cors());

// Configure Multer
const upload = multer({ dest: 'uploads/' });

// Resume scoring keywords
const KEYWORDS = ['Java', 'Spring', 'React', 'Node', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'REST API'];

app.post('/api/resume/upload', upload.single('resume'), (req, res) => {
    const filePath = req.file.path;

    fs.readFile(filePath, 'utf8', (err, text) => {
        if (err) return res.status(500).json({ message: 'Failed to read file' });

        let score = 0;
        KEYWORDS.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            const matches = text.match(regex);
            if (matches) score += matches.length * 10;
        });

        if (score > 100) score = 100;

        fs.unlink(filePath, () => {}); // clean up

        res.json({ score });
    });
});

const pdfParse = require('pdf-parse');

function calculateScore(text) {
    const keywords = ['Java', 'Spring', 'React', 'Node', 'SQL', 'Docker'];
    const lowerText = text.toLowerCase();
    let score = 0;

    keywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
            score += 10;
        }
    });

    return Math.min(score, 100); // max score capped at 100
}

app.post('/api/resume/upload', upload.single('resume'), async (req, res) => {
    const fileBuffer = req.file.buffer;
    let text = '';

    try {
        if (req.file.mimetype === 'application/pdf') {
            const data = await pdfParse(fileBuffer);
            text = data.text;
        } else {
            text = fileBuffer.toString('utf-8');
        }

        const score = calculateScore(text);
        res.json({ score });
    } catch (err) {
        console.error('Error parsing resume:', err);
        res.status(500).json({ error: 'Failed to parse resume' });
    }
});

app.listen(port, () => {
    console.log(`✅ Resume Scoring API running at http://localhost:${port}`);
});
