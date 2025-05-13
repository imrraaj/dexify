import { SettingsContext, SettingsContextType } from "@/providers/SettingsProvider";
import { useContext } from "react";

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};