
import React, { useState, useRef, useEffect } from 'react';

// --- Helper to add Google Fonts for the new theme ---
const StyleInjector = () => {
    useEffect(() => {
        const style = document.createElement('style');
        document.head.appendChild(style);
        // Import Playfair Display for headings and Lato for body text
        style.sheet.insertRule(`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;700&display=swap');`, 0);
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    return null;
};

// --- Icon Components ---
const MicIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" /></svg>;
const StopIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" /></svg>;
const UploadIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>;
const SpinnerIcon = ({ className }) => <svg className={className} style={{animation: 'spin 1s linear infinite'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const CopyIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>;
const TrashIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const UserIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88a9.947 9.947 0 0112.28 0C16.43 19.18 14.03 20 12 20z"/></svg>;
const LogoutIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>;

// --- API URL Configuration ---
const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

// --- Main Transcriber Component ---
const TranscriberApp = ({ user, onLogout }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcriptions, setTranscriptions] = useState([]);
    const [timer, setTimer] = useState(0);
    const [notification, setNotification] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [language, setLanguage] = useState('en-US');
    const [itemToDelete, setItemToDelete] = useState(null);

    const mediaRecorderRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const audioChunksRef = useRef([]);
    
    const getAuthHeaders = () => ({ 'Authorization': `Bearer ${user.token}` });

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/transcriptions`, { headers: getAuthHeaders() });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: `Server responded with status: ${response.status}` }));
                    throw new Error(errorData.error || 'Failed to fetch history.');
                }
                const data = await response.json();
                setTranscriptions(data);
            } catch (error) {
                console.error("Error fetching history:", error);
                setNotification(`Error: Could not load history. ${error.message}`);
            }
            setIsLoading(false);
        };
        fetchHistory();
    }, [user]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const sendAudioToServer = async (audioBlob, fileName, sourceType) => {
        setIsLoading(true);
        setNotification('Transcribing...');
        const formData = new FormData();
        formData.append('audio', audioBlob, fileName);
        formData.append('language', language);
        formData.append('sourceType', sourceType);

        try {
            const response = await fetch(`${API_URL}/api/transcribe`, { method: 'POST', headers: getAuthHeaders(), body: formData });
            const newTranscription = await response.json();
            if (!response.ok) throw new Error(newTranscription.details || newTranscription.error);
            setTranscriptions(prev => [newTranscription, ...prev]);
            setNotification(newTranscription.transcriptionText === '[No speech detected]' ? 'Processing complete.' : 'Transcription successful!');
        } catch (error) {
            console.error("Error sending audio:", error);
            setNotification(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/transcriptions/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to delete.');
            setTranscriptions(transcriptions.filter(t => t._id !== id));
            setNotification('Transcription deleted successfully.');
        } catch (error) {
            console.error("Error deleting transcription:", error);
            setNotification(`Error: ${error.message}`);
        }
        setItemToDelete(null);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                sendAudioToServer(audioBlob, `recording_${Date.now()}.webm`, 'record');
            };
            mediaRecorder.start();
            setIsRecording(true);
            setTimer(0);
            timerIntervalRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
        } catch (err) {
            setNotification("Error: Could not start recording. Please grant microphone permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            sendAudioToServer(file, file.name, 'upload');
        }
    };
    
    const formatTime = (time) => new Date(time * 1000).toISOString().substr(14, 5);
    const formatTimestamp = (ts) => new Date(ts).toLocaleString('en-IN', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => setNotification(`Copied to clipboard!`)).catch(() => setNotification('Failed to copy.'));
    };

    const languageOptions = [
        { code: 'en-US', name: 'English (US)' }, { code: 'es-ES', name: 'Spanish (Spain)' },
        { code: 'fr-FR', name: 'French (France)' }, { code: 'de-DE', name: 'German' },
        { code: 'hi-IN', name: 'Hindi' }, { code: 'it-IT', name: 'Italian' },
        { code: 'ja-JP', name: 'Japanese' }, { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    ];

    return (
        <>
            {itemToDelete && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl p-8 shadow-2xl border border-gray-200 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 font-['Playfair_Display']">Confirm Deletion</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to permanently delete this transcription?</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setItemToDelete(null)} className="py-2 px-5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors font-semibold">Cancel</button>
                            <button onClick={() => handleDelete(itemToDelete)} className="py-2 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-semibold">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            <header className="bg-white/95 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200">
                <div className="w-full max-w-7xl mx-auto flex justify-between items-center p-4 sm:p-5">
                    <div>
                        <h1 className="text-3xl font-bold text-[#800020] font-['Playfair_Display']">Audio Scribe</h1>
                        <p className="text-gray-500 text-sm mt-1">Professional Transcription Assistant</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-gray-600 hidden sm:block">Welcome, <span className="font-bold text-[#333333]">{user.username}</span></p>
                        <button onClick={onLogout} className="flex items-center justify-center p-1 rounded-full text-gray-500 hover:text-[#800020] transition-all duration-300" title="Logout">
                            <UserIcon className="w-7 h-7" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
                <div className="flex flex-col gap-8">
                    {/* --- Controls Section --- */}
                    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 text-center text-[#333333] font-['Playfair_Display']">Controls</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                            
                            {/* Upload Area */}
                            <div className="flex flex-col items-center text-center p-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Upload File</h3>
                                <label htmlFor="file-upload" className={`font-semibold py-2 px-5 rounded-md transition-all duration-300 inline-flex items-center bg-[#2d3748] text-white hover:bg-[#1a202c] ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <UploadIcon className="w-5 h-5 mr-2" /> Select File
                                </label>
                                <input id="file-upload" type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} disabled={isLoading} />
                            </div>

                            {/* Record Area */}
                            <div className="flex flex-col items-center text-center p-4 border-x-0 md:border-x md:border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Record Audio</h3>
                                {isRecording ? 
                                    <button onClick={stopRecording} className="font-semibold py-2 px-5 rounded-md transition-all duration-300 inline-flex items-center bg-red-700 text-white hover:bg-red-800" disabled={isLoading}>
                                        <StopIcon className="w-5 h-5 mr-2 animate-pulse" /> Stop ({formatTime(timer)})
                                    </button>
                                    : 
                                    <button onClick={startRecording} className={`font-semibold py-2 px-5 rounded-md transition-all duration-300 inline-flex items-center bg-[#800020] text-white hover:bg-red-900 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isLoading}>
                                        <MicIcon className="w-5 h-5 mr-2" /> Start Recording
                                    </button>
                                }
                            </div>

                             {/* Language Area */}
                            <div className="flex flex-col items-center text-center p-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Language</h3>
                                <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full max-w-xs p-2 bg-white border border-gray-300 text-gray-700 rounded-md focus:ring-2 focus:ring-[#800020] focus:border-transparent" disabled={isLoading}>
                                    {languageOptions.map(opt => <option key={opt.code} value={opt.code}>{opt.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* --- Transcription History Section --- */}
                    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                        <h2 className="text-3xl font-bold mb-4 border-b border-gray-200 pb-3 text-[#333333] font-['Playfair_Display']">Transcription History</h2>
                        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-3 -mr-3">
                            {isLoading && <div className="flex justify-center items-center py-10"><SpinnerIcon className="w-8 h-8 text-[#800020]" /></div>}
                            {!isLoading && transcriptions.length > 0 && transcriptions.map((item) => (
                                <div key={item._id} className="bg-white p-4 rounded-md border border-gray-200 transition-all hover:shadow-md hover:border-gray-300 animate-fade-in">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {item.sourceType === 'record' ? <MicIcon className="w-5 h-5 text-[#800020] flex-shrink-0" /> : <UploadIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                                            <h3 className="font-bold text-base text-gray-800 truncate">{item.sourceType === 'record' ? `Recording: ${formatTimestamp(item.createdAt)}` : item.fileName}</h3>
                                        </div>
                                        <div className="flex items-center flex-shrink-0">
                                            <button onClick={() => copyToClipboard(item.transcriptionText)} className="p-2 rounded-full hover:bg-gray-200 transition-colors" title="Copy"><CopyIcon className="w-5 h-5 text-gray-500" /></button>
                                            <button onClick={() => setItemToDelete(item._id)} className="p-2 rounded-full hover:bg-gray-200 transition-colors" title="Delete"><TrashIcon className="w-5 h-5 text-gray-500 hover:text-red-600" /></button>
                                        </div>
                                    </div>
                                    <div className={`mt-2 whitespace-pre-wrap bg-gray-50 p-3 rounded-md text-sm leading-6 ${
                                        item.transcriptionText === '[No speech detected]' 
                                        ? 'text-red-600 italic' 
                                        : 'text-gray-700'
                                    }`}>
                                        {item.transcriptionText || " "}
                                    </div>
                                </div>
                            ))}
                            {!isLoading && transcriptions.length === 0 && <p className="text-gray-500 text-center py-8">Your transcription history will appear here.</p>}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};


// --- Authentication Form Component ---
const AuthForm = ({ isLogin, onSubmit, onSwitch, notification }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); onSubmit({ username, password }); };
    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white border border-gray-200 rounded-xl shadow-2xl text-gray-800">
            <h2 className="text-3xl font-bold text-center text-[#333333] font-['Playfair_Display']">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
            {notification && <p className="text-center text-red-700 bg-red-100 p-3 rounded-md border border-red-200">{notification}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="username" className="text-sm font-medium text-gray-600 block mb-2">Username</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-[#800020] focus:border-transparent transition-colors" required />
                </div>
                <div>
                    <label htmlFor="password" className="text-sm font-medium text-gray-600 block mb-2">Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-[#800020] focus:border-transparent transition-colors" required />
                </div>
                <button type="submit" className="w-full py-3 px-4 bg-[#800020] hover:bg-red-900 rounded-md text-white font-semibold transition-all duration-300">
                    {isLogin ? 'Login' : 'Create Account'}
                </button>
            </form>
            <p className="text-center text-sm text-gray-500">{isLogin ? "Don't have an account?" : "Already have an account?"}<button onClick={onSwitch} className="font-medium text-[#800020] hover:underline ml-2">{isLogin ? 'Register' : 'Login'}</button></p>
        </div>
    );
};


// --- Main App Component (Handles routing) ---
export default function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('login');
    const [notification, setNotification] = useState('');

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        }
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleAuth = async (credentials) => {
        const endpoint = view === 'login' ? 'login' : 'register';
        try {
            const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Authentication failed.');
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
        } catch (error) {
            console.error("DEBUG: Authentication Error:", error);
            setNotification(error.message);
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setView('login');
    };

    const renderView = () => {
        if (user) {
            return <TranscriberApp user={user} onLogout={handleLogout} />;
        }
        switch(view) {
            case 'register':
                return <AuthForm isLogin={false} onSubmit={handleAuth} onSwitch={() => setView('login')} notification={notification} />;
            case 'login':
            default:
                return <AuthForm isLogin={true} onSubmit={handleAuth} onSwitch={() => setView('register')} notification={notification} />;
        }
    };

    return (
        <div className="bg-gray-50 text-[#333333] min-h-screen font-['Lato'] flex flex-col">
            <StyleInjector />
            {notification && !user && (
                <div className={`fixed top-5 left-1/2 -translate-x-1/2 text-white py-2 px-5 rounded-lg shadow-2xl z-50 transition-all duration-300 ${notification.startsWith('Error:') ? 'bg-red-600' : 'bg-green-600'}`}>
                    {notification}
                </div>
            )}
            
            <div className="flex-grow flex flex-col">
                {user ? (
                    <TranscriberApp user={user} onLogout={handleLogout} />
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center p-4">
                        <header className="text-center mb-10">
                            <h1 className="text-4xl sm:text-5xl font-bold text-[#800020] font-['Playfair_Display']">Audio Scribe</h1>
                            <p className="text-gray-500 mt-2 text-lg">Your Professional Transcription Assistant</p>
                        </header>
                        {renderView()}
                    </div>
                )}
            </div>
            
            <footer className="w-full mt-auto border-t border-gray-200 bg-white">
                <div className="w-full max-w-7xl mx-auto p-5 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Audio Scribe. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
