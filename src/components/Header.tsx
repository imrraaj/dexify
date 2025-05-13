import SettingsMenu from "./SettingsMenu";

const Header = () => {
    return (
        <header className="w-full py-4 px-4 sm:px-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-white"
                            >
                                <path d="M16 3h5v5" />
                                <path d="M8 3H3v5" />
                                <path d="M3 16v5h5" />
                                <path d="M16 21h5v-5" />
                                <path d="m21 3-9 9" />
                                <path d="M3 21 12 12" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">
                            DEXify
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <SettingsMenu />
                </div>
            </div>
        </header>
    );
};

export default Header;
