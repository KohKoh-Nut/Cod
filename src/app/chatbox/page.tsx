'use client';
import {useState} from 'react';

interface ChatMessage {
    sender: 'USER' | 'TRUMP'
    text: string;
}
export default function ChatPage() {

    // Create a space for user input
    const [chatLog, setchatLog] = useState<ChatMessage[]>([{sender:'TRUMP', text: "Wanna go island with me?"}]);
    const [typeValue, settypeValue] = useState<string>("");

    // Function when clicking 'SEND'
    const Send = () =>{
    
    if (!typeValue.trim()) return;

    // Capture user's message
    const userMessage: ChatMessage = {
        sender: 'USER',
        text: typeValue
    };
    
    // Push user message to the screen and clear the input bar
    const updatedMessages = [...chatLog, userMessage];
    setchatLog(updatedMessages);
    settypeValue('');

    // Auto-reply after receiving
    setTimeout(() => {
      const aiReply: ChatMessage = { 
        sender: 'TRUMP',
        text: `COMMAND_RECEIVED: "${userMessage.text}" processed. Make America GREAT again`
    };
      setchatLog([...updatedMessages, aiReply]);
    }, 404);
  };
  
  return (
    // FIXED: Changed min-w-5xl to max-w-5xl. Added items-center to keep the structure pristine.
    <main className="min-h-screen max-w-5xl mx-auto bg-[#040408] text-cyan-400 font-mono p-8 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      
      {/* header */}
      <header className="w-full flex justify-between items-start border-b border-emerald-500/20 pb-4 mb-6">
        <div className="flex items-start gap-3">
          <h1 className="text-xl font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400"> 
            ChatUrFuture
          </h1>
        </div>
      </header>
  
      {/* Main container */}
      <div className="w-full flex flex-col gap-4 flex-1 justify-between h-[500px]">
        <div className="bg-slate-900/40 rounded-xl border border-cyan-500/10 flex flex-col h-[75%] w-full p-4 overflow-y-auto space-y-3">
          {chatLog.map((msg, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border max-w-[80%] text-xs leading-relaxed ${
                msg.sender === 'USER' 
                  ? 'bg-cyan-950/20 border-cyan-500/30 self-end text-cyan-300' 
                  : 'bg-emerald-950/20 border-emerald-500/20 self-start text-emerald-300'
              }`}
            >
              <span className="font-bold block mb-1">[{msg.sender}]:</span>
              {msg.text}
            </div>
          ))}
        </div>

        {/* Upper container (Chat History Display Area) */}
        <div className="bg-slate-900/40 rounded-xl border border-cyan-500/10 flex flex-row h-[70%] w-full p-4">
          <span className="text-xs text-cyan-500/60">&gt; INITIALIZING_CHAT_FEED...</span>
        </div>

        {/* Lower container (Input Bar Area) */}
        <div className="bg-slate-900/70 rounded-xl border border-cyan-500/20 flex flex-row h-[25%] w-full p-4">

            {/* Input deck */}
            <div className="w-full flex flex-row gap-3 items-center">

                {/* Input bar */}
                <input type="text"
                       value={typeValue}
                       onChange={(e) => settypeValue(e.target.value)}
                       // If the pressed key is "Enter", fire Send function automatically
                       onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                        Send();
                        }
                    }}
                       placeholder="Write your question here..."
                       className="flex-1 bg-black/50 border border-cyan-500/30 rounded-lg p-3 text-sm text-cyan-300 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                />       
            </div>
        </div>

        {/* Send button */}
        <button 
            onClick={Send}
            className="bg-cyan-950/40 hover:bg-cyan-500 hover:text-black border border-cyan-500/50 text-cyan-400 font-bold px-6 py-3 rounded-lg text-sm tracking-widest uppercase transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
        SEND
        </button>

      </div>

    </main>
  );
}