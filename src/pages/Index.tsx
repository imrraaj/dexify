import { useState } from "react";
import { Activity, Gauge, ShieldCheck, Sparkles, Trophy, Zap } from "lucide-react";
import SwapCard from "@/components/SwapCard";
import SendToken from "@/components/SendToken";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LimitOrderCard from "@/components/Limiter";

const metrics = [
    { label: "App fee", value: "0%", detail: "DEXify takes nothing", icon: ShieldCheck },
    { label: "Order engine", value: "TP/SL", detail: "Backend keeper execution", icon: Gauge },
    { label: "Routes", value: "V3+", detail: "Uniswap routers per chain", icon: Zap },
];

const Index = () => {
    const [activeTab, setActiveTab] = useState("swap");

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f4f1e8] text-slate-950 dark:bg-[#080b10] dark:text-white">
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-18%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(180deg,#fbfaf4_0%,#f4f1e8_58%,#ebe6d8_100%)] dark:bg-[radial-gradient(circle_at_50%_-20%,rgba(74,222,128,0.14),transparent_32%),linear-gradient(180deg,#0a0e14_0%,#080b10_55%,#07090d_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:100%_44px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)] dark:bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px)]" />
            </div>

            <div className="relative z-10 min-h-screen">
                <Header />

                <main className="mx-auto grid w-full max-w-7xl gap-3 px-2.5 pb-6 pt-1 sm:px-4 lg:grid-cols-[minmax(0,1fr)_32rem] lg:gap-5 lg:px-6 lg:pt-6">
                    <section className="order-2 hidden flex-col justify-between overflow-hidden rounded-2xl border border-slate-900/10 bg-[#faf8ef]/86 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1219]/80 dark:shadow-xl dark:shadow-black/20 md:flex lg:order-1 lg:min-h-[30rem] lg:p-7">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-emerald-400/15 bg-emerald-400/8 px-3 py-1.5 text-xs font-bold text-emerald-200">
                                <Sparkles size={14} />
                                Zero platform fee · Keeper orders
                            </div>
                            <h2 className="max-w-3xl font-display text-5xl font-extrabold leading-[0.96] tracking-[-0.06em] text-slate-950 dark:text-white xl:text-6xl">
                                A cleaner execution terminal for Uniswap routes.
                            </h2>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300/70">
                                A faster, cleaner Uniswap-powered cockpit with chain switching,
                                instant feedback, execution clarity, and a TP/SL keeper flow that
                                feels native to modern finance apps.
                            </p>
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-2.5">
                            {metrics.map((metric) => {
                                const Icon = metric.icon;
                                return (
                                    <div
                                        key={metric.label}
                                        className="group rounded-xl border border-slate-900/10 bg-white/45 p-3.5 transition hover:border-emerald-500/30 hover:bg-white/70 dark:border-white/10 dark:bg-black/20 dark:hover:border-emerald-400/30 dark:hover:bg-white/[0.045]"
                                    >
                                        <div className="mb-3 flex items-center justify-between sm:mb-6">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-200">
                                                <Icon size={18} />
                                            </span>
                                            <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-white/35 sm:text-xs sm:tracking-[0.18em]">
                                                {metric.label}
                                            </span>
                                        </div>
                                        <div className="font-display text-2xl font-extrabold tracking-[-0.05em] text-slate-950 dark:text-white">
                                            {metric.value}
                                        </div>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-white/45">{metric.detail}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-5 grid gap-2.5 md:grid-cols-[1.2fr_0.8fr]">
                            <div className="rounded-xl border border-slate-900/10 bg-white/55 p-3.5 dark:border-white/10 dark:bg-[#0a0f1b]/80">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-800 dark:text-white/70">Execution lane</span>
                                    <span className="rounded bg-emerald-400 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-950">
                                        Live
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-white/48">
                                    <Activity size={16} className="text-emerald-300" />
                                    Quote → Approve → Swap → Explorer receipt
                                </div>
                            </div>
                            <div className="rounded-xl border border-sky-500/15 bg-sky-500/8 p-3.5 dark:border-sky-300/15 dark:bg-sky-300/8">
                                <div className="flex items-center gap-3">
                                    <Trophy className="text-sky-300" size={19} />
                                    <div>
                                        <p className="text-sm font-black text-slate-950 dark:text-white">No platform fee</p>
                                        <p className="text-xs text-slate-600 dark:text-white/45">Only network + pool costs apply.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="order-1 w-full lg:order-2">
                        <Tabs
                            defaultValue="swap"
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="w-full"
                        >
                            <TabsList className="mb-2 grid h-11 grid-cols-3 rounded-xl border border-slate-900/10 bg-[#faf8ef]/90 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1219]/90 sm:mb-3 sm:h-12">
                                <TabsTrigger
                                    value="swap"
                                    className="rounded-lg text-sm font-semibold text-slate-500 transition data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:text-[#080b10] dark:text-white/50 dark:data-[state=active]:bg-white dark:data-[state=active]:text-[#080b10]"
                                >
                                    Swap
                                </TabsTrigger>
                                <TabsTrigger
                                    value="send"
                                    className="rounded-lg text-sm font-semibold text-slate-500 transition data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:text-[#080b10] dark:text-white/50 dark:data-[state=active]:bg-white dark:data-[state=active]:text-[#080b10]"
                                >
                                    Send
                                </TabsTrigger>
                                <TabsTrigger
                                    value="limit"
                                    className="rounded-lg text-sm font-semibold text-slate-500 transition data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:text-[#080b10] dark:text-white/50 dark:data-[state=active]:bg-white dark:data-[state=active]:text-[#080b10]"
                                >
                                    TP / SL
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="swap" className="mt-0">
                                <SwapCard />
                            </TabsContent>
                            <TabsContent value="send" className="mt-0">
                                <SendToken />
                            </TabsContent>
                            <TabsContent value="limit" className="mt-0">
                                <LimitOrderCard />
                            </TabsContent>
                        </Tabs>
                    </section>
                </main>

                <footer className="px-4 pb-8 text-center text-xs font-semibold uppercase tracking-[0.22em] text-white/30">
                    May the slippage be low.
                </footer>
            </div>
        </div>
    );
};

export default Index;
