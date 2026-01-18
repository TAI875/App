import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- TIỆN ÍCH XÁO TRỘN ---
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export default function EnglishApp() {
    const [darkMode, setDarkMode] = useState(false);
    const [view, setView] = useState('home'); // home, quiz, game, flashcard, support
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. CHUYỂN ĐỔI DARK MODE
    useEffect(() => {
        document.documentElement.className = darkMode ? 'dark' : '';
    }, [darkMode]);

    // 2. IMPORT FILE
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/upload', formData);
            setQuestions(shuffle(res.data)); // Xáo trộn ngay khi import
            alert("Đã nhập dữ liệu thành công!");
            setView('quiz');
        } catch (err) { alert("Lỗi tải file!"); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            {/* NAVBAR */}
            <nav className="p-4 bg-white dark:bg-gray-800 shadow-md flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-xl font-bold text-blue-600 cursor-pointer" onClick={() => setView('home')}>ENG-MASTER</h1>
                <div className="flex gap-4 items-center">
                    <button onClick={() => setView('support')} className="text-sm">Hỗ trợ</button>
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-xl">
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="max-w-4xl mx-auto p-6">
                {view === 'home' && <Home setView={setView} handleFileUpload={handleFileUpload} loading={loading} />}
                {view === 'quiz' && <Quiz questions={questions} />}
                {view === 'game' && <WordGame questions={questions} />}
                {view === 'flashcard' && <Flashcards questions={questions} />}
                {view === 'support' && <SupportForm />}
            </main>
        </div>
    );
}

// --- TRANG CHỦ ---
function Home({ handleFileUpload, setView, loading }) {
    return (
        <div className="text-center py-20">
            <h2 className="text-4xl font-extrabold mb-4">Học Tiếng Anh Thông Minh</h2>
            <p className="mb-8 opacity-70">Tải file .docx hoặc .pdf để bắt đầu tạo đề thi tự động.</p>
            
            <div className="flex flex-col items-center gap-4">
                <label className="cursor-pointer bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition">
                    {loading ? "Đang xử lý..." : "📤 Tải đề của bạn lên"}
                    <input type="file" hidden onChange={handleFileUpload} accept=".pdf,.docx" />
                </label>
                
                <div className="grid grid-cols-2 gap-4 mt-10">
                    <button onClick={() => setView('game')} className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg">🎮 Game nối từ</button>
                    <button onClick={() => setView('flashcard')} className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg">🃏 Flashcards</button>
                </div>
            </div>
        </div>
    );
}

// --- CHẾ ĐỘ QUIZ (CÓ PHÍM TẮT 1,2,3,4) ---
function Quiz({ questions }) {
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const handleKeys = (e) => {
            if (['1','2','3','4'].includes(e.key)) {
                // Logic xử lý đáp án tại đây
                if (idx < questions.length - 1) setIdx(idx + 1);
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [idx, questions]);

    if (!questions.length) return <p>Vui lòng import đề trước!</p>;

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between mb-6">
                <span>Câu hỏi {idx + 1}/{questions.length}</span>
                <span className="text-green-500 font-bold">Đúng: {score}</span>
            </div>
            <h3 className="text-2xl font-bold mb-6">{questions[idx].question}</h3>
            <div className="grid gap-4">
                {questions[idx].options.map((opt, i) => (
                    <button key={i} onClick={() => setIdx(idx + 1)} className="p-4 border dark:border-gray-700 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-gray-700">
                        <span className="font-bold mr-2">{i + 1}.</span> {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

// --- CHẾ ĐỘ GAME NỐI TỪ ---
function WordGame({ questions }) {
    return <div className="text-center">Tính năng Game đang được kết nối với dữ liệu file...</div>;
}

// --- CHẾ ĐỘ FLASHCARDS 3D ---
function Flashcards({ questions }) {
    const [flip, setFlip] = useState(false);
    return (
        <div className="flex flex-col items-center">
            <div 
                onClick={() => setFlip(!flip)}
                className={`w-64 h-96 bg-blue-500 text-white rounded-2xl flex items-center justify-center text-2xl p-6 cursor-pointer transition-transform duration-500 shadow-2xl ${flip ? 'rotate-y-180' : ''}`}
            >
                {flip ? "Đáp án" : "Từ vựng / Câu hỏi"}
            </div>
            <p className="mt-4 opacity-50 text-sm">Chạm vào thẻ để lật</p>
        </div>
    );
}

// --- FORM HỖ TRỢ GỬI MAIL ---
function SupportForm() {
    return (
        <form className="max-w-md mx-auto space-y-4">
            <h2 className="text-2xl font-bold">Gửi yêu cầu hỗ trợ</h2>
            <input className="w-full p-3 rounded-lg border dark:bg-gray-800" placeholder="Tên của bạn" />
            <input className="w-full p-3 rounded-lg border dark:bg-gray-800" placeholder="Email" />
            <textarea className="w-full p-3 rounded-lg border dark:bg-gray-800" rows="4" placeholder="Bạn cần giúp gì?"></textarea>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Gửi tới Admin</button>
        </form>
    );
}