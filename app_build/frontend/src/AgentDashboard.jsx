import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Circle, Loader2, MonitorSmartphone, Bell } from 'lucide-react';

const WEBSOCKET_URL = "ws://localhost:8000/ws/chat";

export default function AgentDashboard() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const agentId = "SUPPORT-AGENT";
    const ws = useRef(null);
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        connect();
        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const connect = () => {
        ws.current = new WebSocket(`${WEBSOCKET_URL}/${agentId}`);
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

    // Calculate active users based on recent messages
    const activeUsers = [...new Set(messages.filter(m => m.sender_id !== agentId && m.sender_id !== 'system').map(m => m.sender_id))];

    return (
        <div className="w-full h-[800px] bg-white rounded-[2rem] shadow-2xl flex overflow-hidden border border-gray-100/50 relative">
            {/* Sidebar */}
            <div className="w-80 bg-gray-50 border-r border-gray-200/60 flex flex-col">
                <div className="p-8 bg-indigo-600 text-white shadow-md relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="flex justify-between items-center relative z-10">
                      <h2 className="font-bold text-2xl flex items-center gap-3"><MonitorSmartphone size={24}/> Inbox.</h2>
                      {isConnected ? <Circle size={14} className="fill-green-400 text-green-400 shadow-[0_0_10px_rgba(74,222,128,1)]" /> : <Loader2 size={18} className="animate-spin text-white" />}
                    </div>
                    <p className="text-indigo-200 text-sm mt-2 font-medium relative z-10">Global Support Queue</p>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase flex items-center gap-2">
                        <Users size={14}/> Active Users ({activeUsers.length})
                      </h3>
                      <button className="text-gray-400 hover:text-indigo-600 transition-colors"><Bell size={16}/></button>
                    </div>
                    
                    <div className="space-y-3">
                        {activeUsers.length === 0 ? <p className="text-gray-400 text-sm font-medium text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">No active conversations</p> : 
                            activeUsers.map(user => (
                                <div key={user} className="p-4 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-inner group-hover:from-indigo-500 group-hover:to-blue-400 group-hover:text-white transition-all">
                                        {user.substring(0, 2)}
                                      </div>
                                      <div>
                                        <span className="font-bold text-gray-800 block text-sm">{user}</span>
                                        <span className="text-xs text-gray-400 font-medium">Browsing store</span>
                                      </div>
                                    </div>
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-50 mt-1"></span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[#f8faff]">
                <div className="p-6 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm flex items-center justify-between z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
                          <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Global Feed</h2>
                            <p className="text-sm font-medium text-gray-500">Monitoring all incoming correspondence in real-time</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 p-8 overflow-y-auto space-y-6">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 mb-10">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 mb-6 text-gray-200">
                                <MonitorSmartphone size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No Messages Yet</h3>
                            <p className="font-medium">Waiting for incoming messages on the websocket...</p>
                        </div>
                    )}
                    {messages.map((m, i) => {
                        const isMe = m.sender_id === agentId;
                        const isSystem = m.type === 'system';
                        if (isSystem) return <div key={i} className="flex justify-center my-6"><span className="text-xs text-gray-500 font-bold bg-gray-200/50 rounded-full py-1.5 px-4 shadow-sm">{m.content}</span></div>;
                        
                        return (
                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                {!isMe && (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold mr-3 shadow-md border-2 border-white">
                                        {m.sender_id.substring(0, 2)}
                                    </div>
                                )}
                                <div className={`max-w-[70%] p-5 rounded-3xl shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`}>
                                    <p className="text-[15px] leading-relaxed">{m.content}</p>
                                    <div className={`text-[11px] mt-3 flex justify-between font-bold ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                        <span className="uppercase tracking-wider mr-4">{isMe ? 'You' : m.sender_id}</span>
                                        <span>{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={endOfMessagesRef} />
                </div>

                <div className="p-6 bg-white border-t border-gray-200/60 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                    <form onSubmit={sendMessage} className="flex gap-4 max-w-5xl mx-auto">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Broadcast a response to the feed..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-700 text-[15px]"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || !isConnected}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 active:transform active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200/50 font-bold flex items-center gap-3"
                        >
                            <span>Send</span>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
