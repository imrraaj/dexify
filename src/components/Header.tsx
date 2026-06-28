import { Sparkles } from "lucide-react";
import ChainSwitcher from "./ChainSwitcher";
import SettingsMenu from "./SettingsMenu";

const Header = () => {
    return (
        <header className="sticky top-0 z-40 w-full px-2.5 py-2 sm:px-6 sm:py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between rounded-xl border border-white/10 bg-[#0b1017]/82 px-2.5 py-2 shadow-xl shadow-black/20 backdrop-blur-xl sm:rounded-2xl sm:px-4 sm:py-2.5">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#080b10] shadow-sm sm:h-9 sm:w-9">
                        <Sparkles size={19} />
                        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-[#0b1017] sm:h-2.5 sm:w-2.5" />
                    </div>
                    <div>
                        <h1 className="font-display text-base font-extrabold tracking-[-0.05em] text-white sm:text-2xl">
                            DEXify
                        </h1>
                        <p className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300/70 sm:block">
                            zero-fee swap arcade
                        </p>
                    </div>
                </div>

                <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-white/55 md:flex">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.65)]" />
                    Keeper engine online
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <ChainSwitcher />
                    <SettingsMenu />
                </div>
            </div>
        </header>
    );
};

export default Header;
