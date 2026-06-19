"use client";
import { useState } from "react";
import Button from "@/components/Button";
import Message from "@/components/Chat/Message";

interface ChatMessage {
    sender: "USER" | "TRUMP";
    text: string;
}

interface ChatProps {
    className?: string;
}

const containerClasses = [
    "font-mono text-xs",
    "w-full h-full",
    "flex flex-col overflow-hidden",
    "bg-burnt-charcoal text-fossil-bone",
].join(" ");

const chatClasses = [
    "w-full h-full",
    "flex flex-col",
    "overflow-y-auto",
    "bg-crushed-clay text-fg",
].join(" ");

const barClasses = [
    "w-full p-4 gap-4",
    "flex flex-row items-stretch",
    "bg-canyon-floor text-dusty-parchment",
].join(" ");

const inputClasses = [
    "w-full h-full p-2 rounded-none",
    "border border-storm-canopy bg-transparent",
    "font-mono text-fg",
    "placeholder:italic placeholder:text-comment",
    "focus:outline-none focus:border-outback-sky",
].join(" ");

const INITIAL_MESSAGES: ChatMessage[] = [
    { sender: "TRUMP", text: "Y~M~C~A~ Wanna go island with me?" },
];

export default function Chat({ className }: ChatProps) {
    const [chatLog, setChatLog] = useState<ChatMessage[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState("");

    function sendMessage() {
        if (!input.trim()) return;

        const userMessage: ChatMessage = { sender: "USER", text: input };
        const next = [...chatLog, userMessage];

        setChatLog(next);
        setInput("");

        setTimeout(() => {
            const reply: ChatMessage = {
                sender: "TRUMP",
                text: `COMMAND_RECEIVED: "${userMessage.text}" processed. Make America GREAT again!`,
            };
            setChatLog([...next, reply]);
        }, 404);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") sendMessage();
    }

    return (
        <div className={`${containerClasses} ${className}`}>
            <div className={chatClasses}>
                {chatLog.map((msg, index) => (
                    <Message
                        key={index}
                        sender={msg.sender}
                        text={msg.text}
                        type={msg.sender === "USER" ? "send" : "receive"}
                    />
                ))}
            </div>

            <div className={barClasses}>
                <div className="min-w-0 flex-1 bg-burnt-charcoal text-comment">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your question here..."
                        className={inputClasses}
                    />
                </div>
                <Button label="Send" onClick={sendMessage} />
            </div>
        </div>
    );
}
