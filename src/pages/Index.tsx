import { useState } from "react";
import SwapCard from "@/components/SwapCard";
import SendToken from "@/components/SendToken";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
    const [activeTab, setActiveTab] = useState("swap");

    return (
        <div className="min-h-screen bg-[radial-gradient(#1f2937_1px,transparent_0)] bg-[length:10px_10px] dark:bg-[radial-gradient(#1f2937_1px,transparent_0)] dark:bg-[length:10px_10px]">
            <div className="mx-auto md:px-4 min-h-screen w-screen backdrop-blur-sm">
                <div className="container mx-auto">
                    <Header />
                </div>

                <main className="flex flex-col items-center justify-center px-4 py-8">
                    <Tabs
                        defaultValue="swap"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full max-w-lg"
                    >
                        <TabsList className="grid grid-cols-2 mb-4 bg-emerald-100/30 dark:bg-emerald-800/30">
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

                <footer className="py-6 text-center text-sm text-emerald-500 dark:text-base-muted">
                    <p>May the force be with you!</p>
                </footer>
            </div>

            {/* Background gradient effect */}
            <div className="fixed top-0 left-0 right-0 h-[50vh] pointer-events-none -z-10 blur-sm">
                {/* <div className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div> */}
                {/* <div className="absolute -z-10 inset-0 h-full w-full bg-[linear-gradient(to_right,#73737320_1px,transparent_1px),linear-gradient(to_bottom,#73737320_1px,transparent_1px)] bg-[size:200px_200px]" /> */}
            </div>
        </div>
    );
};

export default Index;
