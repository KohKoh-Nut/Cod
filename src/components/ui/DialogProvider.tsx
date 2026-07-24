"use client";

import { createContext, useCallback, useRef, useState } from "react";
import Popup from "@/components/ui/Popup";

type DialogKind = "alert" | "confirm";

interface DialogState {
    kind: DialogKind;
    title: string;
    message: string;
}

export interface DialogContextValue {
    alert: (message: string, title?: string) => Promise<void>;
    confirm: (message: string, title?: string) => Promise<boolean>;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

// promise-based alert/confirm, rendered through the shared Popup instead
// of the browser's built-in dialogs. Mounted once near the app root.
export default function DialogProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [dialog, setDialog] = useState<DialogState | null>(null);
    // holds the resolver for whichever promise is currently open, so the
    // popup's buttons can settle it later
    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const alert = useCallback((message: string, title = "Notice") => {
        return new Promise<void>((resolve) => {
            resolveRef.current = () => resolve();
            setDialog({ kind: "alert", message, title });
        });
    }, []);

    const confirm = useCallback((message: string, title = "Confirm") => {
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
            setDialog({ kind: "confirm", message, title });
        });
    }, []);

    // resolves the pending promise and hides the dialog
    const close = (result: boolean) => {
        resolveRef.current?.(result);
        resolveRef.current = null;
        setDialog(null);
    };

    return (
        <DialogContext.Provider value={{ alert, confirm }}>
            {children}

            <Popup
                isOpen={!!dialog}
                onClose={() => close(false)}
                title={dialog?.title}
                maxWidth="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-fg-muted leading-relaxed">
                        {dialog?.message}
                    </p>
                    <div className="flex gap-2 justify-end">
                        {dialog?.kind === "confirm" && (
                            <button
                                onClick={() => close(false)}
                                className="px-4 py-2 text-xs font-bold font-mono uppercase border border-border text-fg-muted hover:text-fg transition"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={() => close(true)}
                            className="px-4 py-2 text-xs font-bold font-mono uppercase bg-brand hover:bg-brand-hover text-bg transition"
                        >
                            {dialog?.kind === "confirm" ? "Confirm" : "OK"}
                        </button>
                    </div>
                </div>
            </Popup>
        </DialogContext.Provider>
    );
}
