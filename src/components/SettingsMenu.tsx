import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

const SettingsMenu = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-emerald-300 transition hover:bg-white/[0.09] sm:h-10 sm:w-10"
        >
            {theme === "dark" ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </button>
    );
};

export default SettingsMenu;
