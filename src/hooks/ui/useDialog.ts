import { useContext } from "react";
import { DialogContext } from "@/components/ui/DialogProvider";

// custom alert/confirm dialogs instead of the browser's native ones
export function useDialog() {
    const ctx = useContext(DialogContext);
    if (!ctx) throw new Error("useDialog must be used within DialogProvider");
    return ctx;
}
