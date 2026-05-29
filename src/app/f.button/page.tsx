'use client';
import Link from "next/link";
import { useState } from "react";
import FloatingButton from "@/components/Button/FloatingButton";


export default function FloatingMainBtn (){
    const [isVisible, setIsVisible] = useState<boolean>(false);

    return(
        <main className="min-h-screen bg-slate-950 font-mono relative">

            {/* main button */}
            <button className="absolute bottom-8 left-1 w-20 h-20 flex items-center justify-center rounded-full font-bold text-xl bg-cyan-950/30 border border-cyan-500 text-cyan-400 uppercase tracking-wider hover:bg-cyan-500 hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            Start
            </button>

            {/* Button enlarged when hovering */}
            {isVisible && (
                <div>
                <Link href="/profile"
                      className="absolute bottom-8 left-24 w-20 h-20 flex items-center justify-center rounded-full font-bold text-xs bg-fuchsia-950/30 border border-fuchsia-500 text-fuchsia-400 uppercase tracking-wider hover:bg-fuchsia-500 hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(240,46,170,0.2)]"> 
                    Profile
                </Link>

                <Link href="/settings"
                      className="absolute bottom-8 left-48 w-20 h-20 flex items-center justify-center rounded-full font-bold text-xs bg-red-950/30 border border-red-500 text-red-400 uppercase tracking-wider hover:bg-red-500 hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]"> 
                    Settings
                </Link>

                <Link href="/sandbox"
                      className="absolute bottom-8 left-72 w-20 h-20 flex items-center justify-center rounded-full font-bold text-xs bg-fuchsia-950/30 border border-fuchsia-500 text-fuchsia-400 uppercase tracking-wider hover:bg-fuchsia-500 hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(240,46,170,0.2)]"> 
                    Sandbox
                </Link>

                <Link href="/leaderboard"
                      className="absolute bottom-8 left-96 w-20 h-20 flex items-center justify-center rounded-full font-bold text-xs bg-red-950/30 border border-red-500 text-red-400 uppercase tracking-wider hover:bg-red-500 hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]"> 
                    Leaderboard
                </Link>
            </div>
                )}
                
            <FloatingButton
                label="Start"
                onMouseEnter={() => setIsVisible(!isVisible) }
                onMouseLeave={() => setIsVisible(!isVisible)}
            />

        </main>    
    );
}