import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';

const WEBSOCKET_URL = "ws://localhost:8000/ws/chat";

export default function ChatWidget({ customerId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        if (isOpen && !ws.current) {
            connect();
        }
        return () => {
            if (ws.current) ws.current.close();
        };
    }, [isOpen]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const connect = () => {
        ws.current = new WebSocket(`${WEBSOCKET_URL}/${customerId}`);
        ws.current.onopen = () => setIsConnected(true);
        ws.current.onclose = () => setIsConnected(false);
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages(prev => [...prev, data]);
        };
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() && ws.current && isConnected) {
            ws.current.send(JSON.stringify({ content: input, type: 'message' }));
            setInput('');
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-transform transform hover:scale-110 z-50 flex items-center justify-center animate-bounce duration-300"
            >
                <MessageCircle size={32} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="bg-blue-600 text-white p-5 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
                        <MessageCircle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">Support</h3>
                        <p className="text-blue-100 text-xs flex items-center gap-1.5 mt-0.5 font-medium">
                            {isConnected ? <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span> : <Loader2 size={12} className="animate-spin" />}
                            {isConnected ? 'Online - Usually replies instantly' : 'Connecting...'}
                        </p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-2 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>
            
            <div className="h-[400px] p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-50">
                {messages.length === 0 && (
                  <div className="m-auto text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <MessageCircle size={32} />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Send us a message and we'll reply right away.</p>
                  </div>
                )}
                {messages.map((m, i) => {
                    const isMe = m.sender_id === customerId;
                    const isSystem = m.type === 'system';
                    if (isSystem) return <div key={i} className="text-center text-xs text-gray-400 font-medium my-2 bg-gray-200/50 rounded-full py-1 px-3 mx-auto">{m.content}</div>;
                    return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'}`}>
                                <p className="text-[15px] leading-relaxed">{m.content}</p>
                                <span className={`text-[10px] mt-1.5 font-medium block ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={endOfMessagesRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-[15px] font-medium text-gray-700"
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() || !isConnected}
                    className="bg-blue-600 text-white p-3.5 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
