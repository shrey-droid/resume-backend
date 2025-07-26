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
const KEYWORDS = ['Java', 'Spring', 'React', 'AWS', 'Node', 'MongoDB', 'SQL', 'REST'];

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

app.listen(port, () => {
    console.log(`✅ Resume Scoring API running at http://localhost:${port}`);
});
