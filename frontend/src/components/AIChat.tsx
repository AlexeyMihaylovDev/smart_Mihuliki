import React, { useState } from 'react';
import { Mic, Send, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useSettingsStore } from '../store/useStore';

export const AIChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [messages, setMessages] = useState<{ role: string, text: string }[]>([]);
    const { haUrl, haToken } = useSettingsStore();

    const getApiUrl = () => {
        const hostname = window.location.hostname;
        return `http://${hostname}:3001/api`;
    };

    let recognition: any = null;
    if ('webkitSpeechRecognition' in window) {
        recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            setInputText(text);
            setIsListening(false);
            handleSendCommand(text);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };
    }

    const toggleListen = () => {
        if (isListening) {
            recognition?.stop();
            setIsListening(false);
        } else {
            recognition?.start();
            setIsListening(true);
        }
    };

    const handleSendCommand = async (text: string = inputText) => {
        if (!text.trim()) return;

        setMessages(prev => [...prev, { role: 'user', text }]);
        setInputText('');

        try {
            const resp = await axios.post(`${getApiUrl()}/ai/command`, {
                command: text
            }, {
                headers: {
                    'x-ha-url': haUrl,
                    'x-ha-token': haToken,
                }
            });

            setMessages(prev => [...prev, { role: 'assistant', text: resp.data.reply }]);
        } catch (error: any) {
            console.error('Command Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I couldn\'t process that command.' }]);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl transition transform hover:scale-105"
            >
                <MessageSquare className="w-6 h-6" />
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-8 w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="bg-gray-700/50 p-4 border-b border-gray-700 font-semibold text-white flex justify-between items-center">
                        <span>Smart Assistant</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
                    </div>

                    <div className="flex-grow p-4 space-y-3 h-64 overflow-y-auto">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 text-sm mt-4">
                                How can I help you today?
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 bg-gray-900 border-t border-gray-700 flex items-center space-x-2">
                        <button
                            onClick={toggleListen}
                            className={`p-2 rounded-full transition ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
                        >
                            <Mic className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendCommand()}
                            placeholder="Type a command..."
                            className="flex-grow bg-gray-800 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => handleSendCommand()}
                            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
