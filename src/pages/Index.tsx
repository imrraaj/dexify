import { useState } from "react";
import SwapCard from "@/components/SwapCard";
import SendToken from "@/components/SendToken";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
    const [activeTab, setActiveTab] = useState("swap");

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 dark:from-base-background dark:to-zinc-900 text-zinc-900 dark:text-base-text transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-7xl">
                <Header />

                <main className="flex flex-col items-center justify-center px-4 py-8">
                    <Tabs
                        defaultValue="swap"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full max-w-md"
                    >
                        <TabsList className="grid grid-cols-2 mb-4 bg-emerald-100/30 dark:bg-zinc-800/30">
                            <TabsTrigger
                                value="swap"
                                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-600"
                            >
                                Swap
                            </TabsTrigger>
                            <TabsTrigger
                                value="send"
                                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-600"
                            >
                                Send
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="swap">
                            <SwapCard />
                        </TabsContent>
                        <TabsContent value="send">
                            <SendToken />
                        </TabsContent>
                    </Tabs>
                </main>

                <footer className="py-6 text-center text-sm text-zinc-500 dark:text-base-muted">
                    <p>© 2025 DEXify • Self-hosted swap interface</p>
                </footer>
            </div>

            {/* Background gradient effect */}
            <div className="fixed top-0 left-0 right-0 h-[50vh] pointer-events-none -z-10">
                <div className="absolute inset-0 bg-gradient-radial from-emerald-200/10 to-transparent dark:from-emerald-500/5 dark:to-transparent"></div>
            </div>
        </div>
    );
};

export default Index;
