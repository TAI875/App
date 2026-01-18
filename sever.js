const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

// API 1: Xử lý file Import và Bóc tách câu hỏi
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        let text = '';
        if (req.file.mimetype.includes('word')) {
            const result = await mammoth.extractRawText({ path: req.file.path });
            text = result.value;
        } else {
            const dataBuffer = fs.readFileSync(req.file.path);
            const data = await pdf(dataBuffer);
            text = data.text;
        }

        const questions = parseTextToQuestions(text);
        fs.unlinkSync(req.file.path); // Xóa file tạm
        res.json(questions);
    } catch (err) {
        res.status(500).send("Lỗi xử lý file");
    }
});

// Hàm bóc tách logic (Hỗ trợ định dạng: Câu 1. ... A. B. C. D. Đáp án: A)
function parseTextToQuestions(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const questions = [];
    let current = null;

    lines.forEach(line => {
        if (/^(Câu|Question|Q)\s*\d+[:.]/i.test(line) || /^\d+[:.]/.test(line)) {
            if (current) questions.push(current);
            current = { id: Date.now() + Math.random(), question: line, options: [], answer: '' };
        } else if (/^[A-D][:.]/.test(line)) {
            current?.options.push(line);
        } else if (/^(Đáp án|Answer|Key)[:.]/i.test(line)) {
            current.answer = line.split(/[:.]/)[1].trim();
        }
    });
    if (current) questions.push(current);
    return questions;
}

// API 2: Gửi Email hỗ trợ cho Admin
app.post('/api/support', async (req, res) => {
    const { name, email, message } = req.body;
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'ADMIN_EMAIL@gmail.com', pass: 'YOUR_APP_PASSWORD' }
    });

    try {
        await transporter.sendMail({
            from: email,
            to: 'ADMIN_EMAIL@gmail.com',
            subject: `Hỗ trợ từ người dùng: ${name}`,
            text: `Email phản hồi: ${email}\nNội dung: ${message}`
        });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.listen(5000, () => console.log("Backend running on port 5000"));