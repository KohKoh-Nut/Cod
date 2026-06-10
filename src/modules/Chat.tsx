"use client";
import { useState } from "react";
import Button from "../components/Button";

interface ChatMessage {
    sender: "USER" | "TRUMP";
    text: string;
}

interface ChatProps {
    className?: string;
}

/**
 * Chat terminal variant featuring simulated agent responses and message streaming.
 */
export default function Chat({ className }: ChatProps) {
    const [chatLog, setchatLog] = useState<ChatMessage[]>([
        { sender: "TRUMP", text: "Y~M~C~A~ Wanna go island with me?" },
    ]);
    const [typeValue, settypeValue] = useState<string>("");

    const Send = () => {
        if (!typeValue.trim()) return;

        const userMessage: ChatMessage = {
            sender: "USER",
            text: typeValue,
        };

        const updatedMessages = [...chatLog, userMessage];
        setchatLog(updatedMessages);
        settypeValue("");

        // Simulated automated response delay
        setTimeout(() => {
            const aiReply: ChatMessage = {
                sender: "TRUMP",
                text: `COMMAND_RECEIVED: "${userMessage.text}" processed. Make America GREAT again!`,
            };
            setchatLog([...updatedMessages, aiReply]);
        }, 404);
    };

    // Structural and theme container classes
    const baseContainer = [
        "font-mono text-xs",
        "w-full h-full",
        "flex flex-col overflow-hidden",
        "bg-burnt-charcoal text-fossil-bone",
    ].join(" ");

    const baseBar = [
        "w-full p-4 gap-4",
        "flex flex-row items-stretch",
        "bg-canyon-floor text-dusty-parchment",
    ].join(" ");

    const baseInput = [
        "w-full h-full p-2 rounded-none",
        "border border-storm-canopy bg-transparent",
        "font-mono text-fg",
        "placeholder:italic placeholder:text-comment",
        "focus:outline-none focus:border-outback-sky",
    ].join(" ");

    const baseChat = [
        "w-full h-full",
        "flex flex-col",
        "overflow-y-auto",
        "bg-crushed-clay text-fg",
    ].join(" ");

    // Message layout variations
    const baseMessage = [
        "p-4 max-w-[80%]",
        "border leading-relaxed break-words",
    ].join(" ");
    const userMessage = [
        "self-end text-eucalyptus-leaf",
        "bg-ancient-pine border-swamp-murk",
    ].join(" ");
    const botMessage = [
        "self-start text-shale-green",
        "bg-sunken-timber border-deep-teal",
    ].join(" ");

    return (
        <div className={`${baseContainer} ${className}`}>
            <div className={baseChat}>
                {chatLog.map((msg, index) => (
                    <div
                        key={index}
                        className={`${baseMessage} ${
                            msg.sender === "USER" ? userMessage : botMessage
                        }`}
                    >
                        <span className="font-bold block mb-1">
                            [{msg.sender}]:
                        </span>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className={baseBar}>
                <div className="min-w-0 flex-1 bg-burnt-charcoal text-comment">
                    <input
                        type="text"
                        value={typeValue}
                        onChange={(e) => settypeValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                Send();
                            }
                        }}
                        placeholder="Type your question here..."
                        className={baseInput}
                    />
                </div>
                <Button label="Send" onClick={Send} />
            </div>
        </div>
    );
}
