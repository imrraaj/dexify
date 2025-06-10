import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

const SettingsMenu = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button onClick={toggleTheme} title={theme} className="flex items-center rounded-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800">
            {theme === "dark" ? (
                <Sun className="h-4 w-4 text-emerald-400" />
            ) : (
                <Moon className="h-4 w-4 text-emerald-400" />
            )}
        </button>
    );
};

export default SettingsMenu;
